require('dotenv').config();
const crypto = require('crypto');

function readEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const missing = [];

  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.MONGODB_NAME) missing.push('MONGODB_NAME');

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values.'
    );
  }

  let jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'dev_secret') {
    if (isProd) {
      throw new Error('JWT_SECRET must be set to a strong random value in production.');
    }
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[env] JWT_SECRET not set — using an ephemeral development secret.');
  }

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:4200';
  const extraOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    isProd,
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGODB_URI,
    mongoName: process.env.MONGODB_NAME,
    clientUrl,
    allowedOrigins: Array.from(
      new Set([clientUrl, 'http://localhost:4200', 'http://localhost:3000', ...extraOrigins])
    ),
    jwtSecret,
    ai: {
      apiKey: process.env.AI_API_KEY || '',
      baseUrl: (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, ''),
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      dailyQuota: Number(process.env.AI_DAILY_QUOTA || 300)
    }
  };
}

const config = readEnv();

module.exports = config;
