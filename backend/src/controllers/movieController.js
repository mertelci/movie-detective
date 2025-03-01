const movieService = require('../services/movieService');

class MovieController {
    async testConnection(req, res) {
        try {
            await movieService.testApiConnection();
            res.json({ 
                status: 'success', 
                message: 'TMDB API connection successful',
                apiKeyWorks: true
            });
        } catch (error) {
            res.status(500).json({ 
                status: 'error', 
                message: 'TMDB API connection failed',
                apiKeyWorks: false,
                error: error.message
            });
        }
    }

    async getMovieRecommendation(req, res) {
        try {
            const movieData = await movieService.getMovieRecommendation(req.body);
            res.json(movieData);
        } catch (error) {
            console.error('Error in getMovieRecommendation:', error);
            res.status(500).json({ 
                message: error.message || 'An error occurred while getting movie recommendation.'
            });
        }
    }

    async getGenres(req, res) {
        try {
            const { language = 'en' } = req.query;
            const genres = await movieService.getGenres(language);
            res.json(genres);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ 
                message: 'An error occurred while getting movie genres.'
            });
        }
    }

    async getMovieById(req, res) {
        try {
            const { movieId } = req.params;
            const { language = 'en' } = req.query;
            const movieDetails = await movieService.getMovieDetails(movieId, language);
            res.json(movieDetails);
        } catch (error) {
            console.error('Error in getMovieById:', error);
            res.status(500).json({ 
                message: 'An error occurred while getting movie details.'
            });
        }
    }

    async searchPerson(req, res) {
        try {
            const { query, language = 'en' } = req.query;
            const people = await movieService.searchPerson(query, language);
            res.json(people);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ 
                message: 'An error occurred while searching for person.'
            });
        }
    }
}

module.exports = new MovieController();