// Harbor Jobs data layer.
// For this reference build we persist to localStorage (client-side) so the
// app works fully on Vercel's free static/serverless hosting with zero
// database setup. Swapping this module for a real DB (Postgres, Mongo
// Atlas, Supabase) is the natural next step — see README "Future Improvements".

const STORAGE_KEY = 'harbor:jobs:v1';
const APPLICATIONS_KEY = 'harbor:applications:v1';

const SEED_JOBS = [
  {
    id: 'seed-1',
    title: 'Frontend Engineer',
    company: 'Driftwood Studio',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    salary: '$90k – $120k',
    tags: ['React', 'TypeScript', 'Design Systems'],
    description:
      'Driftwood Studio builds tools for independent audio producers. We need a frontend engineer who cares about motion, accessibility, and shipping fast. You will own our component library and collaborate directly with two designers and one backend engineer.',
    postedAt: daysAgo(1),
  },
  {
    id: 'seed-2',
    title: 'Backend Engineer (Node.js)',
    company: 'Northline Logistics',
    location: 'Lucknow, IN (Hybrid)',
    type: 'Full-time',
    salary: '₹14L – ₹20L',
    tags: ['Node.js', 'PostgreSQL', 'AWS'],
    description:
      'Northline Logistics runs routing software for regional freight fleets. Join a four-person backend team rebuilding our dispatch API. Strong SQL fundamentals and a taste for clear error handling expected.',
    postedAt: daysAgo(3),
  },
  {
    id: 'seed-3',
    title: 'Product Designer',
    company: 'Fieldnote',
    location: 'Remote (Global)',
    type: 'Contract',
    salary: '$60/hr – $80/hr',
    tags: ['Figma', 'UX Research', 'B2B'],
    description:
      'Fieldnote makes field-inspection software for utility companies. We are looking for a contract product designer for a 3-month engagement to redesign our mobile inspection flow.',
    postedAt: daysAgo(6),
  },
  {
    id: 'seed-4',
    title: 'DevOps / Platform Engineer',
    company: 'Cascade Analytics',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$110k – $145k',
    tags: ['Kubernetes', 'CI/CD', 'Terraform'],
    description:
      'Cascade Analytics needs someone to own our deployment pipeline and observability stack as we scale past 40 engineers. You will set standards other teams build on.',
    postedAt: daysAgo(10),
  },
  {
    id: 'seed-5',
    title: 'Junior Full-Stack Developer',
    company: 'Harborlight Nonprofit Collective',
    location: 'Remote (India)',
    type: 'Full-time',
    salary: '₹6L – ₹9L',
    tags: ['Next.js', 'MongoDB', 'Good First Team'],
    description:
      'We build donor-management software for small nonprofits. Looking for a junior developer eager to learn — mentorship provided, no prior production experience required.',
    postedAt: daysAgo(14),
  },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getJobs() {
  if (!isBrowser()) return SEED_JOBS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOBS));
      return SEED_JOBS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_JOBS;
  }
}

export function getJob(id) {
  return getJobs().find((j) => j.id === id) || null;
}

export function addJob(job) {
  const jobs = getJobs();
  const newJob = {
    ...job,
    id: `job-${Date.now()}`,
    postedAt: new Date().toISOString(),
  };
  const updated = [newJob, ...jobs];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newJob;
}

export function getApplications() {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addApplication(app) {
  const applications = getApplications();
  const newApp = { ...app, id: `app-${Date.now()}`, submittedAt: new Date().toISOString() };
  const updated = [newApp, ...applications];
  window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));
  return newApp;
}

// "Tide" freshness: how many days since posting, used to drive the
// signature tide-dot indicator (brighter = more recently posted).
export function daysSincePosted(isoDate) {
  const posted = new Date(isoDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - posted) / (1000 * 60 * 60 * 24)));
}

export function freshnessLabel(days) {
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days} days ago`;
}
