# エージェント向け作業手順

## 開発・検証

- SvelteKit / TypeScript の水力発電シミュレーター。設定は `vite.config.ts`、計算処理は `src/lib/hydroPower.ts`。
- Node.js 22.17 以上の 22 系、または 24 以上を使う。依存は `package-lock.json` に合わせ、既存 CI と同じ npm コマンドで検証する。
- `.agents/git-policy` がある場合は従う。ない場合は作業ブランチと PR を使う。配信のためにローカルの main を書き換えない。
- 公開リポジトリのため、認証情報・秘密の値・無関係なリポジトリやサービスの情報をコミットしない。

```bash
npm ci --legacy-peer-deps
npm run check
npm run build
```

型チェックはエラー 0 件、ビルドは終了コード 0 を確認する。既存警告と新規警告を区別する。テスト用スクリプトは未定義のため、配信後の操作確認も行う。

## Cloudflare Pages への手動配信

- 既存の Pages プロジェクト: `hydro-power-simulator`
- 本番ブランチ: `main`
- ビルド出力: `.svelte-kit/cloudflare`（`wrangler.toml` の `pages_build_output_dir`）
- 本番 URL: https://hydro-power-simulator.kojin.works/
- Pages URL: https://hydro-power-simulator.pages.dev/
- Git 連携による自動配信はない。PR のマージや CI 成功だけでは配信済みとしない。
- ロックファイルに固定されたローカル Wrangler を使う。新規プロジェクトの作成、プロジェクト設定・権限・シークレットの変更は行わない。
- 既存の Wrangler 認証を利用し、認証ファイルや `.env*` の内容を表示しない。認証が使えなければ配信を止めて報告する。対話式ログインはエージェント内で起動しない。

### 1. 配信するコミットを固定する

リポジトリのルートで、GitHub の既定ブランチとその SHA を取得する。作業ブランチや PR の head を本番に出さない。

```bash
RELEASE_BRANCH=$(gh repo view noricha-vr/hydro-power-simulator --json defaultBranchRef --jq '.defaultBranchRef.name')
test "$RELEASE_BRANCH" = main || exit 1
RELEASE_SHA=$(gh api "repos/noricha-vr/hydro-power-simulator/commits/$RELEASE_BRANCH" --jq .sha)
git fetch origin "$RELEASE_BRANCH"
git cat-file -e "$RELEASE_SHA^{commit}" || exit 1
RELEASE_PARENT=$(mktemp -d "${TMPDIR:-/tmp}/hydro-power-release.XXXXXX")
RELEASE_WORKTREE="$RELEASE_PARENT/worktree"
git worktree add --detach "$RELEASE_WORKTREE" "$RELEASE_SHA"
cd "$RELEASE_WORKTREE"
```

取得後に GitHub の SHA が進んだ場合は古い成果物を配信せず、新しい SHA で差分確認・検証・ビルドをやり直す。

### 2. 検証し、配信先と直前の本番を記録する

```bash
npm ci --legacy-peer-deps
npm run check
npm run build
./node_modules/.bin/wrangler pages project list --json
./node_modules/.bin/wrangler pages deployment list \
  --project-name hydro-power-simulator --environment production --json
```

各コマンドの成功を確認してから進む。対象プロジェクトとドメインが一致することを確認し、直前の正常な Production deployment の ID・URL・Source を記録する。前回の配信コミットから今回までの差分も確認する。DB migration、データ変換・削除、設定変更、追加費用が必要なら実行前に相談する。

### 3. SHA を再照合して配信する

次のコマンドは、既定ブランチの SHA、worktree の SHA、未コミット変更の有無をすべて照合してから実行する。

```bash
test "$(gh repo view noricha-vr/hydro-power-simulator --json defaultBranchRef --jq '.defaultBranchRef.name')" = "$RELEASE_BRANCH" &&
test "$(gh api "repos/noricha-vr/hydro-power-simulator/commits/$RELEASE_BRANCH" --jq .sha)" = "$RELEASE_SHA" &&
test "$(git rev-parse HEAD)" = "$RELEASE_SHA" &&
test -z "$(git status --porcelain)" &&
CI=true ./node_modules/.bin/wrangler pages deploy .svelte-kit/cloudflare \
  --project-name hydro-power-simulator \
  --branch "$RELEASE_BRANCH" \
  --commit-hash "$RELEASE_SHA" \
  --commit-dirty=false
```

プロジェクト名・ブランチ・完全なコミット SHA を省略しない。CLI の正常終了と deployment URL を記録する。

### 4. 本番を確認する

```bash
./node_modules/.bin/wrangler pages deployment list \
  --project-name hydro-power-simulator --environment production --json
curl --fail --silent --show-error --output /dev/null \
  --write-out '%{http_code}\n' https://hydro-power-simulator.kojin.works/
curl --fail --silent --show-error --output /dev/null \
  --write-out '%{http_code}\n' https://hydro-power-simulator.pages.dev/
```

- 配信直後の ID・URL が Production の一覧にあり、Branch が `main`、Source が配信した SHA の短縮形と一致することを確認する。
- deployment URL と両方の本番 URL で HTTP 200 とページ見出しを確認する。HTML が参照する JS/CSS がビルド成果物と一致し、取得できることも確認する。
- ブラウザで初期表示と計算結果を確認する。水流量 0.5m³/秒・クロスフロー水車のまま落差を 10m → 20m → 10m と変え、出力が約 21.81kW → 43.61kW → 21.81kW に変化することを確認する。
- 発電出力・水車効率・発電量・経済性・環境影響の全タブでグラフを確認し、ブラウザの例外・通信エラーがないことを確認する。
- 少なくとも 1 分間、間隔を空けて本番 URL の応答と主要アセットを再確認する。CLI 成功だけで本番反映済みにしない。
- 異常時は追加配信を止め、Cloudflare Pages の配信履歴から記録済みの正常な Production deployment に戻して本番を再確認する。Worker 用の `wrangler rollback` は Pages に使わない。
- 完了報告には配信 SHA、deployment ID、本番 URL、型チェック・ビルド・操作確認・監視の結果を含める。

確認後はリポジトリのルートへ戻り、今回作成した clean な worktree だけを `git worktree remove "$RELEASE_WORKTREE"` で削除する。既存の worktree や他の作業には触れない。
