'use client';

import type { FC } from 'react';

/**
 * スキップナビゲーションリンクコンポーネント
 *
 * WCAG 2.4.1 Bypass Blocks (Level A) に対応
 * キーボードユーザーが繰り返しナビゲーションをスキップできるようにします
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html
 */
export const SkipLink: FC = () => {
	return (
		<>
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: Safe static CSS for skip link styling */}
			<style
				dangerouslySetInnerHTML={{
					__html: `
				.skip-link {
					position: fixed;
					left: 1rem;
					top: -100vh;
					z-index: 50;
					border-radius: 0.375rem;
					background-color: rgb(37 99 235);
					padding: 0.5rem 1rem;
					color: white;
					box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
					transition: top 0.2s ease-in-out;
					text-decoration: none;
				}

				.skip-link:focus,
				.skip-link:focus-visible {
					top: 1rem !important;
					outline: 2px solid rgb(59 130 246);
					outline-offset: 2px;
				}
			`,
				}}
			/>
			<a href="#main-content" className="skip-link">
				メインコンテンツへスキップ
			</a>
		</>
	);
};
