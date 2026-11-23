const crypto = require('crypto');

function requestId(req, res, next) {
  req.id = req.get('x-request-id') || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}

function notFound(req, res) {
  res.status(404).json({ message: 'Not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, req, res, next) {
  let status = error.status || error.statusCode || 500;

  // Database outages are temporary: surface as 503 rather than a generic 500.
  if (!error.status && /Mongo(ServerSelection|Network|Topology)/i.test(error.name || '')) {
    status = 503;
  }

  // Multer limits / malformed payloads are client errors.
  if (error.name === 'MulterError' || (error.code && String(error.code).startsWith('LIMIT_'))) {
    status = 400;
  }
  if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    status = 400;
  }

  if (status >= 500 && !error.expected) {
    console.error(`[error] ${req.method} ${req.originalUrl} (${req.id || 'no-id'})`, error);
  }

  if (res.headersSent) {
    return res.end();
  }

  const safeMessages = {
    400: error.message || 'Invalid request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: error.message || 'Not found',
    429: error.message || 'Too many requests',
    502: error.message || 'Upstream service error',
    503: error.message || 'Service temporarily unavailable'
  };

  return res.status(status).json({
    message: safeMessages[status] || 'Something went wrong on our side',
    requestId: req.id
  });
}

module.exports = { requestId, notFound, errorHandler };
