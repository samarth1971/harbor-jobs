import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sql, ensureSchema } from '@/lib/db';

// Admin-only: list all applications received, most recent first.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM applications ORDER BY submitted_at DESC`;
    return NextResponse.json({ applications: rows });
  } catch (err) {
    return NextResponse.json({ applications: [] });
  }
}

export async function POST(request) {
  const body = await request.json();

  if (!body.jobId || !body.name || !body.email) {
    return NextResponse.json(
      { error: 'jobId, name, and email are required' },
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

  const id = `app-${Date.now()}`;

  await sql`
    INSERT INTO applications (id, job_id, job_title, name, email, link, note)
    VALUES (
      ${id},
      ${body.jobId},
      ${body.jobTitle || ''},
      ${body.name},
      ${body.email},
      ${body.link || ''},
      ${body.note || ''}
    )
  `;

  return NextResponse.json({ id }, { status: 201 });
}
