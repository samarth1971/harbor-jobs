import { NextResponse } from 'next/server';
import { sql, ensureSchema, rowToJob } from '@/lib/db';
import { FEATURED_JOBS } from '@/lib/seedJobs';
import { fetchExternalJobs } from '@/lib/externalJobs';
import { fetchAdzunaJobs } from '@/lib/adzunaJobs';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const type = searchParams.get('type') || 'All';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  let postedJobs = [];
  try {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
    postedJobs = rows.map(rowToJob);
  } catch (err) {
    // If no database is attached yet (e.g. running without Vercel Postgres
    // configured), the board still works with featured + live jobs.
    console.error('Database unavailable, continuing without posted jobs:', err.message);
  }

  const [externalJobs, indiaJobs] = await Promise.all([
    fetchExternalJobs(),
    fetchAdzunaJobs(),
  ]);

  let all = [...postedJobs, ...FEATURED_JOBS, ...externalJobs, ...indiaJobs];

  if (q) {
    all = all.filter((job) =>
      `${job.title} ${job.company} ${job.location} ${(job.tags || []).join(' ')}`
        .toLowerCase()
        .includes(q)
    );
  }
  if (type !== 'All') {
    all = all.filter((job) => job.type === type);
  }

  const total = all.length;
  const start = (page - 1) * PAGE_SIZE;
  const pageJobs = all.slice(start, start + PAGE_SIZE);
  const hasMore = start + PAGE_SIZE < total;

  return NextResponse.json({
    jobs: pageJobs,
    total,
    hasMore,
    counts: {
      posted: postedJobs.length,
      featured: FEATURED_JOBS.length,
      live: externalJobs.length,
      liveIndia: indiaJobs.length,
    },
  });
}

export async function POST(request) {
  const body = await request.json();

  if (!body.title || !body.company || !body.location || !body.description) {
    return NextResponse.json(
      { error: 'title, company, location, and description are required' },
      { status: 400 }
    );
  }

  try {
    await ensureSchema();
  } catch (err) {
    return NextResponse.json(
      {
        error:
          'No database connected. Add the Neon integration to this Vercel project (Storage tab \u2192 Connect Database \u2192 Neon), then redeploy.',
      },
      { status: 503 }
    );
  }

  const id = `job-${Date.now()}`;
  const tags = Array.isArray(body.tags) ? body.tags : [];

  await sql`
    INSERT INTO jobs (id, title, company, location, type, salary, tags, description, logo_url)
    VALUES (
      ${id},
      ${body.title},
      ${body.company},
      ${body.location},
      ${body.type || 'Full-time'},
      ${body.salary || ''},
      ${JSON.stringify(tags)}::jsonb,
      ${body.description},
      ${body.logoUrl || null}
    )
  `;

  return NextResponse.json({ id }, { status: 201 });
}
