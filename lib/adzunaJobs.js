// Pulls live India job listings from the Adzuna API
// (https://developer.adzuna.com/) so the board shows local roles
// alongside the Arbeitnow (EU) feed. Requires a free Adzuna App ID +
// App Key, set as ADZUNA_APP_ID / ADZUNA_APP_KEY in your environment
// (Vercel Project Settings -> Environment Variables). If the keys are
// missing, this simply returns an empty list — it never breaks the
// rest of the board.

const ADZUNA_BASE = 'https://api.adzuna.com/v1/api/jobs/in/search';
const PAGES_TO_FETCH = 2; // ~40-100 listings, refreshed every 30 min
const RESULTS_PER_PAGE = 50;
const REVALIDATE_SECONDS = 1800;

export async function fetchAdzunaJobs() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    // Not configured yet — fail silently, same philosophy as externalJobs.js
    return [];
  }

  const results = [];

  try {
    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const url = `${ADZUNA_BASE}/${page}?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(
        appKey
      )}&results_per_page=${RESULTS_PER_PAGE}&content-type=application/json`;

      const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
      if (!res.ok) break;

      const json = await res.json();
      const batch = Array.isArray(json.results) ? json.results : [];
      if (batch.length === 0) break;

      results.push(...batch.map(mapAdzunaJob));
    }
  } catch (err) {
    console.error('Adzuna India feed unavailable:', err.message);
  }

  return results;
}

function mapAdzunaJob(raw) {
  return {
    id: `adzuna-${raw.id}`,
    title: raw.title || 'Untitled role',
    company: raw.company?.display_name || 'Unknown company',
    location: raw.location?.display_name || 'India',
    type: normalizeType(raw.contract_time, raw.contract_type),
    salary:
      raw.salary_min && raw.salary_max
        ? `₹${Math.round(raw.salary_min).toLocaleString('en-IN')} - ₹${Math.round(
            raw.salary_max
          ).toLocaleString('en-IN')}`
        : 'See original listing',
    tags: raw.category?.label ? [raw.category.label] : [],
    description: stripHtml(raw.description).slice(0, 1400),
    postedAt: raw.created ? new Date(raw.created).toISOString() : new Date().toISOString(),
    applyUrl: raw.redirect_url,
    source: 'live-in',
  };
}

function normalizeType(contractTime, contractType) {
  if (contractType === 'contract') return 'Contract';
  if (contractType === 'permanent' && contractTime === 'part_time') return 'Part-time';
  if (contractTime === 'part_time') return 'Part-time';
  return 'Full-time';
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
