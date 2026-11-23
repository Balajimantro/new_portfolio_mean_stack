const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');

const config = require('./config/env');
const { connectDb, pingDb, closeDb } = require('./mongoDb');
const { requestId, notFound, errorHandler } = require('./middleware/error.middleware');
const { requireTrustedOrigin } = require('./middleware/origin.middleware');
const getAllPortfolioRouter = require('./router/getAllData.router');
const saveContactUsDataRouter = require('./router/saveContactUsData.router');
const adminRouter = require('./router/admin.router');
const aiRouter = require('./router/ai.router');

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // API only; the Angular app sets its own policy
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || config.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true
  })
);

if (!config.isProd) {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(requestId);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isProd ? 300 : 3000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.isProd ? 6 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.isProd ? 10 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' }
});

app.get('/health', async (req, res) => {
  const dbOk = await pingDb();
  const status = dbOk ? 200 : 503;
  return res.status(status).json({
    status: dbOk ? 'ok' : 'degraded',
    db: dbOk,
    uptime: Math.round(process.uptime()),
    time: new Date().toISOString()
  });
});

app.use('/api', apiLimiter);
app.use('/api/portfolio', getAllPortfolioRouter);
app.use('/api/contact', contactLimiter, saveContactUsDataRouter);
app.use('/api/admin/login', loginLimiter);
app.use('/api/admin', requireTrustedOrigin, adminRouter);
app.use('/api/ai', aiRouter);

app.use(notFound);
app.use(errorHandler);

let server;

async function startServer() {
  await connectDb();

  server = app.listen(config.port, () => {
    console.log(`[server] listening on :${config.port} (${config.isProd ? 'production' : 'development'})`);
  });

  server.on('error', (error) => {
    console.error('[server] failed to start:', error.message);
  });

  return server;
}

async function shutdown(signal) {
  console.log(`[server] ${signal} received — shutting down`);
  const force = setTimeout(() => process.exit(1), 10_000);
  force.unref();

  if (server) {
    server.close(async () => {
      await closeDb().catch(() => {});
      clearTimeout(force);
      process.exit(0);
    });
  } else {
    await closeDb().catch(() => {});
    process.exit(0);
  }
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('[server] startup failed:', error.message);
    process.exit(1);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  console.error('[server] unhandled rejection:', reason);
});

module.exports = { app, startServer };
