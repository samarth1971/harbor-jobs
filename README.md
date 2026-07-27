# Harbor — a job board for small teams

Harbor is a job board built for small companies and startups to post roles
and for candidates to search and apply. It was built end-to-end (code,
backend, CI/CD, deployment, docs) as a reference solution for the
"AI-assisted, ship-it" technical assessment.

**Live demo:** `[add your Vercel URL here after deploying]`

---

## 1. What it does (business value)

- **Companies** post a role in under a minute (title, location, salary,
  tags, description) and it's live immediately — no approval queue.
- **Candidates** search and filter roles by keyword or job type, read a
  full listing, and apply in one modal (name, email, resume link, note).
- The board blends three sources so it's never sparse: a handful of
  **curated featured roles**, **real listings posted by users** of the
  app, and a **live feed of hundreds of real remote jobs** pulled from a
  public jobs API.
- A signature **"tide" freshness indicator** shows how recently each role
  was posted, at a glance, without cluttering the card with a badge.

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (App Router) | Zero-config deploys to Vercel, file-based routing + API routes in one project |
| UI | **React 18** + **Tailwind CSS** | Rapid, consistent styling without a heavy design system |
| Fonts | Fraunces (display), Inter (body), IBM Plex Mono (data/metadata) | Loaded via `next/font/google`, self-hosted at build time |
| **Backend / database** | **Postgres via Neon** (Vercel's native integration) | Real persistence for posted jobs and applications — free tier, zero server management |
| **Live job data** | **Arbeitnow public API** (free, no key) | Turns "5 demo jobs" into hundreds of real, current remote listings |
| CI/CD | **GitHub Actions** | Free for public repos, native to GitHub |
| Hosting | **Vercel** (free Hobby tier) | Built for Next.js, generous free tier, preview deployments per PR |

**Cost to run this:** $0. Every tool used (GitHub, GitHub Actions, Vercel
Hobby, Neon free tier, Arbeitnow's public API, Google Fonts) is free at
this project's scale.

## 3. Getting started locally

**Requirements:** Node.js 18.18+ (Node 20 recommended), npm, a Vercel
account (for the database — see step 4).

```bash
npm install
```

**Connect the database** (one-time, needed for posting jobs / applying —
browsing the board works without it, since featured + live jobs don't
need a database):

```bash
vercel link                              # links this folder to your Vercel project
vercel env pull .env.development.local   # downloads DATABASE_URL locally
```

**Run it:**

```bash
npm run dev
# → open http://localhost:3000

npm run lint
npm run build   # production build, same as CI/CD runs
npm run start
```

Without `.env.development.local`, the app still runs — browsing, search,
and the live feed all work — but posting a job or submitting an
application will return a clear "no database connected" message instead
of failing silently.

## 4. Architecture

```
app/
  layout.js               Root layout: fonts, global metadata
  page.js                  Home: search/filter over merged job listings
  post/page.js              "Post a job" form -> POST /api/jobs
  jobs/[id]/page.js         Job detail + apply flow
  api/
    jobs/route.js            GET (search/filter/paginate merged jobs), POST (create)
    jobs/[id]/route.js        GET a single job from whichever source it belongs to
    applications/route.js     POST a candidate application
  globals.css               Tailwind layers + base styles
components/
  Navbar.jsx                 Site header
  JobCard.jsx                 Job summary card, shows a source badge (live/community)
  TideDot.jsx                  Signature freshness indicator
  ApplyModal.jsx                Apply form, submits to /api/applications
lib/
  db.js                      Neon connection + schema + row mapping
  externalJobs.js              Fetches & normalizes the Arbeitnow live feed
  seedJobs.js                   Curated "featured" listings + freshness utils
.github/workflows/
  ci-cd.yml                   Lint -> build -> deploy pipeline (see below)
vercel.json                    Vercel build/install command overrides
```

**Data flow:** `GET /api/jobs` merges three sources on every request —
rows from Postgres (`lib/db.js`), the hardcoded featured list
(`lib/seedJobs.js`), and a cached live feed (`lib/externalJobs.js`) — then
applies search/type filtering and pagination across the combined result.
`POST /api/jobs` and `POST /api/applications` write directly to Postgres.

## 5. Setting up the database (Neon via Vercel)

1. In your Vercel project, go to **Storage → Connect Database → Neon**
   (this is Vercel's current native Postgres integration; the older
   "Vercel Postgres" product is deprecated as of 2026, which is why this
   project uses `@neondatabase/serverless` directly rather than the old
   `@vercel/postgres` package).
2. Accept the defaults and create the database. Vercel automatically
   injects `DATABASE_URL` (and a few legacy `POSTGRES_*` aliases) into
   your project's environment variables — nothing to copy by hand.
3. Redeploy (or it will auto-apply on your next deploy). The app creates
   its own tables on first request (`lib/db.js` runs
   `CREATE TABLE IF NOT EXISTS ...` for `jobs` and `applications`) — no
   separate migration step needed for this project's scale.

## 6. The live jobs feed

`lib/externalJobs.js` pulls from
[Arbeitnow's public job board API](https://www.arbeitnow.com/api/job-board-api) —
free, no API key, explicitly offered by Arbeitnow for side projects like
this one. It fetches ~300 current remote/EU tech listings and caches them
for 30 minutes (`next: { revalidate: 1800 }`) so we're not hammering a
third party's free API on every page load.

Because these are real external listings, clicking **Apply** on a live job
takes the candidate to the original posting (`job.applyUrl`) instead of
opening our internal apply modal — submitting into our own database would
mean the application never actually reaches that company.

## 7. Known limitations & future improvements

- **No authentication** — anyone can post a job or apply. Adding auth
  (e.g. NextAuth with a free OAuth provider) would be the next priority
  before any real-world use.
- **No automated tests yet.** CI runs lint + build as a quality gate;
  component tests (Vitest + React Testing Library) would be a good
  follow-up.
- **Live feed depends on a third party.** If Arbeitnow's API is down or
  changes shape, the board still works fine on featured + posted jobs —
  `fetchExternalJobs()` fails soft and logs a warning rather than
  breaking the page.
- **No moderation** on user-posted jobs — fine for a demo/assessment,
  not for production use as-is.

## 8. CI/CD pipeline

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

Merging to `main` is what ships to production — deployment is never
manual after initial setup. Pull requests also get automatic preview
deployments from Vercel's native GitHub integration.

### Required GitHub Secrets

Set these under **Repo → Settings → Secrets and variables → Actions**:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` locally once; found in `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same file, `.vercel/project.json` |

## 9. Deployment steps (one-time setup)

1. Push this repo to GitHub (already done if you're reading this on
   github.com/samarth1971/harbor-jobs).
2. Go to [vercel.com](https://vercel.com), **Add New → Project**, import
   this repo. Accept the default Next.js settings and deploy once
   manually — this creates the project.
3. Attach the database: **Storage → Connect Database → Neon** (see
   section 5).
4. Generate a Vercel token (Account Settings → Tokens) and add it, along
   with the org/project IDs, as GitHub Actions secrets.
5. From then on, every push to `main` redeploys automatically through
   `.github/workflows/ci-cd.yml`.

## 10. AI usage notes

This project was built with AI assistance (Claude) across every stage of
the assessment: scaffolding and component structure, the Postgres +
external-feed backend, the GitHub Actions CI/CD pipeline, and this
documentation — all drafted with AI and then verified against the actual
running code (build checks, live API tests, and a manual review of the
Neon/Vercel Postgres deprecation before shipping it).

---

## License

MIT — do whatever you'd like with this as a reference or starting point.
