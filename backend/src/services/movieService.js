const axios = require('axios');
const { TMDB_API_KEY, TMDB_BASE_URL } = require('../config/config');

class MovieService {
    async getMovieDetails(movieId, language) {
        const [movieDetails, credits, videos, externalIds, ratings] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
                params: { api_key: TMDB_API_KEY, language }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, {
                params: { api_key: TMDB_API_KEY }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
                params: { api_key: TMDB_API_KEY }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}/external_ids`, {
                params: { api_key: TMDB_API_KEY }
            }),
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}/release_dates`, {
                params: { api_key: TMDB_API_KEY }
            })
        ]);

        const director = credits.data.crew.find(person => person.job === 'Director');
        const trailer = videos.data.results.find(video => 
            (video.type === 'Trailer' || video.type === 'Teaser') && 
            video.site === 'YouTube'
        );

        const usRating = ratings.data.results
            .find(r => r.iso_3166_1 === 'US')
            ?.release_dates
            ?.find(rd => rd.certification)
            ?.certification || '';

        return {
            ...movieDetails.data,
            director: director ? director.name : null,
            trailer: trailer ? trailer.key : null,
            imdb_id: externalIds.data.imdb_id || null,
            certification: usRating,
            credits: {
                cast: credits.data.cast || [],
                director: director || null
            }
        };
    }

    async getGenres(language = 'en-US') {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: TMDB_API_KEY,
                language
            }
        });
        return response.data;
    }

    async searchPerson(query, language = 'en-US') {
        const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
            params: {
                api_key: TMDB_API_KEY,
                query,
                language
            }
        });

        return response.data.results
            .filter(person => person.known_for_department === 'Acting' || person.known_for_department === 'Directing')
            .map(person => ({
                id: person.id,
                name: person.name,
                profile_path: person.profile_path,
                known_for_department: person.known_for_department
            }));
    }

    async testApiConnection() {
        const response = await axios.get(`${TMDB_BASE_URL}/configuration`, {
            params: { api_key: TMDB_API_KEY }
        });
        return response.data;
    }

    async getMovieRecommendation(filters) {
        const { genres, yearRange, language, actorId, popularity = 'all' } = filters;
        
        let params = {
            api_key: TMDB_API_KEY,
            ...(genres?.length > 0 && { with_genres: genres.join(',') }),
            ...(language?.length > 0 && { with_original_language: language.join('|') }),
            ...(yearRange !== 'all' && {
                'primary_release_date.gte': `${yearRange.split('-')[0]}-01-01`,
                'primary_release_date.lte': `${yearRange.split('-')[1]}-12-31`,
            }),
            ...(actorId && { 'with_cast': actorId }),
            sort_by: 'vote_average.desc',
            include_adult: false,
            page: 1,
            language: 'en-US',
            'vote_count.gte': 50
        };

        this._applyPopularityFilter(params, popularity);

        const totalPagesResponse = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
        const totalPages = Math.min(totalPagesResponse.data.total_pages, 20);

        if (totalPages === 0) {
            throw new Error('No movies found with these criteria');
        }

        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        params.page = randomPage;
        
        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
        const validMovies = response.data.results.filter(movie => 
            movie.poster_path && 
            movie.release_date &&
            movie.vote_average &&
            movie.overview
        );

        if (validMovies.length === 0) {
            throw new Error('No valid movies found with these criteria');
        }

        const randomIndex = Math.floor(Math.random() * validMovies.length);
        const selectedMovie = validMovies[randomIndex];
        return this.getMovieDetails(selectedMovie.id, 'en-US');
    }

    _applyPopularityFilter(params, popularity) {
        switch (popularity) {
            case 'high':
                params['vote_count.gte'] = 5000;
                break;
            case 'medium':
                params['vote_count.gte'] = 1000;
                params['vote_count.lte'] = 4999;
                break;
            case 'low':
                params['vote_count.gte'] = 100;
                params['vote_count.lte'] = 999;
                break;
            default:
                params['vote_count.gte'] = 50;
        }
    }
}

module.exports = new MovieService();