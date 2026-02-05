const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const cookieToken = req.cookies ? req.cookies.admin_token : null;
  const token =  cookieToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(200).json({ message: 'Unauthorized' });
  }
}

module.exports = { authMiddleware };
