# Balaji Portfolio

A full-stack developer portfolio built with Angular 19 and the MEAN stack, featuring a real-time 3D hero, an admin CMS, and an AI copilot that answers recruiter questions from live portfolio data.

## Highlights

- **Aurora Glass UI** — dark-first design system with a light theme toggle, glassmorphism, gradient accents and scroll-reveal motion.
- **3D hero** — lazy-loaded Three.js scene (custom shader crystal, orbit rings, particle field) that reacts to the pointer and scroll. Falls back to CSS on reduced-motion or unsupported devices.
- **Content-driven sections** — skills bento grid, filterable project cards with 3D tilt, and a contact form with inline validation.
- **Admin CMS** — cookie/JWT auth, skills and projects CRUD, profile links, CV upload to Cloudinary, contact inbox.
- **AI copilot** — streaming "Ask Balaji" assistant with topic guardrails, per-IP rate limiting and a daily quota.
- **AI lead assistant** — summarizes each contact message, classifies it (recruiter / client / spam) and drafts a reply.
- **Hardened API** — zod validation, helmet, rate limits, CSRF origin checks, upload limits, structured errors and graceful shutdown.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | Angular 19 (standalone), TypeScript, RxJS, Bootstrap grid |
| 3D / motion | Three.js (lazy chunk), CSS 3D, IntersectionObserver |
| Backend | Node.js, Express 5, MongoDB driver |
| Auth | JWT in an httpOnly cookie, bcrypt |
| Integrations | Cloudinary (CV), Nodemailer (SMTP), OpenAI-compatible AI API |
| Hosting | Netlify (frontend + `/api` proxy) → Render (API) |

## Getting started

```bash
# 1. Frontend
npm install
npm start                 # http://localhost:4200 (proxies /api to :3000)

# 2. Backend
cd backend
npm install
cp .env.example .env      # fill in Mongo, JWT secret, SMTP, Cloudinary, AI
npm start                 # http://localhost:3000
```

`proxy.conf.json` forwards `/api` from the Angular dev server to the API, so no CORS setup is needed locally.

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI`, `MONGODB_NAME` | Database connection |
| `JWT_SECRET` | **Required in production.** `openssl rand -hex 48` |
| `CLIENT_URL`, `ALLOWED_ORIGINS` | CORS + CSRF origin allowlist |
| `SMTP_*` | Contact form notifications |
| `CLOUDINARY_*` | CV upload |
| `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_DAILY_QUOTA` | Copilot + lead assistant |

The AI integration uses any OpenAI-compatible endpoint (OpenAI, Groq, Together, Gemini's compatibility layer). Without `AI_API_KEY`, the copilot returns a friendly "offline" fallback and the admin assistant falls back to a local heuristic — the rest of the site keeps working.

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Angular dev server on :4200 |
| `npm run start:backend` | Express API on :3000 |
| `npm run build` | Production build |
| `npm test` | Unit tests (Karma) |

## API

```
GET    /health
GET    /api/portfolio/getAllPortfolioData
GET    /api/portfolio/cv

POST   /api/contact/saveContactForm        (validated, rate limited)

POST   /api/admin/login                    (rate limited)
GET    /api/admin/me
POST   /api/admin/logout
PUT    /api/admin/profile
POST   /api/admin/cv                       (PDF, max 5 MB)
POST   /api/admin/skills
PUT    /api/admin/skills/:id
DELETE /api/admin/skills/:id
POST   /api/admin/projects
PUT    /api/admin/projects/:id
DELETE /api/admin/projects/:id
GET    /api/admin/contacts?limit=50

POST   /api/ai/chat                        (SSE stream, public, rate limited)
POST   /api/ai/lead                        (admin, AI summary + draft reply)
```

## Project structure

```
src/app/
  pages/          home (+ hero-scene), skills, projects, contact, admin, ai-chat
  services/       master, admin, auth, theme, ui
  shared/         tilt + reveal directives, theme service
backend/
  config/         env validation
  controller/     route handlers
  middleware/     auth, validation, CSRF origin, errors
  router/         portfolio, contact, admin, ai
  services/       ai.service (provider client, prompts, quota)
  validators/     zod schemas
```

## Security notes

- Admin cookies are `httpOnly`; state-changing routes require a trusted origin (CSRF defence).
- All request bodies are validated and whitelisted with zod.
- Uploads are PDF-only and capped at 5 MB.
- API errors return safe messages plus a request ID; details stay in server logs.
- Contact submissions are persisted before email is attempted, so an SMTP outage never loses a lead.

## Deployment

Netlify builds the Angular app and proxies `/api/*` to the Render service (see `netlify.toml`). Set `CLIENT_URL` on Render to the Netlify URL and add your custom domain to `ALLOWED_ORIGINS`.
