import Razorpay from 'razorpay';

// Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars, from your
// Razorpay dashboard (https://dashboard.razorpay.com/app/keys). Razorpay's
// checkout widget natively supports UPI (including QR/"scan to pay"),
// cards, netbanking, and wallets in one flow, so a single integration
// covers all of those payment methods. Payouts land in whatever bank
// account you verify with Razorpay during their KYC/onboarding — that
// account link has to be done directly in the Razorpay dashboard, not
// through code, for compliance reasons.

let instance = null;

export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel env vars.'
    );
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
}

// Fee to post a job, in INR. Override with JOB_POST_FEE_INR env var.
export function getJobPostFeeInPaise() {
  const rupees = Number(process.env.JOB_POST_FEE_INR || 499);
  return Math.round(rupees * 100);
}
