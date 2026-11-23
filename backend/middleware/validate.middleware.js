/**
 * Zod request-body validation middleware.
 * Replaces req.body with the parsed/whitelisted payload.
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request',
        issues: result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    req.body = result.data;
    return next();
  };
}

module.exports = { validate };
