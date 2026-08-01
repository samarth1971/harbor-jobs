'use client';

import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/admin/jobs'),
        fetch('/api/applications'),
      ]);
      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();
      setJobs(jobsData.jobs || []);
      setApplications(appsData.applications || []);
    } catch (err) {
      setError('Could not load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this job posting and its applications?')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      loadData();
    } else {
      alert('Could not delete job.');
    }
  }

  if (loading) return <p className="mt-8 text-harbor-800/60">Loading...</p>;
  if (error) return <p className="mt-8 text-red-600">{error}</p>;

  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="font-display text-xl font-medium text-harbor-800">
          Posted jobs ({jobs.length})
        </h2>
        <div className="mt-4 divide-y divide-harbor-800/10 rounded-2xl border border-harbor-800/10">
          {jobs.length === 0 && (
            <p className="p-4 text-harbor-800/60">No jobs posted through the site yet.</p>
          )}
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-harbor-800">{job.title}</p>
                <p className="text-sm text-harbor-800/60">
                  {job.company} · {job.location}
                </p>
                {job.paymentReference && (
                  <p className="mt-0.5 font-mono text-xs text-harbor-600">
                    {job.paymentMethod || 'payment'} ref: {job.paymentReference}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(job.id)}
                className="rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-medium text-harbor-800">
          Applications ({applications.length})
        </h2>
        <div className="mt-4 divide-y divide-harbor-800/10 rounded-2xl border border-harbor-800/10">
          {applications.length === 0 && (
            <p className="p-4 text-harbor-800/60">No applications submitted yet.</p>
          )}
          {applications.map((app) => (
            <div key={app.id} className="p-4">
              <p className="font-medium text-harbor-800">
                {app.name} <span className="text-harbor-800/50">applied to</span> {app.job_title}
              </p>
              <p className="text-sm text-harbor-800/60">
                {app.email}
                {app.link ? ` · ${app.link}` : ''}
              </p>
              {app.note && <p className="mt-1 text-sm text-harbor-800/70">{app.note}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
