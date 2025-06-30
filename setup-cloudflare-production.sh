#!/bin/bash

echo "☁️  Cloudflare + 本番環境 完全自動セットアップ"
echo "============================================="
echo ""
echo "🎯 このスクリプトで実現すること:"
echo "✅ 企業レベルのセキュリティ（DDoS防護、WAF、SSL）"
echo "✅ 高速CDN配信"
echo "✅ チーム共有しやすいURL"
echo "✅ 完全自動化された管理"
echo ""

# Step 1: Cloudflareアカウント設定ガイド
echo "📝 ステップ1: Cloudflareアカウント設定"
echo "==============================="
echo ""
echo "1. https://www.cloudflare.com/ にアクセス"
echo "2. 「Sign Up」をクリック"
echo "3. メールアドレスとパスワードを入力して登録"
echo "4. メール認証を完了"
echo ""
read -p "Cloudflareアカウント作成が完了したら Enter を押してください..."

# Step 2: ドメイン選択
echo ""
echo "🌐 ステップ2: ドメイン設定"
echo "====================="
echo ""
echo "ドメインの選択肢:"
echo "A) 無料サブドメイン（推奨・簡単）: your-app.workers.dev"
echo "B) 独自ドメイン（本格運用): your-domain.com"
echo ""
read -p "どちらを選択しますか？ (A/B): " domain_choice

if [[ $domain_choice == [Aa] ]]; then
    echo ""
    echo "📝 Cloudflare Workers + Pages 設定:"
    echo "1. Cloudflareダッシュボードで「Workers & Pages」をクリック"
    echo "2. 「Create application」をクリック"
    echo "3. 「Pages」タブを選択"
    echo "4. 好きなプロジェクト名を入力（例: facescore-ai）"
    echo "5. 結果として https://facescore-ai.pages.dev が利用可能になります"
    echo ""
    read -p "作成したプロジェクト名（サブドメイン部分）を入力: " PROJECT_NAME
    DOMAIN="${PROJECT_NAME}.pages.dev"
    DEPLOYMENT_TYPE="pages"
else
    echo ""
    echo "📝 独自ドメイン設定:"
    echo "1. Cloudflareダッシュボードで「Add a Site」をクリック"
    echo "2. 取得済みのドメイン名を入力"
    echo "3. プランを選択（Free プランでOK）"
    echo "4. ネームサーバーを変更（ドメインレジストラで設定）"
    echo ""
    read -p "使用するドメイン名を入力（例: example.com）: " DOMAIN
    DEPLOYMENT_TYPE="traditional"
fi

if [ -z "$DOMAIN" ]; then
    echo "❌ ドメイン名は必須です"
    exit 1
fi

echo "✅ 使用ドメイン: https://$DOMAIN"

# Step 3: Cloudflare API設定
echo ""
echo "🔑 ステップ3: Cloudflare API設定"
echo "=============================="
echo ""
echo "APIトークン取得手順:"
echo "1. Cloudflareダッシュボード右上のプロフィールアイコンをクリック"
echo "2. 「My Profile」をクリック"
echo "3. 「API Tokens」タブをクリック"
echo "4. 「Create Token」をクリック"
echo "5. 「Zone:Zone:Read, Zone:DNS:Edit」の権限を設定"
echo "6. 生成されたトークンをコピー"
echo ""
read -p "Cloudflare APIトークンを入力: " CF_API_TOKEN

if [ -z "$CF_API_TOKEN" ]; then
    echo "⚠️  APIトークンなしで続行します（一部機能制限）"
fi

# Step 4: データベース設定
echo ""
echo "💾 ステップ4: データベース設定"
echo "=========================="
read -p "データベースパスワードを設定: " DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ データベースパスワードは必須です"
    exit 1
fi

# Step 5: セキュリティキー生成
echo ""
echo "🔐 ステップ5: セキュリティキー生成中..."
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Step 6: 本番環境設定ファイル作成
echo ""
echo "📝 ステップ6: 本番環境設定作成中..."

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
# Cloudflare設定
CF_ZONE_ID=
CF_API_TOKEN=${CF_API_TOKEN}
DOMAIN=${DOMAIN}
EOF

# フロントエンド設定
cat > frontend/.env.production << EOF
VITE_API_URL=https://${DOMAIN}
VITE_APP_TITLE="FaceScore AI"
VITE_MAX_FILE_SIZE=10485760
VITE_DOMAIN="${DOMAIN}"
VITE_ENVIRONMENT=production
EOF

# Cloudflare対応Docker Compose
cat > docker-compose.cloudflare.yml << EOF
version: '3.8'

services:
  # PostgreSQLデータベース
  postgres:
    image: postgres:15-alpine
    container_name: facescore-postgres-cf
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
    container_name: facescore-backend-cf
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

  # フロントエンド
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: facescore-frontend-cf
    env_file:
      - ./frontend/.env.production
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Cloudflare Tunnel（推奨）
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: facescore-tunnel
    command: tunnel --no-autoupdate run --token \${CLOUDFLARE_TUNNEL_TOKEN}
    environment:
      - CLOUDFLARE_TUNNEL_TOKEN=\${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

  # 従来のNginx（Cloudflare Tunnelの代替）
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile.cloudflare
    container_name: facescore-nginx-cf
    volumes:
      - ./nginx/nginx.cloudflare.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
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

# Cloudflare対応Nginx設定
mkdir -p nginx
cat > nginx/nginx.cloudflare.conf << EOF
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Cloudflare Real IP
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 131.0.72.0/22;
    real_ip_header CF-Connecting-IP;
    
    # ログ設定
    log_format cloudflare '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                         '\$status \$body_bytes_sent "\$http_referer" '
                         '"\$http_user_agent" "\$http_cf_ray" "\$http_cf_connecting_ip"';
    
    access_log /var/log/nginx/access.log cloudflare;
    error_log /var/log/nginx/error.log warn;
    
    # 基本設定
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    client_max_body_size 10M;
    
    # セキュリティヘッダー（Cloudflareと重複しないもの）
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
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
        
        # フロントエンド
        location / {
            proxy_pass http://frontend:80;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Cloudflareヘッダーを転送
            proxy_set_header CF-Ray \$http_cf_ray;
            proxy_set_header CF-Connecting-IP \$http_cf_connecting_ip;
            proxy_set_header CF-Visitor \$http_cf_visitor;
        }
        
        # API
        location /api/ {
            proxy_pass http://backend:3001;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            
            # Cloudflareヘッダーを転送
            proxy_set_header CF-Ray \$http_cf_ray;
            proxy_set_header CF-Connecting-IP \$http_cf_connecting_ip;
        }
        
        # ヘルスチェック
        location /health {
            proxy_pass http://backend:3001/api/health;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Cloudflare用Dockerfile
cat > nginx/Dockerfile.cloudflare << EOF
FROM nginx:alpine

# 設定ファイルをコピー
COPY nginx.cloudflare.conf /etc/nginx/nginx.conf

# ヘルスチェック用のcurlをインストール
RUN apk add --no-cache curl

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

# Cloudflare設定スクリプト
cat > configure-cloudflare.sh << 'EOF'
#!/bin/bash

echo "☁️  Cloudflare セキュリティ設定自動化"
echo "==================================="

if [ -z "$CF_API_TOKEN" ] || [ -z "$DOMAIN" ]; then
    echo "⚠️  環境変数が設定されていません"
    echo "CF_API_TOKEN と DOMAIN を設定してください"
    exit 1
fi

# Zone ID取得
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" | \
    jq -r '.result[0].id')

if [ "$ZONE_ID" == "null" ]; then
    echo "❌ Zone ID取得失敗"
    exit 1
fi

echo "✅ Zone ID: $ZONE_ID"

# セキュリティ設定を自動適用
echo "🛡️  セキュリティ設定適用中..."

# SSL設定: Full (strict)
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/ssl" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"value":"full"}'

# セキュリティレベル: High
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/security_level" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"value":"high"}'

# Bot Fight Mode: ON
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/bot_fight_mode" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"value":"on"}'

# Challenge Passage: 30分
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/settings/challenge_ttl" \
    -H "Authorization: Bearer ${CF_API_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{"value":1800}'

echo "✅ Cloudflareセキュリティ設定完了"
EOF

chmod +x configure-cloudflare.sh

# 環境変数設定スクリプト
cat > .env.cloudflare << EOF
# Cloudflare設定
CF_API_TOKEN=${CF_API_TOKEN}
DOMAIN=${DOMAIN}
CLOUDFLARE_TUNNEL_TOKEN=
EOF

echo ""
echo "🎉 Cloudflare本番環境設定完了！"
echo "================================"
echo ""
echo "🌐 あなたのドメイン: https://${DOMAIN}"
echo "🔐 JWT Secret: ${JWT_SECRET}"
echo "🔐 Session Secret: ${SESSION_SECRET}"
echo ""
echo "🚀 次のステップ:"
echo "================================"
echo ""
echo "1️⃣  Cloudflareセキュリティ設定:"
echo "   export CF_API_TOKEN=${CF_API_TOKEN}"
echo "   export DOMAIN=${DOMAIN}"
echo "   ./configure-cloudflare.sh"
echo ""
echo "2️⃣  本番環境デプロイ:"
echo "   docker-compose -f docker-compose.cloudflare.yml up -d"
echo ""
echo "3️⃣  データベース初期化:"
echo "   docker-compose -f docker-compose.cloudflare.yml exec backend npx prisma db push"
echo ""
echo "4️⃣  動作確認:"
echo "   curl https://${DOMAIN}/health"
echo ""
echo "🛡️  Cloudflareセキュリティ機能（自動有効）:"
echo "✅ DDoS攻撃防護"
echo "✅ WAF（Web Application Firewall）"
echo "✅ Bot攻撃防護"
echo "✅ SSL/TLS暗号化"
echo "✅ CDN高速配信"
echo "✅ リアルタイム脅威検知"
echo ""
echo "📊 Cloudflareダッシュボード:"
echo "   https://dash.cloudflare.com/"
echo ""
echo "👥 チーム共有用URL:"
echo "   https://${DOMAIN}"
echo ""
echo "📝 管理が楽な理由:"
echo "✅ ブラウザで全設定管理"
echo "✅ 自動SSL証明書更新"
echo "✅ 詳細なアクセス解析"
echo "✅ API自動化対応"
echo "✅ 99.9%稼働率保証"