'use client';

import { freshnessLabel } from '@/lib/jobs';

// Signature element: a small "tide" dot whose brightness signals how
// recently a role was posted — full brass at day 0, fading toward the
// rope tone as a listing ages. Reads as a gauge, not a badge.
export default function TideDot({ days }) {
  const intensity = Math.max(0.25, 1 - days / 14);
  const color = `rgba(201, 138, 62, ${intensity})`;

  return (
    <span className="inline-flex items-center gap-1.5" title={freshnessLabel(days)}>
      <span className="tide-dot" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="font-mono text-[11px] uppercase tracking-wide text-rope">
        {freshnessLabel(days)}
      </span>
    </span>
  );
}
