# HireShield AI

AI-powered scam detection for suspicious job and internship messages. Built for the hackathon.

## Tech Stack

- **Frontend:** Plain HTML, CSS, vanilla JavaScript (no frameworks)
- **Dev server:** Vite (used only as a dev server, not a framework)
- **Backend:** Node.js HTTP server (`api/server.js`) for AI analysis
- **Auth & Database:** Supabase (PostgreSQL + auth)
- **AI:** Server-side API integration (provider key stored server-side only)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server (frontend):

```bash
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api/*` to the backend.

In a separate terminal, run the API server:

```bash
npm run server
```

The API server runs on `http://localhost:8787`.

## Project Structure

```
├── index.html              # App entry HTML
├── vite.config.js          # Vite dev server config (proxy + build)
├── package.json
├── public/
│   └── favicon.svg         # Shield logo
├── src/
│   ├── app.js              # App bootstrap + route registration
│   ├── styles/
│   │   └── main.css        # Design system: tokens, components, layout
│   ├── js/
│   │   ├── router.js       # Vanilla JS router (history API, back/forward)
│   │   ├── shell.js        # Shared sidebar + navbar + auth state
│   │   ├── supabaseClient.js  # Browser-safe Supabase client (anon key)
│   │   ├── icons.js        # Inline SVG icon set
│   │   └── toast.js        # Toast notification system
│   └── pages/
│       ├── landing.js      # Landing page
│       ├── login.js        # Login / Sign up
│       ├── dashboard.js    # Dashboard overview
│       ├── scanner.js      # Message scanner (AI analysis input)
│       ├── results.js      # Analysis results display
│       ├── history.js      # Scan history
│       ├── safety.js       # Safety center (educational content)
│       └── profile.js      # Profile & settings
├── api/
│   └── server.js           # Server-side API (AI analysis endpoint)
└── .env                    # Supabase URL + anon key (VITE_ prefixed)
```

## What's Implemented

- Full design system with dark cybersecurity aesthetic (CSS variables, cards, buttons, forms, toasts, risk badges)
- Vanilla JS router with browser back/forward support
- Shared sidebar + navbar shell with auth-aware user display
- All 8 page screens with layouts and content stubs
- Landing page with hero and feature cards
- Login/Sign up page with Supabase auth integration
- Dashboard with stat cards and quick actions
- Message Scanner form with API call to backend
- Safety Center with educational scam-prevention content
- Server-side API with `/api/analyze` and `/api/health` endpoints
- Toast notification system
- Responsive layout (mobile sidebar toggle, adaptive grids)

## What Remains to Configure

1. **AI provider API key** — Set `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`) in the server-side environment. The `/api/analyze` endpoint currently returns a placeholder result without it.
2. **AI analysis implementation** — The actual AI prompt and response parsing in `api/server.js` needs to be implemented once a key is available.
3. **Supabase database tables** — Tables for storing scan history (e.g. `scans` table with RLS policies) need to be created via migrations.
4. **Scan history persistence** — Wire up the scanner and history pages to save/retrieve scans from Supabase.
5. **Results page** — Full results display with risk breakdown, red flags, and recommendations needs to be built once the AI analysis returns real data.
6. **Auth protection** — Route guards are in place but need testing with real Supabase auth sessions.
