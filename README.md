# Harbor — a job board for small teams

Harbor is a lightweight job board built for small companies and startups to
post roles and for candidates to search and apply — no dropdown maze, no
sponsored noise. It was built end-to-end (code, CI/CD, deployment, docs) as
a reference solution for the "AI-assisted, ship-it" technical assessment.

**Live demo:** `[add your Vercel URL here after first deploy]`

---

## 1. What it does (business value)

- **Companies** post a role in under a minute (title, location, salary,
  tags, description) and it's live immediately — no approval queue.
- **Candidates** search and filter roles by keyword or job type, read a
  full listing, and apply in one modal (name, email, resume link, note).
- A signature **"tide" freshness indicator** shows how recently each role
  was posted, at a glance, without cluttering the card with a badge.

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Zero-config deploys to Vercel, file-based routing, fast dev loop |
| UI | **React 18** + **Tailwind CSS** | Rapid, consistent styling without a heavy design system |
| Fonts | Fraunces (display), Inter (body), IBM Plex Mono (data/metadata) | Loaded via `next/font/google`, self-hosted at build time — no runtime font requests |
| Data | **Browser `localStorage`** | Zero-setup persistence so the app works fully on Vercel's free tier with no database to provision (see [Known Limitations](#5-known-limitations--future-improvements)) |
| CI/CD | **GitHub Actions** | Free for public repos, native to GitHub |
| Hosting | **Vercel** (free Hobby tier) | Built for Next.js, generous free tier, preview deployments per PR |

**Cost to run this:** $0. Every tool used (GitHub, GitHub Actions, Vercel
Hobby, Google Fonts) is free for a project at this scale.

## 3. Getting started locally

**Requirements:** Node.js 18.18+ (Node 20 recommended), npm.

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
# → open http://localhost:3000

# Lint
npm run lint

# Production build (matches what CI/CD runs)
npm run build
npm run start
```

There is no `.env` file required — the app has no external services to
configure for local development.

## 4. Architecture

```
app/
  layout.js          Root layout: fonts, global metadata
  page.js             Home: hero + live search/filter over job listings
  post/page.js         "Post a job" form → writes to localStorage
  jobs/[id]/page.js    Job detail page + "Apply" flow
  globals.css          Tailwind layers + base styles
components/
  Navbar.jsx           Site header
  JobCard.jsx          Job summary card used on the home grid
  TideDot.jsx           Signature freshness indicator
  ApplyModal.jsx        Apply form shown as a modal on the detail page
lib/
  jobs.js              Data layer: seed data, localStorage read/write,
                       freshness calculation
.github/workflows/
  ci-cd.yml            Lint → build → deploy pipeline (see below)
vercel.json             Vercel build/install command overrides
```

**Data flow:** `lib/jobs.js` is the single data access layer. It seeds five
example listings into `localStorage` on first load, then all reads/writes
(new job postings, new applications) go through the same module. Swapping
this for a real database later means changing one file, not the UI.

## 5. Known limitations & future improvements

- **Persistence is per-browser, not shared.** Because data lives in
  `localStorage`, a job posted on one device won't appear for someone
  browsing on another device. This was a deliberate trade-off to keep the
  assessment's infrastructure at $0 and its setup at zero steps. The
  natural next step is to swap `lib/jobs.js` for a free-tier hosted
  database (MongoDB Atlas free cluster, Supabase, or Vercel Postgres) and
  turn the pages that read/write jobs into API routes.
- **No authentication** — anyone can post a job or apply. Adding auth
  (e.g. NextAuth with a free OAuth provider) would be the next priority
  before any real-world use.
- **No automated tests yet.** The CI pipeline runs lint + build as a
  quality gate; adding component tests (Vitest + React Testing Library)
  would be a good follow-up.

## 6. CI/CD pipeline

Defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

**On every push and pull request to `main`:**
1. Checks out the code
2. Installs dependencies (`npm ci`)
3. Runs `npm run lint`
4. Runs `npm run build` as a compile/quality gate

**On every push to `main` (after the above passes):**
5. Installs the Vercel CLI
6. Pulls the Vercel project's environment/config
7. Builds production artifacts via `vercel build`
8. Deploys the prebuilt output to Vercel **production** via
   `vercel deploy --prebuilt --prod`

This means deployment is never manual — merging to `main` is what ships to
production. Pull requests also get automatic preview deployments from
Vercel's native GitHub integration (no extra Action needed for that part).

### Required GitHub Secrets

Set these under **Repo → Settings → Secrets and variables → Actions**:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` locally once; found in `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same file, `.vercel/project.json` |

> The pipeline as written only strictly requires `VERCEL_TOKEN` for the
> commands used, but `vercel pull` will also read `VERCEL_ORG_ID` /
> `VERCEL_PROJECT_ID` from `.vercel/project.json` if you've linked the
> project — set them as secrets too if you'd rather not commit that file.

## 7. Deployment steps (one-time setup)

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and
   **Import Project** → select this repo. Accept the default Next.js
   settings and deploy once manually — this creates the project and
   generates `.vercel/project.json` locally if you run `vercel link`.
3. Generate a Vercel token (Account Settings → Tokens) and add it, along
   with the org/project IDs, as GitHub Actions secrets (see table above).
4. From then on, every push to `main` redeploys automatically through
   `.github/workflows/ci-cd.yml` — the manual Vercel dashboard deploy is
   only needed once, to bootstrap the project.

## 8. AI usage notes

This project was built with AI assistance (Claude) across every stage
listed in the assessment:
- **Scaffolding & code** — component structure, data layer, routing, and
  Tailwind design tokens were drafted with AI and then reviewed/adjusted.
- **CI/CD pipeline** — the GitHub Actions workflow was written with AI,
  informed by Vercel's documented CLI-based deployment approach.
- **Documentation** — this README was drafted with AI and edited for
  accuracy against the actual code in the repo.

---

## License

MIT — do whatever you'd like with this as a reference or starting point.
