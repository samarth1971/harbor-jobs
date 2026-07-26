'use client';

import { useState } from 'react';
import { addApplication } from '@/lib/jobs';

export default function ApplyModal({ job, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', link: '', note: '' });
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    addApplication({ jobId: job.id, jobTitle: job.title, ...form });
    setSent(true);
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-harbor-900/40 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-paper p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Apply to ${job.title}`}
      >
        {sent ? (
          <div className="py-6 text-center">
            <p className="font-display text-xl text-harbor-900">Application sent.</p>
            <p className="mt-2 text-sm text-ink/70">
              {job.company} will reach out directly if it&apos;s a match.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-harbor-800 px-5 py-2.5 font-medium text-paper hover:bg-harbor-900"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
              Applying to
            </p>
            <h2 className="mt-1 font-display text-xl font-medium text-harbor-900">
              {job.title} · {job.company}
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                className={inputClass}
              />
              <input
                required
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Portfolio / resume link (optional)"
                value={form.link}
                onChange={(e) => update('link', e.target.value)}
                className={inputClass}
              />
              <textarea
                rows={3}
                placeholder="A line or two on why this role (optional)"
                value={form.note}
                onChange={(e) => update('note', e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-harbor-800/20 px-5 py-2.5 font-medium text-harbor-800 hover:bg-harbor-800/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-harbor-800 px-5 py-2.5 font-medium text-paper hover:bg-harbor-900"
                >
                  Send application
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-harbor-800/15 bg-white/70 px-4 py-2.5 font-body text-sm text-ink placeholder:text-ink/40 focus:border-harbor-600 focus:outline-none';
