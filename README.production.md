# FaceScore AI - 本番環境デプロイガイド

## 概要

FaceScore AIを本番環境で動作させるための設定とデプロイ手順です。

## 本番環境の構成

- **フロントエンド**: React + Vite (Nginx でホスト)
- **バックエンド**: Node.js + Express + TypeScript
- **データベース**: PostgreSQL
- **プロセス管理**: PM2
- **リバースプロキシ**: Nginx
- **コンテナ化**: Docker + Docker Compose

## デプロイ前の準備

### 1. 環境変数の設定

#### バックエンド (.env.production)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://username:password@localhost:5432/facescore_db?schema=public"
CORS_ORIGIN="https://yourdomain.com"
JWT_SECRET="your-secure-jwt-secret"
SESSION_SECRET="your-secure-session-secret"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/app/uploads"
LOG_LEVEL=info
LOG_DIR="/app/logs"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### フロントエンド (.env.production)
```bash
VITE_API_URL=https://yourdomain.com
VITE_APP_TITLE="FaceScore AI"
VITE_MAX_FILE_SIZE=10485760
```

### 2. SSL証明書の準備

SSL証明書を `nginx/ssl/` ディレクトリに配置してください：
- `cert.pem` - SSL証明書
- `key.pem` - 秘密鍵

### 3. ドメイン設定

`nginx/nginx.conf` の `server_name` を実際のドメインに変更してください。

## デプロイ手順

### 方法1: Docker Compose を使用（推奨）

```bash
# リポジトリをクローン
git clone your-repository
cd face-score-ai

# 環境変数ファイルを編集
cp backend/.env.production.example backend/.env.production
cp frontend/.env.production.example frontend/.env.production
# 必要な値を設定

# デプロイスクリプトを実行
./deploy.sh
```

### 方法2: 手動デプロイ

```bash
# PostgreSQLデータベースを起動
docker-compose up -d postgres

# バックエンドをビルド・起動
cd backend
npm install
npm run build:prod
npm run db:migrate:prod
pm2 start ecosystem.config.js --env production

# フロントエンドをビルド・起動
cd ../frontend
npm install
npm run build:prod
docker build -t facescore-frontend .
docker run -d -p 80:80 facescore-frontend

# Nginxを起動
docker-compose up -d nginx
```

## 本番環境の機能

### セキュリティ機能
- **Helmet.js**: セキュリティヘッダーの設定
- **CORS**: クロスオリジンリクエスト制限
- **Rate Limiting**: API制限（15分間に100リクエスト）
- **SSL/TLS**: HTTPS通信の強制
- **CSP**: コンテンツセキュリティポリシー

### ログ機能
- **Winston**: 構造化ログ
- **ファイルログ**: エラーログと通常ログを分離
- **Nginx アクセスログ**: リクエストログ

### パフォーマンス
- **Gzip圧縮**: 静的ファイルの圧縮
- **キャッシュ設定**: 適切なキャッシュヘッダー
- **クラスター実行**: PM2によるマルチプロセス実行

## 監視とメンテナンス

### ログの確認
```bash
# アプリケーションログ
docker-compose logs backend
docker-compose logs frontend

# Nginxログ
docker-compose logs nginx

# PM2ログ（手動デプロイの場合）
pm2 logs facescore-backend
```

### データベースバックアップ
```bash
# データベースのバックアップ
docker-compose exec postgres pg_dump -U facescore_user facescore_db > backup.sql

# リストア
docker-compose exec -T postgres psql -U facescore_user facescore_db < backup.sql
```

### 更新手順
```bash
# アプリケーションの更新
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# データベースマイグレーション（必要な場合）
docker-compose run --rm backend npm run db:migrate:prod
```

## トラブルシューティング

### よくある問題

1. **データベース接続エラー**
   - DATABASE_URLが正しく設定されているか確認
   - PostgreSQLコンテナが起動しているか確認

2. **CORS エラー**
   - CORS_ORIGIN環境変数を確認
   - フロントエンドのドメインが正しく設定されているか確認

3. **SSL証明書エラー**
   - SSL証明書ファイルが正しい場所に配置されているか確認
   - 証明書の有効期限を確認

4. **ファイルアップロードエラー**
   - MAX_FILE_SIZE設定を確認
   - アップロードディレクトリの権限を確認

### パフォーマンス監視
```bash
# システムリソース
docker stats

# PM2監視
pm2 monit

# Nginxステータス
docker-compose exec nginx nginx -t
```

## セキュリティ考慮事項

- 定期的なセキュリティアップデート
- SSL証明書の更新
- ログの定期的な確認
- データベースの定期バックアップ
- 不要なポートの閉鎖
- ファイアウォールの設定

## サポート

問題が発生した場合は、以下のログを確認してください：
- アプリケーションログ
- Nginxログ
- データベースログ
- システムログ