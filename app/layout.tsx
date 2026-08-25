import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DukaanAI - AI-Powered One-Click Digital Store for Every Indian Business',
  description: 'Enter your business details -> Select business type -> Launch your complete online digital store automatically in under 5 minutes.',
  keywords: ['Digital Store', 'Kirana Online', 'Restaurant Online Ordering', 'India SaaS', 'AI Commerce', 'WhatsApp Store', 'Dukaan AI']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
