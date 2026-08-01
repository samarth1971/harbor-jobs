import { NextResponse } from 'next/server';
import { buildUpiPaymentDetails } from '@/lib/upiPayment';

export async function GET() {
  const details = buildUpiPaymentDetails();

  if (!details) {
    return NextResponse.json(
      { error: 'UPI payment is not configured yet. Add UPI_ID in Vercel environment variables.' },
      { status: 503 }
    );
  }

  return NextResponse.json(details);
}
