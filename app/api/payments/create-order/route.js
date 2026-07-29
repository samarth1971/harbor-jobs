import { NextResponse } from 'next/server';
import { getRazorpay, getJobPostFeeInPaise } from '@/lib/razorpay';

export async function POST() {
  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: getJobPostFeeInPaise(),
      currency: 'INR',
      receipt: `job-post-${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
}
