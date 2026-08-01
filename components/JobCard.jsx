'use client';

import Link from 'next/link';
import { daysSincePosted } from '@/lib/seedJobs';
import TideDot from './TideDot';

const SOURCE_LABEL = {
  live: 'Live feed',
  posted: 'Community posted',
  featured: null, // "Featured" already appears as a tag
};

export default function JobCard({ job }) {
  const days = daysSincePosted(job.postedAt);
  const sourceLabel = SOURCE_LABEL[job.source];

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block rounded-2xl border border-harbor-800/10 bg-white/40 p-6 transition hover:border-harbor-800/25 hover:bg-white/70 hover:shadow-[0_8px_24px_-12px_rgba(15,43,39,0.25)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {job.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.logoUrl}
              alt={`${job.company} logo`}
              className="h-10 w-10 shrink-0 rounded-lg border border-harbor-800/10 object-cover"
            />
          )}
          <div>
            <h3 className="font-display text-lg font-medium text-harbor-900 group-hover:text-harbor-600">
              {job.title}
            </h3>
            <p className="mt-0.5 text-sm text-ink/70">{job.company}</p>
          </div>
        </div>
        <TideDot days={days} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-rope">
        <span>{job.location}</span>
        <span aria-hidden="true">·</span>
        <span>{job.type}</span>
        <span aria-hidden="true">·</span>
        <span className="text-brass-600">{job.salary}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(job.tags || []).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-harbor-800/5 px-2.5 py-1 font-mono text-[11px] text-harbor-800/80"
          >
            {tag}
          </span>
        ))}
        {sourceLabel && (
          <span className="ml-auto rounded-full bg-harbor-600/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-harbor-600">
            {sourceLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
