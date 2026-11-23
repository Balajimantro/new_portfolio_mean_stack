const jwt = require('jsonwebtoken');
const config = require('../config/env');

function authMiddleware(req, res, next) {
  const token = req.cookies ? req.cookies.admin_token : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { authMiddleware };
