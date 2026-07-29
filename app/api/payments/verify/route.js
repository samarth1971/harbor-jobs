import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  const { orderId, paymentId, signature } = await request.json();

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 503 });
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isValid = expected === signature;

  if (!isValid) {
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
