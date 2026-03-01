# 要件レビュー

`/Users/hiroshiimaizumi/Downloads/hospital-number-monitor_requirements.md` を確認し、初期実装に着手できる状態です。

## 良い点

- スコープが単一ユーザー・単一監視対象に絞られている
- API、KV、通知、Cron の前提が明確
- 無料枠優先という制約が最初から定義されている
- 受入条件が実装対象に直結している

## 実装前に最終確定したい点

- 監視対象ページから番号を抜くための正規表現
- 連続失敗のしきい値
- ntfy の実際のトピック名
- 共有トークンの運用方法

## 確定した点

- 監視対象 URL: `https://junban-watch.com/free/sie3f4/index.php`
- 現在の HTML では `<td class="goods_name">1</td>` のように番号が出るため、抽出は `td.goods_name` に限定する

## 今回の初期実装で置いた前提

- 単一の KV キーで状態を保持する
- 共有トークンは UI 入力値として API に渡す
- 監視開始時に即時チェックを 1 回実行する
- 最終通知が成功した時点で `enabled=false` にする
- 事前通知と到達通知が同一タイミングに重なる場合は、到達通知を優先する
