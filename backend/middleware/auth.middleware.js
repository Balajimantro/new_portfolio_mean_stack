const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const cookieToken = req.cookies ? req.cookies.admin_token : null;
  const token =  cookieToken;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', error: 'No token provided', token: token });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized', error: error.message, token: token  });
  }
}

module.exports = { authMiddleware };
