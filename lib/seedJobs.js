// A small set of curated "featured" listings, bundled with the app so the
// board never looks empty even if the live feed or database is briefly
// unavailable. These sit alongside real posted jobs (Postgres) and the
// live external feed (Arbeitnow) — see app/api/jobs/route.js.

function daysAgoIso(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const FEATURED_JOBS = [
  {
    id: 'featured-1',
    title: 'Frontend Engineer',
    company: 'Driftwood Studio',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    salary: '$90k – $120k',
    tags: ['React', 'TypeScript', 'Design Systems', 'Featured'],
    description:
      'Driftwood Studio builds tools for independent audio producers. We need a frontend engineer who cares about motion, accessibility, and shipping fast. You will own our component library and collaborate directly with two designers and one backend engineer.',
    postedAt: daysAgoIso(1),
    source: 'featured',
  },
  {
    id: 'featured-2',
    title: 'Backend Engineer (Node.js)',
    company: 'Northline Logistics',
    location: 'Lucknow, IN (Hybrid)',
    type: 'Full-time',
    salary: '₹14L – ₹20L',
    tags: ['Node.js', 'PostgreSQL', 'AWS', 'Featured'],
    description:
      'Northline Logistics runs routing software for regional freight fleets. Join a four-person backend team rebuilding our dispatch API. Strong SQL fundamentals and a taste for clear error handling expected.',
    postedAt: daysAgoIso(3),
    source: 'featured',
  },
  {
    id: 'featured-3',
    title: 'Product Designer',
    company: 'Fieldnote',
    location: 'Remote (Global)',
    type: 'Contract',
    salary: '$60/hr – $80/hr',
    tags: ['Figma', 'UX Research', 'B2B', 'Featured'],
    description:
      'Fieldnote makes field-inspection software for utility companies. We are looking for a contract product designer for a 3-month engagement to redesign our mobile inspection flow.',
    postedAt: daysAgoIso(6),
    source: 'featured',
  },
  {
    id: 'featured-4',
    title: 'DevOps / Platform Engineer',
    company: 'Cascade Analytics',
    location: 'Remote (US)',
    type: 'Full-time',
    salary: '$110k – $145k',
    tags: ['Kubernetes', 'CI/CD', 'Terraform', 'Featured'],
    description:
      'Cascade Analytics needs someone to own our deployment pipeline and observability stack as we scale past 40 engineers. You will set standards other teams build on.',
    postedAt: daysAgoIso(10),
    source: 'featured',
  },
  {
    id: 'featured-5',
    title: 'Junior Full-Stack Developer',
    company: 'Harborlight Nonprofit Collective',
    location: 'Remote (India)',
    type: 'Full-time',
    salary: '₹6L – ₹9L',
    tags: ['Next.js', 'MongoDB', 'Good First Team', 'Featured'],
    description:
      'We build donor-management software for small nonprofits. Looking for a junior developer eager to learn — mentorship provided, no prior production experience required.',
    postedAt: daysAgoIso(14),
    source: 'featured',
  },
];

// "Tide" freshness: how many days since posting, driving the signature
// tide-dot indicator (brighter = more recently posted).
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
