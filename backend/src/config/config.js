const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    PORT: process.env.PORT || 5000,
    
    POPULARITY_LEVELS: {
        veryhigh: 10000,
        high: 5000,
        medium: 1000,
        low: 100
    },
};