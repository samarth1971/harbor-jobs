'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';
import { getJobs } from '@/lib/jobs';

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');

  useEffect(() => {
    setJobs(getJobs());
  }, []);

  const types = useMemo(() => {
    const set = new Set(jobs.map((j) => j.type));
    return ['All', ...Array.from(set)];
  }, [jobs]);

  const filtered = jobs.filter((job) => {
    const matchesType = type === 'All' || job.type === type;
    const haystack = `${job.title} ${job.company} ${job.location} ${job.tags.join(' ')}`.toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        {/* Hero: the thesis. A live, working search is the most characteristic
            thing a job board's world offers — so the hero doubles as the tool. */}
        <section className="pt-16 pb-10 sm:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
            {jobs.length} roles currently docked
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-harbor-900 sm:text-5xl">
            Where small crews find their next hand.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
            No dropdown maze, no sponsored noise. Every role here is posted by a team of
            under fifty people, written by the person you would actually report to.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, company, or stack — try “React” or “remote”"
              className="w-full rounded-xl border border-harbor-800/15 bg-white/60 px-4 py-3 font-body text-sm text-ink placeholder:text-ink/40 focus:border-harbor-600 focus:outline-none"
              aria-label="Search jobs"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-harbor-800/15 bg-white/60 px-4 py-3 font-mono text-sm text-harbor-800 focus:border-harbor-600 focus:outline-none sm:w-48"
              aria-label="Filter by job type"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Listings */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-harbor-800/20 p-10 text-center">
            <p className="font-display text-lg text-harbor-800">Nothing matches that search.</p>
            <p className="mt-1 text-sm text-ink/60">
              Try a broader term, or clear the filter above.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
