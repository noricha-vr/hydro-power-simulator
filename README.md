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

- Node.js 18以上
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

## Cloudflareへのデプロイ

### 必要条件

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/)
- Cloudflareアカウント

### デプロイ手順

1. Wrangler CLIをインストール:

```bash
npm install -g wrangler
```

2. Cloudflareにログイン:

```bash
wrangler login
```

3. アプリケーションをビルド:

```bash
npm run build
```

4. Cloudflare Pagesにデプロイ:

```bash
wrangler pages deploy .svelte-kit/cloudflare
```

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
