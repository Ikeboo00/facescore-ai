#!/bin/bash

# SSL証明書自動更新スクリプト

echo "🔄 SSL証明書更新開始..."

# 証明書更新を実行
docker-compose -f docker-compose.prod.yml run --rm certbot renew --quiet

if [ $? -eq 0 ]; then
    echo "✅ SSL証明書更新成功"
    
    # Nginxをリロードして新しい証明書を適用
    docker-compose -f docker-compose.prod.yml restart nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginxリスタート成功"
        
        # Slackやメール通知（オプション）
        # curl -X POST -H 'Content-type: application/json' \
        #   --data '{"text":"SSL証明書が更新されました"}' \
        #   YOUR_SLACK_WEBHOOK_URL
        
    else
        echo "❌ Nginxリスタート失敗"
        exit 1
    fi
else
    echo "❌ SSL証明書更新失敗"
    exit 1
fi

echo "🎉 SSL証明書更新完了"