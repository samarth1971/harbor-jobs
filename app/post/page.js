'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

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

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
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

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-xl bg-harbor-800 px-5 py-3 font-medium text-paper transition hover:bg-harbor-900 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Posting…' : 'Post listing'}
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
