# GitHub PR レビューコメントビューアー - クイックスタートガイド

## 概要

このアプリケーションは、GitHubのPull Requestレビューコメントを一覧表示し、ドリルダウン形式で確認できるブラウザアプリです。CSVファイルとしてダウンロードすることも可能です。

## 必要なもの

1. モダンなWebブラウザ（Chrome、Firefox、Safari、Edge）
2. GitHub Personal Access Token（個人アクセストークン）

## セットアップ手順

### 1. GitHub Personal Access Tokenの作成

1. GitHubにログイン
2. Settings（設定） → Developer settings → Personal access tokens → Tokens (classic)
3. "Generate new token (classic)" をクリック
4. トークンに名前を付ける（例：「PRコメントビューアー」）
5. スコープを選択：
   - **パブリックリポジトリのみ**: `public_repo`
   - **プライベートリポジトリも含む**: `repo`
6. "Generate token" をクリック
7. **トークンをコピー**（後で見ることはできません）

### 2. アプリケーションの起動

`index.html` をブラウザで開くだけです：

- ファイルをダブルクリック
- または、ブラウザにドラッグ&ドロップ

## 使い方

### ステップ1: 認証

1. GitHub Personal Access Tokenを入力
2. 「Authenticate」ボタンをクリック
3. 成功すると、GitHubユーザー名が表示されます

### ステップ2: フィルター設定

1. **リポジトリ**: `owner/repo` 形式で入力（例：`facebook/react`）
2. **期間**: 開始日と終了日を選択（デフォルトは過去30日間）
3. **キーワード**: 
   - 定義済みキーワードをチェック: DEV, DESIGN, SEC, TEST, PERF
   - カスタムキーワードを追加（カンマ区切り）
4. 「Fetch Comments」ボタンをクリック

### ステップ3: 結果の確認

- コメントはPull Request単位でグループ化されます
- PRヘッダーをクリックすると展開/折りたたみができます
- 各コメントには以下が表示されます：
  - 作成者とタイムスタンプ
  - コメントタイプ（Review、Review Comment、Issue Comment）
  - レビュー状態（該当する場合）
  - ファイルパスと行番号（レビューコメントの場合）
  - マッチしたキーワード（タグとして表示）

### ステップ4: CSVエクスポート

1. 「Download CSV」ボタンをクリック
2. `pr-comments-{タイムスタンプ}.csv` という名前でダウンロードされます
3. CSVには以下の列が含まれます：
   - PR番号、PRタイトル、PR作成者、PR状態、PR作成日
   - コメントタイプ、コメント作成者、コメント本文、コメント作成日
   - ファイルパス、行番号、レビュー状態、マッチしたキーワード

## 主な機能

### キーワードフィルタリング

- コメント本文内でキーワードを検索（大文字小文字を区別しない）
- 定義済みキーワード: DEV, DESIGN, SEC, TEST, PERF
- カスタムキーワードの追加が可能
- リアルタイムでフィルタリング可能

### コメントタイプ

1. **Review**: PR全体のレビュー（APPROVED、CHANGES_REQUESTED、COMMENTED）
2. **Review Comment**: コード変更に対する行単位のコメント
3. **Issue Comment**: PRディスカッションの一般的なコメント

### 日付範囲

- デフォルト: 過去30日間
- PR作成日でフィルタリング
- 終了日は当日全体を含む

## トラブルシューティング

### 「Invalid token or authentication failed」

- トークンが正しいか確認
- 必要なスコープ（`repo` または `public_repo`）があるか確認
- トークンが期限切れでないか確認

### 「Repository not found」

- リポジトリ形式を確認: `owner/repo`
- リポジトリへのアクセス権があるか確認
- プライベートリポジトリの場合、トークンに `repo` スコープが必要

### 「No pull requests found」

- 日付範囲を調整
- 指定期間内にPRが存在するか確認
- リポジトリ名が正しいか確認

### レート制限超過

- レート制限がリセットされるまで待つ
- 日付範囲を狭めてPR数を減らす
- 認証済みリクエストを使用（制限が高い）

## セキュリティに関する注意

- Personal Access Tokenは `sessionStorage` に保存（タブを閉じると削除）
- トークンはログやコンソールに表示されません
- すべてのAPI呼び出しはHTTPSを使用
- ユーザー入力はサニタイズされます（XSS対策）

## APIレート制限

GitHub APIにはレート制限があります：
- **認証済みリクエスト**: 1時間あたり5,000リクエスト
- **未認証リクエスト**: 1時間あたり60リクエスト

多数のPRがあるリポジトリでは、取得に時間がかかる場合があります。

## ブラウザ互換性

- Chrome/Edge: ✅ 完全サポート
- Firefox: ✅ 完全サポート
- Safari: ✅ 完全サポート
- Internet Explorer: ❌ 非サポート（モダンブラウザを使用してください）

## プライバシー

- データはGitHub API以外のサーバーに送信されません
- すべての処理はブラウザ内で行われます
- トークンは sessionStorage にのみ保存（永続化されません）
- アナリティクスやトラッキングはありません

## 使用例

### 例1: セキュリティ関連のコメントを検索

1. リポジトリを入力: `your-org/your-repo`
2. キーワード「SEC」をチェック
3. カスタムキーワードに「security, vulnerability, CVE」を追加
4. Fetch Comments をクリック

### 例2: 特定期間のレビューコメントをエクスポート

1. リポジトリを入力
2. 開始日: 2024-01-01
3. 終了日: 2024-01-31
4. Fetch Comments をクリック
5. Download CSV をクリック

### 例3: パフォーマンス関連のコメントを確認

1. リポジトリを入力
2. キーワード「PERF」をチェック
3. カスタムキーワードに「performance, optimization, slow」を追加
4. Fetch Comments をクリック

## サポート

問題や質問がある場合：
1. トラブルシューティングセクションを確認
2. GitHub APIドキュメントを参照: https://docs.github.com/ja/rest
3. このリポジトリにissueを作成

---

**注意**: このアプリケーションはGitHub APIからデータを取得するため、インターネット接続が必要です。