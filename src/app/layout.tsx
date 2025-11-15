import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import type { ReactNode } from 'react';
import { SkipLink } from '@/components/a11y/SkipLink';
import { InstallPrompt } from '@/components/pwa/InstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { UpdateNotification } from '@/components/pwa/UpdateNotification';
import { viewport } from './viewport';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
  weight: ['400', '700'],
  display: 'swap', // フォント読み込み中のレイアウトシフトを防ぐ
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  title: '鳴門市避難所マップ',
  description: '徳島県鳴門市の避難所を地図上に可視化するPWAアプリ',
  manifest: '/manifest.json',
};

export { viewport };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="font-sans antialiased">
        <SkipLink />
        {children}
        <OfflineIndicator />
        <InstallPrompt />
        <UpdateNotification />
      </body>
    </html>
  );
}
