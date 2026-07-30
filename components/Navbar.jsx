'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="relative z-10 border-b border-harbor-800/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
            <path
              d="M13 2C13 2 7 9.5 7 15a6 6 0 0012 0c0-5.5-6-13-6-13z"
              stroke="#1F4D46"
              strokeWidth="1.6"
              fill="#EAD1A3"
              fillOpacity="0.5"
            />
            <path d="M2 20c2.5 2 5 2 7.5 0s5-2 7.5 0 5 2 9 0" stroke="#1F4D46" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="font-display text-xl font-medium tracking-tight text-harbor-800">
            Harbor
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm">
          <Link href="/" className="text-harbor-800/70 transition hover:text-harbor-800">
            Jobs
          </Link>
          <Link
            href="/post"
            className="rounded-full bg-harbor-800 px-4 py-2 font-medium text-paper transition hover:bg-harbor-900"
          >
            Post a job
          </Link>
          {status === 'authenticated' && session.user.role === 'admin' && (
            <Link href="/admin" className="text-harbor-800/70 transition hover:text-harbor-800">
              Admin
            </Link>
          )}
          {status === 'authenticated' ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-harbor-800/70 transition hover:text-harbor-800"
              title={session.user.email}
            >
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="h-6 w-6 rounded-full" />
              )}
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="text-harbor-800/70 transition hover:text-harbor-800"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
