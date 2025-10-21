/**
 * Lighthouse CI Configuration
 * @see https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md
 */

module.exports = {
  ci: {
    collect: {
      // 実行回数（中央値を採用）
      numberOfRuns: 3,

      // モバイル優先
      settings: {
        preset: 'desktop',
        // Chrome flags for performance
        chromeFlags: '--no-sandbox --disable-gpu',
      },
    },

    assert: {
      // スコア閾値（100点満点）
      assertions: {
        // Performance（目標: 90以上）
        'categories:performance': ['error', { minScore: 0.9 }],

        // Accessibility（目標: 95以上）
        'categories:accessibility': ['error', { minScore: 0.95 }],

        // Best Practices（目標: 90以上）
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO（目標: 95以上）
        'categories:seo': ['error', { minScore: 0.95 }],

        // PWA（目標: 90以上）
        'categories:pwa': ['warn', { minScore: 0.9 }],

        // Core Web Vitals
        // LCP: < 2.5s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],

        // CLS: < 0.1（PR #37で達成した0.00を維持）
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],

        // FID（First Input Delay）の代替: TBT (Total Blocking Time) < 200ms
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
      },
    },

    upload: {
      // GitHub Actionsアーティファクトとして保存
      target: 'temporary-public-storage',
    },
  },
};
