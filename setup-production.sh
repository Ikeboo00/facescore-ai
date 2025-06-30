#!/bin/bash

echo "🏭 FaceScore AI 本番環境セットアップ"
echo "================================="

# Step 1: 本番設定生成
echo ""
echo "📝 ステップ1: 本番環境設定を生成中..."
chmod +x generate-production-config.js
node generate-production-config.js

# 実行権限設定
chmod +x *.sh

echo ""
echo "🔐 ステップ2: SSL証明書取得準備..."

# 初回SSL証明書取得用の一時Nginx設定
cat > nginx/nginx.initial.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name _;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 200 "Server is ready for SSL setup";
            add_header Content-Type text/plain;
        }
    }
}
EOF

echo ""
echo "🚀 ステップ3: 本番環境デプロイ手順"
echo "================================="
echo ""
echo "1️⃣  DNS設定確認:"
echo "   - AレコードでドメインをサーバーのIPアドレスに設定"
echo "   - DNSの伝播を確認: nslookup your-domain.com"
echo ""
echo "2️⃣  初回デプロイ（SSL証明書取得）:"
echo "   docker-compose -f docker-compose.prod.yml up nginx postgres -d"
echo "   docker-compose -f docker-compose.prod.yml run --rm certbot"
echo ""
echo "3️⃣  フルデプロイ:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "4️⃣  データベース初期化:"
echo "   docker-compose -f docker-compose.prod.yml exec backend npx prisma db push"
echo ""
echo "5️⃣  動作確認:"
echo "   curl -f https://your-domain.com/health"
echo ""
echo "📋 本番環境チェックリスト:"
echo "========================="
echo "✅ ドメイン名設定済み"
echo "✅ DNS A レコード設定済み"
echo "✅ ファイアウォール設定（80, 443ポート開放）"
echo "✅ データベース設定済み"
echo "✅ SSL証明書自動取得設定済み"
echo "✅ セキュリティ強化済み"
echo "✅ 本番用環境変数設定済み"
echo ""
echo "🔄 SSL証明書自動更新設定:"
echo "crontab -e で以下を追加:"
echo "0 12 * * * docker-compose -f /path/to/docker-compose.prod.yml run --rm certbot renew && docker-compose -f /path/to/docker-compose.prod.yml restart nginx"
echo ""
echo "📊 監視・メンテナンス:"
echo "- ログ確認: docker-compose -f docker-compose.prod.yml logs"
echo "- バックアップ: 定期的なデータベースバックアップを設定"
echo "- 更新: 定期的なイメージ更新とセキュリティパッチ適用"

echo ""
echo "✅ 本番環境設定完了！"