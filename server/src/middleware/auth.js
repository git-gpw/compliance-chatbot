const config = require('../config');

module.exports = function authMiddleware(req, res, next) {
  const password = req.headers['x-app-password'];
  if (!password || password !== config.appPassword) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
