import { NextResponse } from 'next/server';
import { sql, ensureSchema, rowToJob } from '@/lib/db';
import { FEATURED_JOBS } from '@/lib/seedJobs';
import { fetchExternalJobs } from '@/lib/externalJobs';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = params;

  if (id.startsWith('ext-')) {
    const externalJobs = await fetchExternalJobs();
    const job = externalJobs.find((j) => j.id === id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  const featured = FEATURED_JOBS.find((j) => j.id === id);
  if (featured) {
    return NextResponse.json(featured);
  }

  try {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM jobs WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(rowToJob(rows[0]));
  } catch (err) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
}
