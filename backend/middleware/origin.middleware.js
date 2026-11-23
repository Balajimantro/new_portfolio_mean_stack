const config = require('../config/env');

/**
 * CSRF defence for cookie-authenticated, state-changing admin routes.
 * Browsers send Origin on cross-site POST/PUT/DELETE; if it is present and
 * not on the allowlist we reject. Non-browser clients (no Origin) are allowed
 * because they cannot ride a victim's cookie.
 */
function requireTrustedOrigin(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  const fetchSite = req.get('sec-fetch-site');

  if (fetchSite === 'cross-site') {
    return res.status(403).json({ message: 'Cross-site request blocked' });
  }

  if (origin && !config.allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: 'Origin not allowed' });
  }

  return next();
}

module.exports = { requireTrustedOrigin };
