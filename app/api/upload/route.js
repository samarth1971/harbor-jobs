import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Handles company-logo (or any image) uploads for job postings.
// Requires Vercel Blob storage attached to this project: Vercel dashboard
// -> Storage tab -> Create Database -> Blob -> Connect to Project. That
// automatically injects BLOB_READ_WRITE_TOKEN, no manual env var needed.

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Image storage is not set up yet. In Vercel: Storage tab -> Create Database -> Blob -> Connect to Project, then redeploy.',
      },
      { status: 503 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Only PNG, JPEG, WEBP, or GIF images are allowed' },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Image must be under 4MB' }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
  const blob = await put(`job-logos/${Date.now()}-${safeName}`, file, {
    access: 'public',
  });

  return NextResponse.json({ url: blob.url });
}
