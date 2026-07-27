'use client';

import { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/JobCard';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (pageToLoad, replace, q, t) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pageToLoad) });
    if (q) params.set('q', q);
    if (t && t !== 'All') params.set('type', t);

    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs((prev) => (replace ? data.jobs : [...prev, ...data.jobs]));
      setHasMore(Boolean(data.hasMore));
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search/filter changes; always reset to page 1 on a new query.
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load(1, true, query, type);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type]);

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next, false, query, type);
  }

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <section className="pt-16 pb-10 sm:pt-20">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-600">
            {total === null ? 'Loading the harbor…' : `${total} roles currently docked`}
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-medium leading-[1.1] text-harbor-900 sm:text-5xl">
            Where small crews find their next hand.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/70">
            Featured roles from small teams, real user-posted listings, and a live feed of
            remote openings — searched and filtered in one place.
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
              <option>All</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </section>

        {!loading && jobs.length === 0 && (
          <div className="mt-10 rounded-2xl border border-dashed border-harbor-800/20 p-10 text-center">
            <p className="font-display text-lg text-harbor-800">Nothing matches that search.</p>
            <p className="mt-1 text-sm text-ink/60">
              Try a broader term, or clear the filter above.
            </p>
          </div>
        )}

        {hasMore && (
          <div className="mt-10 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="rounded-xl border border-harbor-800/20 px-6 py-3 font-medium text-harbor-800 transition hover:bg-harbor-800/5 disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Load more roles'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
