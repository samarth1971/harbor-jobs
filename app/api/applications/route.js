import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';

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
