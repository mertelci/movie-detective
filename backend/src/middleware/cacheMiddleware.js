const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });

const cacheMiddleware = (duration) => (req, res, next) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
        return res.json(cachedResponse);
    }

    const originalJson = res.json;
    res.json = (body) => {
        cache.set(key, body, duration);
        return originalJson.call(res, body);
    };

    next();
};

module.exports = cacheMiddleware;