'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import UpiPaymentModal from '@/components/UpiPaymentModal';

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
  logoUrl: '',
};

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState('');
  const [upiDetails, setUpiDetails] = useState(null); // set to show the UPI modal
  const [upiPhase, setUpiPhase] = useState('form'); // 'form' | 'success'
  const [upiError, setUpiError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoPreview(URL.createObjectURL(file));
    setUploadingLogo(true);
    setError('');

    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not upload the image.');
      }

      update('logoUrl', data.url);
    } catch (err) {
      setError(err.message);
      setLogoPreview('');
    } finally {
      setUploadingLogo(false);
    }
  }

  async function submitJobPost(paymentInfo = {}) {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        ...paymentInfo,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Something went wrong posting this job.');
    }

    return res.json(); // { id }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      // Preferred path: direct UPI (no gateway account, no approval needed).
      const upiRes = await fetch('/api/payments/upi-details');
      const upi = await upiRes.json();

      if (upiRes.ok) {
        setUpiDetails(upi);
        setStatus('idle');
        return; // wait for the modal — handleUpiConfirm / handleUpiCancel take over
      }

      // Fall back to Razorpay, in case that gets approved later.
      const orderRes = await fetch('/api/payments/create-order', { method: 'POST' });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        console.warn('No payment method configured, posting without a fee:', order.error);
        const { id } = await submitJobPost();
        router.push(`/jobs/${id}`);
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

            const { id } = await submitJobPost({
              paymentMethod: 'razorpay',
              paymentReference: response.razorpay_payment_id,
            });
            router.push(`/jobs/${id}`);
          } catch (err) {
            setStatus('error');
            setError(err.message);
          }
        },
        modal: {
          ondismiss: () => setStatus('idle'),
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

  async function handleUpiConfirm(reference) {
    setStatus('submitting');
    setUpiError('');
    try {
      await submitJobPost({ paymentMethod: 'upi', paymentReference: reference });
      setUpiPhase('success');
      setTimeout(() => {
        setUpiDetails(null);
        setUpiPhase('form');
        setStatus('idle');
        router.push('/');
      }, 1800);
    } catch (err) {
      // Keep the modal open and show the error inline, instead of silently
      // closing it — the earlier version did this and looked like a blank
      // screen with no feedback at all.
      setStatus('idle');
      setUpiError(err.message);
    }
  }

  function handleUpiCancel() {
    setUpiDetails(null);
    setUpiPhase('form');
    setUpiError('');
    setStatus('idle');
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

          <Field label="Company logo (optional)">
            <div className="flex items-center gap-4">
              {logoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-14 w-14 rounded-lg border border-harbor-800/15 object-cover"
                />
              )}
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-ink/70 file:mr-4 file:rounded-lg file:border-0 file:bg-harbor-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-paper hover:file:bg-harbor-900"
                />
                {uploadingLogo && (
                  <p className="mt-1 text-xs text-harbor-800/60">Uploading…</p>
                )}
              </label>
            </div>
          </Field>

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
            Posting a listing costs a small fee, payable by UPI (scan or app link).
          </p>

          <button
            type="submit"
            disabled={status === 'submitting' || uploadingLogo}
            className="w-full rounded-xl bg-harbor-800 px-5 py-3 font-medium text-paper transition hover:bg-harbor-900 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Processing…' : uploadingLogo ? 'Uploading logo…' : 'Pay & post listing'}
          </button>
        </form>
      </main>

      {upiDetails && (
        <UpiPaymentModal
          details={upiDetails}
          onConfirm={handleUpiConfirm}
          onCancel={handleUpiCancel}
          submitting={status === 'submitting'}
          phase={upiPhase}
          errorMessage={upiError}
        />
      )}
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
