# 水力発電シミュレーター (Hydroelectric Power Simulator)

このアプリケーションは、水力発電の発電量を計算するシミュレーターです。水流量、有効落差、効率などのパラメータを入力することで、発電出力、年間発電量、供給可能な一般家庭数などを計算します。

## 特徴

- 水流量と有効落差に基づく発電量計算
- 効率係数の調整
- 年間稼働時間のカスタマイズ
- 年間発電量と二酸化炭素削減量の計算
- 一般家庭の供給可能数の推定

## 技術スタック

- [SvelteKit](https://kit.svelte.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Cloudflare Pages](https://pages.cloudflare.com/)

## セットアップと実行方法

### 必要条件

- Node.js 22.17以上の22系、または24以上（CIは22系）
- npm 8以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/hydro-power-simulator.git
cd hydro-power-simulator

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

これにより、`http://localhost:5173` でアプリケーションが起動します。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `.svelte-kit/cloudflare` ディレクトリに生成されます。

### 型チェック

```bash
npm run check
# 変更を監視する場合
npm run check:watch
```

型チェックは TypeScript 7.0.2（`@typescript/native` の npm alias）を `svelte-check --tsgo` から使用します。Svelte ツールが利用する JavaScript API のため、`typescript` には TypeScript 6.0.3 もインストールします。

## Cloudflareへのデプロイ

### 必要条件

- `npm ci --legacy-peer-deps` でインストールした、ロックファイルに固定された [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)
- 既存プロジェクト `hydro-power-simulator` に配信できる Cloudflare 認証

### デプロイ手順

1. 依存関係をインストール:

```bash
npm ci --legacy-peer-deps
```

2. まだ認証していない場合は、通常のターミナルで Cloudflare にログイン:

```bash
./node_modules/.bin/wrangler login
```

3. 配信対象の main の SHA を固定した clean な作業コピーで、型チェックとビルド:

```bash
npm run check
npm run build
```

4. GitHub の main とビルドしたコミットの一致を再確認し、既存の Cloudflare Pages プロジェクトに配信:

```bash
RELEASE_SHA=$(git rev-parse HEAD)
test "$(gh api repos/noricha-vr/hydro-power-simulator/commits/main --jq .sha)" = "$RELEASE_SHA" &&
test -z "$(git status --porcelain)" &&
CI=true ./node_modules/.bin/wrangler pages deploy .svelte-kit/cloudflare \
  --project-name hydro-power-simulator --branch main \
  --commit-hash "$RELEASE_SHA" --commit-dirty=false
```

Git 連携による自動配信はありません。配信後は [本番サイト](https://hydro-power-simulator.kojin.works/) と [Pages URL](https://hydro-power-simulator.pages.dev/) で表示・再計算・グラフを確認します。SHA の固定、配信履歴の記録、監視、復旧の詳しい手順は [AGENTS.md](AGENTS.md) を参照してください。

## 計算式について

水力発電の出力は以下の式で計算されます：

```
P = η * ρ * g * Q * H
```

ここで：
- P = 発電出力 (ワット)
- η = タービンと発電機の効率 (通常0.7〜0.9)
- ρ = 水の密度 (1000 kg/m³)
- g = 重力加速度 (9.81 m/s²)
- Q = 水流量 (m³/s)
- H = 有効落差 (m)

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 貢献

貢献は歓迎します！バグの報告や機能提案は、Issueを作成するか、プルリクエストを送信してください。
