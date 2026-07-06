import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'VPS Panel',
  description: 'Enterprise VPS Management Panel',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
