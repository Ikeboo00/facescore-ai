# 🚀 FaceScore AI デプロイガイド

## Netlify + Render で無料デプロイ

### 📋 準備

1. **GitHubアカウント** - リポジトリ作成
2. **Renderアカウント** - バックエンドデプロイ用
3. **Netlifyアカウント** - フロントエンドデプロイ用

---

## ステップ1: GitHubリポジトリ作成

```bash
# プロジェクトディレクトリで実行
git init
git add .
git commit -m "Initial commit"

# GitHubでリポジトリ作成後
git remote add origin https://github.com/あなたのユーザー名/facescore-ai.git
git push -u origin main
```

---

## ステップ2: Render でバックエンドデプロイ

### 2.1 Renderでアカウント作成
1. [render.com](https://render.com) にアクセス
2. "Get Started for Free" をクリック
3. GitHubでサインアップ

### 2.2 PostgreSQLデータベース作成
1. Renderダッシュボードで "New +" → "PostgreSQL"
2. 設定：
   - **Name**: `facescore-postgres`
   - **Database**: `facescore_db`
   - **User**: `facescore_user`
   - **Region**: お近くのリージョン（例：Singapore）
3. "Create Database" をクリック

### 2.3 バックエンドサービス作成
1. "New +" → "Web Service"
2. GitHubリポジトリを選択
3. 設定：
   - **Name**: `facescore-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm run start:prod`

### 2.4 環境変数設定
以下の環境変数を追加：

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | PostgreSQLの内部接続URL（自動取得） |
| `CORS_ORIGIN` | `https://あなたのNetlifyアプリ.netlify.app` |
| `JWT_SECRET` | 32文字以上のランダム文字列 |
| `SESSION_SECRET` | 32文字以上のランダム文字列 |
| `MAX_FILE_SIZE` | `10485760` |
| `UPLOAD_DIR` | `/tmp/uploads` |
| `LOG_LEVEL` | `info` |
| `LOG_DIR` | `/tmp/logs` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |

**重要**: `DATABASE_URL` は PostgreSQL データベースの "Internal Database URL" を使用

---

## ステップ3: Netlify でフロントエンドデプロイ

### 3.1 Netlifyでアカウント作成
1. [netlify.com](https://netlify.com) にアクセス
2. "Start building for free" をクリック
3. GitHubでサインアップ

### 3.2 サイト作成
1. "Import from Git" をクリック
2. GitHubリポジトリを選択
3. 設定：
   - **Base directory**: `frontend`
   - **Build command**: `npm run build:prod`
   - **Publish directory**: `frontend/dist`

### 3.3 環境変数設定
Site settings → Environment variables で追加：

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://あなたのRenderアプリ.onrender.com` |
| `VITE_APP_TITLE` | `FaceScore AI` |
| `VITE_MAX_FILE_SIZE` | `10485760` |

---

## ステップ4: CORS設定の更新

### 4.1 NetlifyアプリのURLを確認
デプロイ完了後、NetlifyアプリのURL（例：`https://amazing-app-123.netlify.app`）をコピー

### 4.2 RenderでCORS_ORIGIN更新
1. Renderのバックエンドサービス設定
2. Environment → `CORS_ORIGIN` を更新
3. NetlifyのURLを設定（例：`https://amazing-app-123.netlify.app`）

### 4.3 NetlifyでAPI URL更新
1. NetlifyのEnvironment variables
2. `VITE_API_URL` を更新
3. RenderのバックエンドURL（例：`https://facescore-backend-abc.onrender.com`）

---

## ステップ5: データベースマイグレーション

Renderのバックエンドサービスで：
1. "Shell" タブを開く
2. 以下のコマンドを実行：
```bash
npx prisma migrate deploy
```

---

## 🎉 デプロイ完了！

### 📱 アクセスURL
- **フロントエンド**: https://あなたのアプリ.netlify.app
- **バックエンドAPI**: https://あなたのバックエンド.onrender.com

### 🔄 自動デプロイ
- GitHubにpushすると自動的に再デプロイされます
- フロントエンド: Netlify が自動デプロイ
- バックエンド: Render が自動デプロイ

### 📊 監視
- **Render**: ダッシュボードでログ・メトリクス確認
- **Netlify**: ダッシュボードでデプロイ状況確認

---

## 🛠️ トラブルシューティング

### よくある問題

1. **CORS エラー**
   - CORS_ORIGIN が正しく設定されているか確認
   - NetlifyとRenderのURLが一致しているか確認

2. **データベース接続エラー**
   - DATABASE_URL が正しく設定されているか確認
   - PostgreSQL サービスが起動しているか確認

3. **ビルドエラー**
   - package.json の scripts が正しいか確認
   - 環境変数が正しく設定されているか確認

### ログ確認方法
- **Render**: サービス画面 → "Logs" タブ
- **Netlify**: サイト画面 → "Functions" → "Deploy log"

---

## 💡 次のステップ

- カスタムドメインの設定
- SSL証明書の自動更新確認
- 監視・アラート設定
- バックアップ設定