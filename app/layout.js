import './globals.css';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

export const metadata = {
  title: 'Harbor — jobs at small teams worth joining',
  description:
    'A job board for small companies and startups. No noise, no dropdown maze — just roles worth reading closely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap"
        />
      </head>
      <body className="grain relative min-h-screen">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
