const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/test', movieController.testConnection);
router.post('/recommend', movieController.getMovieRecommendation);
router.get('/genres', cacheMiddleware(86400), movieController.getGenres);
router.get('/movies/:movieId', movieController.getMovieById);
router.get('/search/person', movieController.searchPerson);

module.exports = router;