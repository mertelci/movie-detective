import axios from 'axios';

const baseURL = import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : '/api' ;

const api = axios.create({
    baseURL,
    timeout: 10000,
});

export interface MovieFilters {
    genres: string[];
    yearRange: string;
    language: string[];  // Changed to array for multiple language selection
    actorId?: string;
    popularity?: 'high' | 'medium' | 'low' | 'all';
}

export interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;  // Oy sayısı eklendi
    runtime: number;
    genres: Array<{
        id: number;
        name: string;
    }>;
    director: string;
    trailer: string;
    imdb_id: string;
    credits: {
        cast: Array<{
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
        }>;
        director: {
            id: number;
            name: string;
        } | null;
    };
}

export interface Genre {
    id: number;
    name: string;
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
}

const apiService = {
    getRecommendation: async (filters: MovieFilters): Promise<MovieDetails> => {
        try {
            const response = await api.post(`/recommend`, filters);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data) {
                throw error.response.data;
            }
            throw { message: 'An error occurred' };
        }
    },

    getGenres: async (language: string[]): Promise<Genre[]> => {
        const response = await api.get(`/genres`, {
            params: { language: language[0] } // Use first selected language
        });
        return response.data.genres;
    },

    getMovieDetails: async (movieId: number, language: string[]): Promise<MovieDetails> => {
        const response = await api.get(`/movies/${movieId}`, {
            params: { language: language[0] } // Use first selected language
        });
        return response.data;
    },

    searchPerson: async (query: string, language: string[]): Promise<Person[]> => {
        const response = await api.get(`/search/person`, {
            params: { 
                query, 
                language: language[0] // Use first selected language
            }
        });
        return response.data;
    }
};

export default apiService;