import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { sql, ensureSchema, rowToJob } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    await ensureSchema();
    const { rows } = await sql`SELECT * FROM jobs ORDER BY created_at DESC`;
    return NextResponse.json({ jobs: rows.map(rowToJob) });
  } catch (err) {
    return NextResponse.json({ jobs: [] });
  }
}
