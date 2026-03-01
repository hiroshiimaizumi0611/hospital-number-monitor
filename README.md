# hospital-number-monitor

Cloudflare Workers + Workers KV + Cron Trigger + ntfy で動かす、病院受付番号監視システムの初期スキャフォールドです。

## 今回作成したもの

- Workers 本体のひな形
- 監視開始 / 停止 / 状態取得 API
- iPhone Safari 向けの最小 UI
- Cron Trigger で 1 分ごとに実行する監視処理
- ntfy 通知の送信処理

## セットアップ

1. 依存関係をインストールする

```bash
npm install
```

2. Cloudflare API トークンを環境変数に設定する

```bash
export CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
```

3. KV Namespace を作成し、`wrangler.toml` の ID を差し替える

```bash
npx wrangler kv namespace create MONITOR_STATE
npx wrangler kv namespace create MONITOR_STATE --preview
```

4. ローカル開発用に `.dev.vars` を作成する

```bash
cp .dev.vars.example .dev.vars
```

5. Secret を設定する

```bash
npx wrangler secret put SHARED_TOKEN
npx wrangler secret put NTFY_TOPIC
```

6. `wrangler.toml` には現時点の実ページ URL を設定済みです。ページ構造が変わった場合だけ `NUMBER_EXTRACTOR_REGEX` を更新する

7. 開発起動する

```bash
npm run dev
```

## 未確定の要件

要件書の `19. 補足事項` はまだ未確定です。現状の実装では次を仮置きしています。

- UI 文言: 日本語の最小文言
- 通知文言: 要件書の例に近い文言
- エラー通知条件: 連続 3 回失敗時に 1 回だけ通知
- 自動停止条件: 到達通知送信成功時に停止

## 実装メモ

- 監視状態は単一ユーザー前提で KV の 1 キーに保存しています
- API は共有トークン必須です
- `NUMBER_EXTRACTOR_REGEX` は最初のキャプチャグループを現在番号として使います
- 現在の既定抽出パターンは `td.goods_name` を対象にしており、日付時刻の数字を避けています
- `POST /api/start` 実行時に、最初の 1 回は即時で監視処理を走らせます
