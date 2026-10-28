# Changelog

変更履歴は Keep a Changelog 形式で記録します。

## [Unreleased]

### Changed

- SvelteKit を 3.1.0、Cloudflare アダプターを 8.0.1 に更新しました。設定を `svelte.config.js` から `vite.config.ts` の `sveltekit(...)` に移し、`$lib` を `#lib`、`$app/stores` を `$app/state` に置き換えました（画面の見た目と動作は変わりません）。

### Security

- SvelteKit 3 への更新で、cookie の固定（0.7.2）を外しました（SvelteKit 3 は cookie 2 系を必要とするため。SvelteKit の Dependabot アラート 2 件も解消します）。

- 開発用ツール（miniflare）が固定している undici を override で 7.30.1 に上げました（Dependabot アラート対応。配信物には含まれません）。
- Vite 8.3.5、Wrangler 4.151.3 と関連する esbuild・sharp・undici・ws を更新しました。
- SvelteKit が使う cookie を 0.7.2 に、postcss-selector-parser を 7.1.6 に固定しました（Dependabot アラート対応。postcss-selector-parser は 6 系に修正版が無いため override。出力 CSS は更新前後で同一）。

### Fixed

- SvelteKit 2 と互換性のある Cloudflare アダプター 7.2.9 を使用し、Pages ビルドの失敗を修正しました。
- クリーンインストール後も Svelte の TypeScript パーサーが解決できるよう、acorn 8.19.0 を明示しました。

### Changed

- 型チェックに TypeScript 7.0.2 を使用し、Svelte ツールの API 互換性のため TypeScript 6.0.3 を併用します。`npm run check` と `npm run check:watch` は `svelte-check --tsgo` で実行します。
- どこからも import されていない svelte-chartjs を依存から外しました（チャートは chart.js を直接使用）。
- ビルド環境は Node.js 22.12以上の22系、または24以上が必要です。
