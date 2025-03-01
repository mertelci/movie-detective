const express = require('express');
const cors = require('cors');
const path = require('path');
const movieRoutes = require('./src/routes/movieRoutes');
const { PORT } = require('./src/config/config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', movieRoutes);

// Serve static files in production
if(process.env.NODE_ENV === 'production') {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, '../frontend/movie/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/movie/dist/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'An error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});