const { z } = require('zod');

const trimmed = (min, max) => z.string().trim().min(min).max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Must be an http(s) URL')
  .optional()
  .default('');

const partialUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => value === '' || /^https?:\/\//i.test(value), 'Must be an http(s) URL')
  .optional();

const email = z
  .string()
  .trim()
  .min(3)
  .max(200)
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Invalid email address');

const loginSchema = z.object({
  username: trimmed(1, 80),
  password: z.string().min(1).max(200)
});

const contactSchema = z.object({
  name: trimmed(2, 80),
  email,
  subject: trimmed(3, 120),
  message: trimmed(10, 2000),
  website: z.string().max(0).optional().default('')
});

const skillSchema = z.object({
  technology: trimmed(1, 80),
  level: trimmed(1, 40),
  languages: z
    .array(z.string().trim().min(1).max(60))
    .max(40)
    .optional()
    .default([])
});

const projectSchema = z.object({
  title: trimmed(1, 120),
  description: trimmed(1, 1200),
  technology: z.array(z.string().trim().min(1).max(60)).max(40).optional().default([]),
  image: optionalUrl,
  githubLink: optionalUrl,
  publishLink: optionalUrl
});

const profileSchema = z
  .object({
    gitHubProfileLink: partialUrl,
    linkdinProfileLink: partialUrl,
    mailId: z.union([z.literal(''), email]).optional(),
    cvLink: partialUrl
  })
  .strict();

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(2000)
      })
    )
    .min(1)
    .max(12)
});

const leadSchema = z.object({
  name: z.string().trim().max(100).optional().default(''),
  email: z.string().trim().max(200).optional().default(''),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(1).max(2000)
});

module.exports = {
  loginSchema,
  contactSchema,
  skillSchema,
  projectSchema,
  profileSchema,
  chatSchema,
  leadSchema
};
