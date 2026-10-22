# Changelog

変更履歴は Keep a Changelog 形式で記録します。

## [Unreleased]

### Security

- Vite 8.3.5、Wrangler 4.151.3 と関連する esbuild・sharp・undici・ws を更新しました。

### Fixed

- SvelteKit 2 と互換性のある Cloudflare アダプター 7.2.9 を使用し、Pages ビルドの失敗を修正しました。
- クリーンインストール後も Svelte の TypeScript パーサーが解決できるよう、acorn 8.19.0 を明示しました。

### Changed

- ビルド環境は Node.js 22.12以上の22系、または24以上が必要です。
