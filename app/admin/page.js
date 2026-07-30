import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/authOptions';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin');
  }
  if (session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl font-medium text-harbor-800">Admin dashboard</h1>
      <p className="mt-2 text-harbor-800/70">
        Signed in as {session.user.email}. Manage posted jobs and review applications.
      </p>
      <AdminDashboard />
    </main>
  );
}
