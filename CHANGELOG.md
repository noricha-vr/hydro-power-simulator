# Changelog

変更履歴は Keep a Changelog 形式で記録します。

## [Unreleased]

### Security

- Vite 8.3.5、Wrangler 4.151.3 と関連する esbuild・sharp・undici・ws を更新しました。
- SvelteKit が使う cookie を 0.7.2 に、postcss-selector-parser を 7.1.6 に固定しました（Dependabot アラート対応。postcss-selector-parser は 6 系に修正版が無いため override。出力 CSS は更新前後で同一）。

### Fixed

- SvelteKit 2 と互換性のある Cloudflare アダプター 7.2.9 を使用し、Pages ビルドの失敗を修正しました。
- クリーンインストール後も Svelte の TypeScript パーサーが解決できるよう、acorn 8.19.0 を明示しました。

### Changed

- どこからも import されていない svelte-chartjs を依存から外しました（チャートは chart.js を直接使用）。
- ビルド環境は Node.js 22.12以上の22系、または24以上が必要です。
