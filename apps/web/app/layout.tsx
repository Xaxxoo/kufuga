import type { Metadata } from 'next';
import { DM_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { ToastProvider } from '../components/toast';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-display', display: 'swap', weight: ['500', '600', '700', '800', '900'] });
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Kufuga | Smarter poultry. Stronger proof.',
  description: 'IoT poultry monitoring and tamper-evident farm records for Africa.',
  icons: { icon: '/icon.svg' },
  manifest: '/manifest.webmanifest',
  openGraph: { title: 'Kufuga', description: 'IoT poultry monitoring and tamper-evident farm records for Africa.', images: ['/og-image.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('kufuga-theme')==='dark'||(!localStorage.getItem('kufuga-theme')&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}` }} /></head>
      <body className="font-body"><Providers><ToastProvider>{children}</ToastProvider></Providers></body>
    </html>
  );
}
