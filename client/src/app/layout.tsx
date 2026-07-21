import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '../providers/QueryProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Astranox',
  description: 'An expansive browser-based Pokemon RPG.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
