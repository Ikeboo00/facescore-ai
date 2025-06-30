# 無料ホスティングデプロイガイド

## Netlify (フロントエンド) + Render (バックエンド)

### 1. Render でバックエンドデプロイ

1. [Render.com](https://render.com) でアカウント作成
2. "New Web Service" を選択
3. GitHub リポジトリを連携
4. 設定：
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - 環境変数を設定

### 2. Netlify でフロントエンドデプロイ

1. [Netlify.com](https://netlify.com) でアカウント作成
2. "New site from Git" を選択
3. GitHub リポジトリを連携
4. 設定：
   - Build Command: `cd frontend && npm run build:prod`
   - Publish Directory: `frontend/dist`
   - 環境変数を設定

### 3. 自動取得されるURL例

- Render バックエンド: `https://facescore-api-xyz.onrender.com`
- Netlify フロントエンド: `https://facescore-app-xyz.netlify.app`

### 4. CORS設定更新

```bash
# バックエンド環境変数 (Render)
CORS_ORIGIN=https://facescore-app-xyz.netlify.app

# フロントエンド環境変数 (Netlify)
VITE_API_URL=https://facescore-api-xyz.onrender.com
```