// Pulls real, live listings from Arbeitnow's public job board API
// (https://www.arbeitnow.com/api/job-board-api) — free, no API key, no
// signup, CORS-enabled, explicitly offered by Arbeitnow for exactly this
// kind of side-project job board. This is what turns the board from "5
// hardcoded demo jobs" into hundreds of real, current openings.
//
// Results are cached by Next.js's fetch cache and revalidated every 30
// minutes, so we're not hammering a third party's free API on every
// request.

const ARBEITNOW_URL = 'https://www.arbeitnow.com/api/job-board-api';
const PAGES_TO_FETCH = 3; // ~300 listings, refreshed every 30 min
const REVALIDATE_SECONDS = 1800;

export async function fetchExternalJobs() {
  const results = [];

  try {
    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const res = await fetch(`${ARBEITNOW_URL}?page=${page}`, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) break;

      const json = await res.json();
      const batch = Array.isArray(json.data) ? json.data : [];
      if (batch.length === 0) break;

      results.push(...batch.map(mapArbeitnowJob));

      if (!json.links?.next) break;
    }
  } catch (err) {
    // The live feed is a bonus layer, not core functionality — if
    // Arbeitnow is unreachable, the board still works with featured +
    // posted jobs from our own database.
    console.error('Live jobs feed unavailable:', err.message);
  }

  return results;
}

function mapArbeitnowJob(raw) {
  const jobTypes = Array.isArray(raw.job_types) && raw.job_types.length ? raw.job_types : [];
  return {
    id: `ext-${raw.slug}`,
    title: raw.title || 'Untitled role',
    company: raw.company_name || 'Unknown company',
    location: raw.remote ? 'Remote' : raw.location || 'Not specified',
    type: normalizeType(jobTypes[0]),
    salary: 'See original listing',
    tags: Array.isArray(raw.tags) ? raw.tags.slice(0, 6) : [],
    description: stripHtml(raw.description).slice(0, 1400),
    postedAt: raw.created_at
      ? new Date(raw.created_at * 1000).toISOString()
      : new Date().toISOString(),
    applyUrl: raw.url,
    source: 'live',
  };
}

function normalizeType(t) {
  const s = (t || '').toLowerCase();
  if (s.includes('part')) return 'Part-time';
  if (s.includes('contract') || s.includes('freelance')) return 'Contract';
  if (s.includes('intern')) return 'Internship';
  return 'Full-time';
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
