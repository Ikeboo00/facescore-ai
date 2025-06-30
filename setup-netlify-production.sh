#!/bin/bash

echo "🌐 Netlify + 本番環境 完全自動セットアップ"
echo "========================================"
echo ""
echo "🎯 Netlifyの特徴:"
echo "✅ 開発者に最も人気"
echo "✅ Git連携自動デプロイ"
echo "✅ 無料SSL証明書"
echo "✅ CDN高速配信"
echo "✅ チーム共有が簡単"
echo ""

# Step 1: Netlifyアカウント設定
echo "📝 ステップ1: Netlifyアカウント設定"
echo "=============================="
echo ""
echo "1. https://www.netlify.com/ にアクセス"
echo "2. 「Get started for free」をクリック"
echo "3. GitHubアカウントでサインアップ（推奨）"
echo "   または Email/Passwordで新規登録"
echo "4. アカウント認証を完了"
echo ""
read -p "Netlifyアカウント作成が完了したら Enter を押してください..."

# Step 2: サイト作成方法の選択
echo ""
echo "🚀 ステップ2: サイト作成方法"
echo "========================"
echo ""
echo "方法の選択:"
echo "A) 手動デプロイ（簡単・即座）: ランダムURL取得"
echo "B) Git連携（本格運用）: リポジトリと連携"
echo ""
read -p "どちらを選択しますか？ (A/B): " deploy_method

if [[ $deploy_method == [Aa] ]]; then
    echo ""
    echo "📝 手動デプロイ設定:"
    echo "1. Netlifyダッシュボードで「Sites」をクリック"
    echo "2. 「Deploy manually」または「Drag and drop」エリアを探す"
    echo "3. 任意のHTMLファイルをアップロード（後で置き換え可能）"
    echo "4. 自動的にランダムなURLが生成されます"
    echo "   例: https://amazing-curie-123abc.netlify.app"
    echo "5. 後でサイト名をカスタマイズ可能"
    echo ""
    echo "または、空のプロジェクトを作成:"
    echo "1. 「Add new site」→「Deploy manually」"
    echo "2. 空のフォルダをドラッグ&ドロップ"
    echo ""
    read -p "生成されたNetlify URLを入力してください（例: amazing-curie-123abc.netlify.app）: " NETLIFY_DOMAIN
    
    DOMAIN="$NETLIFY_DOMAIN"
    DEPLOYMENT_TYPE="manual"
else
    echo ""
    echo "📝 Git連携設定:"
    echo "1. Netlifyダッシュボードで「Add new site」をクリック"
    echo "2. 「Import an existing project」を選択"
    echo "3. GitHubリポジトリを選択"
    echo "4. ビルド設定を行う"
    echo "5. デプロイ完了後にURLが表示されます"
    echo ""
    read -p "作成されたNetlify URLを入力してください: " NETLIFY_DOMAIN
    
    DOMAIN="$NETLIFY_DOMAIN"
    DEPLOYMENT_TYPE="git"
fi

# ドメイン形式を確認・補正
if [[ ! "$DOMAIN" == *.netlify.app ]]; then
    if [[ "$DOMAIN" == *netlify.app* ]]; then
        # 既にnetlify.appが含まれている場合はそのまま
        DOMAIN="$DOMAIN"
    else
        # .netlify.appを追加
        DOMAIN="${DOMAIN}.netlify.app"
    fi
fi

echo "✅ 使用ドメイン: https://$DOMAIN"

# Step 3: データベース設定
echo ""
echo "💾 ステップ3: データベース設定"
echo "=========================="
read -p "データベースパスワードを設定してください: " DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ データベースパスワードは必須です"
    exit 1
fi

# Step 4: セキュリティキー生成
echo ""
echo "🔐 ステップ4: セキュリティキー生成中..."
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Step 5: 本番環境設定ファイル作成
echo ""
echo "📝 ステップ5: 本番環境設定作成中..."

# バックエンド設定
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://facescore_user:${DB_PASSWORD}@postgres:5432/facescore_db?schema=public"
CORS_ORIGIN="https://${DOMAIN}"
JWT_SECRET="${JWT_SECRET}"
SESSION_SECRET="${SESSION_SECRET}"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="/app/uploads"
LOG_LEVEL=warn
LOG_DIR="/app/logs"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
TRUST_PROXY=true
SECURE_COOKIES=true
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=strict
# Netlify設定
NETLIFY_SITE_URL=https://${DOMAIN}
EOF

# フロントエンド設定
cat > frontend/.env.production << EOF
VITE_API_URL=https://${DOMAIN}
VITE_APP_TITLE="FaceScore AI"
VITE_MAX_FILE_SIZE=10485760
VITE_DOMAIN="${DOMAIN}"
VITE_ENVIRONMENT=production
EOF

# Netlify対応Docker Compose
cat > docker-compose.netlify.yml << EOF
version: '3.8'

services:
  # PostgreSQLデータベース
  postgres:
    image: postgres:15-alpine
    container_name: facescore-postgres-netlify
    environment:
      POSTGRES_DB: facescore_db
      POSTGRES_USER: facescore_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U facescore_user -d facescore_db"]
      interval: 30s
      timeout: 10s
      retries: 5

  # バックエンドAPI
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: facescore-backend-netlify
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # フロントエンド（ローカルビルド用）
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: facescore-frontend-netlify
    env_file:
      - ./frontend/.env.production
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Nginx（バックエンドのみプロキシ）
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile.netlify
    container_name: facescore-nginx-netlify
    volumes:
      - ./nginx/nginx.netlify.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: unless-stopped
    environment:
      - DOMAIN=${DOMAIN}

volumes:
  postgres_data:

networks:
  default:
    driver: bridge
EOF

# Netlify用Nginx設定（バックエンドAPI専用）
mkdir -p nginx
cat > nginx/nginx.netlify.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # ログ設定
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # 基本設定
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 10M;
    
    # セキュリティヘッダー
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # CORS設定
    add_header Access-Control-Allow-Origin "https://${DOMAIN}" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=upload:10m rate=2r/s;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml;

    server {
        listen 80;
        server_name _;
        
        # API endpoints
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend:3001;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Preflight requests
            if (\$request_method = 'OPTIONS') {
                add_header Access-Control-Allow-Origin "https://${DOMAIN}";
                add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
                add_header Access-Control-Allow-Headers "Authorization, Content-Type";
                add_header Access-Control-Max-Age 1728000;
                add_header Content-Type "text/plain charset=UTF-8";
                add_header Content-Length 0;
                return 204;
            }
        }
        
        # ファイルアップロード
        location /api/upload {
            limit_req zone=upload burst=5 nodelay;
            
            proxy_pass http://backend:3001;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            proxy_read_timeout 300;
            proxy_send_timeout 300;
        }
        
        # ヘルスチェック
        location /health {
            proxy_pass http://backend:3001/api/health;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # その他のリクエストは404
        location / {
            return 404 "API only - Frontend is served by Netlify";
        }
    }
}
EOF

# Netlify用Dockerfile
cat > nginx/Dockerfile.netlify << EOF
FROM nginx:alpine

# 設定ファイルをコピー
COPY nginx.netlify.conf /etc/nginx/nginx.conf

# curlをインストール
RUN apk add --no-cache curl

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Netlify設定ファイル
cat > netlify.toml << EOF
[build]
  base = "frontend"
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "http://YOUR_SERVER_IP:3001/api/:splat"
  status = 200
  force = true

[context.production.environment]
  VITE_API_URL = "https://${DOMAIN}"
  VITE_APP_TITLE = "FaceScore AI"
  VITE_MAX_FILE_SIZE = "10485760"
EOF

# フロントエンドビルド＆デプロイ準備
cat > deploy-to-netlify.sh << 'EOF'
#!/bin/bash

echo "🚀 Netlifyデプロイ準備"
echo "==================="

# フロントエンドビルド
echo "📦 フロントエンドビルド中..."
cd frontend
npm install
npm run build

# Netlify CLI のインストール確認
if ! command -v netlify &> /dev/null; then
    echo "📥 Netlify CLI インストール中..."
    npm install -g netlify-cli
fi

echo ""
echo "🌐 Netlifyデプロイ方法:"
echo "====================="
echo ""
echo "方法1: 手動デプロイ"
echo "  1. frontend/dist フォルダをZIPで圧縮"
echo "  2. Netlifyサイトの「Deploys」タブ"
echo "  3. ZIPファイルをドラッグ&ドロップ"
echo ""
echo "方法2: Netlify CLI"
echo "  netlify login"
echo "  netlify deploy --prod --dir=dist"
echo ""
echo "✅ フロントエンドビルド完了: frontend/dist/"
EOF

chmod +x deploy-to-netlify.sh

echo ""
echo "🎉 Netlify本番環境設定完了！"
echo "=========================="
echo ""
echo "🌐 あなたのドメイン: https://${DOMAIN}"
echo "🔐 JWT Secret: ${JWT_SECRET}"
echo "🔐 Session Secret: ${SESSION_SECRET}"
echo ""
echo "🚀 次のステップ:"
echo "================"
echo ""
echo "1️⃣  バックエンド本番環境起動:"
echo "   docker-compose -f docker-compose.netlify.yml up -d"
echo ""
echo "2️⃣  データベース初期化:"
echo "   docker-compose -f docker-compose.netlify.yml exec backend npx prisma db push"
echo ""
echo "3️⃣  フロントエンドデプロイ:"
echo "   ./deploy-to-netlify.sh"
echo ""
echo "4️⃣  動作確認:"
echo "   curl http://YOUR_SERVER_IP:3001/api/health"
echo "   https://${DOMAIN} でフロントエンド確認"
echo ""
echo "📊 Netlifyの特徴:"
echo "==============="
echo "✅ 無料SSL証明書自動取得"
echo "✅ CDN高速配信"
echo "✅ Git連携自動デプロイ"
echo "✅ プレビュー機能"
echo "✅ フォーム処理"
echo "✅ 詳細なアクセス解析"
echo ""
echo "🛡️  セキュリティ:"
echo "==============="
echo "✅ HTTPS強制"
echo "✅ セキュリティヘッダー"
echo "✅ DDoS防護"
echo "✅ Rate Limiting"
echo ""
echo "👥 チーム共有用URL:"
echo "=================="
echo "   フロントエンド: https://${DOMAIN}"
echo "   API: http://YOUR_SERVER_IP:3001/api"
echo ""
echo "📝 管理画面:"
echo "==========="
echo "   https://app.netlify.com/"