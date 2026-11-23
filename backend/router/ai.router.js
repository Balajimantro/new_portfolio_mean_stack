const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const config = require('../config/env');
const { validate } = require('../middleware/validate.middleware');
const { chatSchema, leadSchema } = require('../validators/schemas');
const { authMiddleware } = require('../middleware/auth.middleware');
const aiService = require('../services/ai.service');

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: config.isProd ? 12 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many messages. Please wait a moment and try again.' }
});

router.post('/chat', chatLimiter, validate(chatSchema), async (req, res, next) => {
  try {
    await aiService.streamChat(req, res, req.body.messages);
  } catch (error) {
    next(error);
  }
});

router.post('/lead', authMiddleware, validate(leadSchema), async (req, res, next) => {
  try {
    const result = await aiService.analyzeLead(req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
