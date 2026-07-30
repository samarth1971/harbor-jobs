'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const initial = {
  title: '',
  company: '',
  location: '',
  type: 'Full-time',
  salary: '',
  tags: '',
  description: '',
};

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function postJob() {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Something went wrong posting this job.');
    }

    const data = await res.json();
    router.push(`/jobs/${data.id}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      // Create a Razorpay order for the posting fee first.
      const orderRes = await fetch('/api/payments/create-order', { method: 'POST' });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        // Payments not configured yet (no RAZORPAY_KEY_ID/SECRET) — fall
        // back to posting for free rather than blocking the whole board.
        console.warn('Payments unavailable, posting without a fee:', order.error);
        await postJob();
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load the payment widget. Check your connection and try again.');
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Harbor Jobs',
        description: 'Job posting fee',
        // Razorpay's checkout shows UPI (with QR code), cards, netbanking,
        // and wallets all in this one widget.
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              throw new Error('Payment could not be verified. You have not been charged, please try again.');
            }

            await postJob();
          } catch (err) {
            setStatus('error');
            setError(err.message);
          }
        },
        modal: {
          ondismiss: () => {
            setStatus('idle');
          },
        },
        theme: { color: '#1F4D46' },
      });

      rzp.on('payment.failed', (response) => {
        setStatus('error');
        setError(response.error?.description || 'Payment failed. Please try again.');
      });

      rzp.open();
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-14">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
          Post a listing
        </p>
        <h1 className="mt-3 font-display text-3xl font-medium text-harbor-900">
          Bring your crew a new hand.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink/70">
          Listings go live immediately and stay up as long as you like. No approval queue.
        </p>

        {status === 'error' && (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <Field label="Job title">
            <input
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Senior Backend Engineer"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Company">
              <input
                required
                value={form.company}
                onChange={(e) => update('company', e.target.value)}
                placeholder="Driftwood Studio"
                className={inputClass}
              />
            </Field>
            <Field label="Location">
              <input
                required
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                placeholder="Remote (Global)"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => update('type', e.target.value)}
                className={inputClass}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </Field>
            <Field label="Salary range">
              <input
                value={form.salary}
                onChange={(e) => update('salary', e.target.value)}
                placeholder="$90k – $120k"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Tags (comma separated)">
            <input
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="React, TypeScript, Remote-first"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="What the team does, what this role owns, and who thrives here."
              className={inputClass}
            />
          </Field>

          <p className="text-xs text-harbor-800/60">
            Posting a listing costs a small fee, payable by UPI, card, or netbanking via Razorpay.
          </p>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-xl bg-harbor-800 px-5 py-3 font-medium text-paper transition hover:bg-harbor-900 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Processing…' : 'Pay & post listing'}
          </button>
        </form>
      </main>
    </>
  );
}

const inputClass =
  'w-full rounded-xl border border-harbor-800/15 bg-white/60 px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:border-harbor-600 focus:outline-none';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-rope">
        {label}
      </span>
      {children}
    </label>
  );
}
