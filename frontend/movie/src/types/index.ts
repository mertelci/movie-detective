import { Genre } from "../services/api";

export interface FavoriteMovie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    overview: string;
    imdb_id: string | null;
    trailer: string | null;
}

export interface RecommendationParams {
    genres: string[];
    yearRange: string;
    language: string[];
    actorId?: string;
    popularity?: 'veryhigh' | 'high' | 'medium' | 'low' | 'all';
}

export interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    release_date: string;
    vote_average: number;
    vote_count: number;
    runtime: number;
    genres: Genre[];
    director: string | null;
    imdb_id: string | null;
    trailer: string | null;
}

export const mapMovieToFavorite = (movie: MovieDetails): FavoriteMovie => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,
    imdb_id: movie.imdb_id,
    trailer: movie.trailer
});