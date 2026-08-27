import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ShopCraft AI - Next-Gen Commerce OS for Modern Businesses',
  description: 'Enter your business details -> Launch your complete custom digital store with dynamic storewise and categorywise themes in under 5 minutes.',
  keywords: ['Digital Store', 'Enterprise Commerce', 'AI Commerce', 'WhatsApp Store', 'ShopCraft AI', 'POS Terminal', 'Dynamic Multi-Tenant SaaS']
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
