import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sql, ensureSchema, rowToJob } from '@/lib/db';
import { FEATURED_JOBS } from '@/lib/seedJobs';
import { fetchExternalJobs } from '@/lib/externalJobs';
import { fetchAdzunaJobs } from '@/lib/adzunaJobs';

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

  if (id.startsWith('adzuna-')) {
    const indiaJobs = await fetchAdzunaJobs();
    const job = indiaJobs.find((j) => j.id === id);
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

// Admin-only: remove a posted (database) job. Featured/live listings aren't
// stored locally so there's nothing to delete for those.
export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { id } = params;

  try {
    await ensureSchema();
    await sql`DELETE FROM jobs WHERE id = ${id}`;
    await sql`DELETE FROM applications WHERE job_id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'Could not delete job' }, { status: 500 });
  }
}
