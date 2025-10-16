import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '鳴門市避難所マップ',
    short_name: '鳴門避難所',
    description: '徳島県鳴門市の避難所を地図上に可視化するPWAアプリ',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    // TODO: Add PWA icons before production deployment
    // Generate icons using: https://realfavicongenerator.net/
    // or https://www.pwabuilder.com/imageGenerator
    icons: [],
    categories: ['utilities', 'lifestyle', 'navigation'],
    lang: 'ja',
    dir: 'ltr',
  };
}
