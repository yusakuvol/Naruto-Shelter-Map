import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SkipLink } from '@/components/a11y/SkipLink';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { viewport } from './viewport';
import './globals.css';

export const metadata: Metadata = {
  title: '避難所マップ',
  description:
    '徳島県鳴門市とその隣接地域の避難所を地図上に可視化するPWAアプリ',
  manifest: '/manifest.json',
};

export { viewport };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">
        <SkipLink />
        <ServiceWorkerRegistration />
        {children}
        <OfflineIndicator />
        <InstallPrompt />
        <UpdateNotification />
      </body>
    </html>
  );
}
