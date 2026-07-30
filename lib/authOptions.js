import GoogleProvider from 'next-auth/providers/google';

// Role model: anyone can sign in with Google as a "user". Admins are
// determined by an email allowlist (ADMIN_EMAILS env var, comma-separated),
// e.g. ADMIN_EMAILS="you@gmail.com,cofounder@gmail.com" set in Vercel ->
// Project Settings -> Environment Variables. This avoids needing a manual
// role-management UI for a small team; add more admin emails any time by
// updating that env var and redeploying.

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token }) {
      const admins = getAdminEmails();
      token.role = token.email && admins.includes(token.email.toLowerCase()) ? 'admin' : 'user';
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
};
