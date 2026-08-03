'use client';

import { useState } from 'react';

// Direct UPI payment modal — no gateway account required. Renders a QR
// code (via the free api.qrserver.com image API, generated client-side
// from the UPI deep link — no third-party account or key needed for
// this either) plus an "Open in UPI app" button for mobile users.
export default function UpiPaymentModal({ details, onConfirm, onCancel, submitting, phase, errorMessage }) {
  const [reference, setReference] = useState('');
  const [touched, setTouched] = useState(false);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    details.upiLink
  )}`;

  function handleConfirm() {
    setTouched(true);
    if (reference.trim().length < 4) return;
    onConfirm(reference.trim());
  }

  if (phase === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-paper p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
            ✓
          </div>
          <h2 className="mt-4 font-display text-xl font-medium text-harbor-900">
            Payment confirmed
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Your listing is live. Taking you back to the board…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-paper p-6">
        <h2 className="font-display text-xl font-medium text-harbor-900">Pay via UPI</h2>
        <p className="mt-1 text-sm text-ink/70">
          Scan with any UPI app, or tap below on mobile. Amount: ₹{details.amount}
        </p>

        <div className="mt-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrImageUrl}
            alt="UPI QR code"
            className="h-48 w-48 rounded-xl border border-harbor-800/10"
          />
        </div>

        <a
          href={details.upiLink}
          className="mt-4 block w-full rounded-xl bg-harbor-800 px-4 py-2.5 text-center text-sm font-medium text-paper hover:bg-harbor-900"
        >
          Open in UPI app
        </a>

        <p className="mt-3 text-center text-xs text-harbor-800/60">
          Paying to: {details.upiId}
        </p>

        <div className="mt-5 border-t border-harbor-800/10 pt-5">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-rope">
              After paying, enter the UPI reference / UTR number
            </span>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. 123456789012"
              className="w-full rounded-xl border border-harbor-800/15 bg-white/60 px-4 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-harbor-600 focus:outline-none"
            />
          </label>
          {touched && reference.trim().length < 4 && (
            <p className="mt-1 text-xs text-red-600">
              Enter the reference number shown in your UPI app after payment.
            </p>
          )}
          {errorMessage && (
            <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage} You have not been charged again — fix the details above and try
              confirming once more.
            </p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-xl border border-harbor-800/15 px-4 py-2.5 text-sm font-medium text-harbor-800 hover:bg-harbor-800/5"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 rounded-xl bg-harbor-800 px-4 py-2.5 text-sm font-medium text-paper hover:bg-harbor-900 disabled:opacity-60"
          >
            {submitting ? 'Posting…' : "I've paid — post listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
