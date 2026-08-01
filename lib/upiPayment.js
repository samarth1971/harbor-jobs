// Direct UPI collection — no payment gateway, no KYC/approval process.
// This builds a standard UPI deep link using YOUR OWN UPI ID (the same one
// your phone's UPI app already uses), so money lands straight in your
// linked bank account exactly like any normal UPI payment you receive today.
//
// Set these in Vercel -> Project Settings -> Environment Variables:
//   UPI_ID            e.g. "8755102920@ybl" or "yourname@oksbi"
//                      (open GPay/PhonePe/BHIM -> Profile -> your UPI ID)
//   UPI_PAYEE_NAME     e.g. "Harbor Jobs" (optional, defaults below)
//
// There is no approval step for this — it's just your existing UPI ID.
// Limitation: there's no automatic payment-success webhook (that only
// comes with a registered payment gateway), so the payer enters their
// UTR/reference number after paying, which you can cross-check in your
// bank/UPI app from the admin dashboard.

export function getJobPostFeeInRupees() {
  return Number(process.env.JOB_POST_FEE_INR || 499);
}

export function buildUpiPaymentDetails() {
  const upiId = process.env.UPI_ID;
  if (!upiId) return null;

  const payeeName = process.env.UPI_PAYEE_NAME || 'Harbor Jobs';
  const amount = getJobPostFeeInRupees();
  const note = 'Harbor Jobs posting fee';

  const upiLink =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${encodeURIComponent(amount.toFixed(2))}` +
    `&cu=INR` +
    `&tn=${encodeURIComponent(note)}`;

  return { upiId, payeeName, amount, currency: 'INR', upiLink };
}
