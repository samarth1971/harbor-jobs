'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import TideDot from '@/components/TideDot';
import ApplyModal from '@/components/ApplyModal';
import { getJob, daysSincePosted } from '@/lib/jobs';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(undefined);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    setJob(getJob(id));
  }, [id]);

  if (job === undefined) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-6 pt-14 text-ink/60">Loading…</main>
      </>
    );
  }

  if (job === null) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-2xl px-6 pt-14">
          <p className="font-display text-xl text-harbor-900">This listing has sailed off.</p>
          <button onClick={() => router.push('/')} className="mt-4 text-sm text-harbor-600 underline">
            Back to all jobs
          </button>
        </main>
      </>
    );
  }

  const days = daysSincePosted(job.postedAt);

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-14">
        <button
          onClick={() => router.push('/')}
          className="font-mono text-xs uppercase tracking-wide text-rope hover:text-harbor-800"
        >
          ← All jobs
        </button>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-harbor-900">{job.title}</h1>
            <p className="mt-1 text-base text-ink/70">{job.company}</p>
          </div>
          <TideDot days={days} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-rope">
          <span>{job.location}</span>
          <span aria-hidden="true">·</span>
          <span>{job.type}</span>
          <span aria-hidden="true">·</span>
          <span className="text-brass-600">{job.salary}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-harbor-800/5 px-2.5 py-1 font-mono text-[11px] text-harbor-800/80"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-8 max-w-xl whitespace-pre-line text-base leading-relaxed text-ink/80">
          {job.description}
        </p>

        <button
          onClick={() => setApplying(true)}
          className="mt-10 rounded-xl bg-brass-400 px-6 py-3 font-medium text-harbor-900 transition hover:bg-brass-600 hover:text-paper"
        >
          Apply for this role
        </button>
      </main>

      {applying && <ApplyModal job={job} onClose={() => setApplying(false)} />}
    </>
  );
}
