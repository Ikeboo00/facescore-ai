#!/bin/bash

echo "🧪 ローカル環境でのテストを開始します..."

# ローカル設定をコピー
echo "📝 ローカル設定をコピー中..."
cp backend/.env.local backend/.env.production
cp frontend/.env.local frontend/.env.production

# IPアドレスを取得
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "🌐 ローカルIPアドレス: $LOCAL_IP"

# CORS設定にローカルIPを追加
sed -i "s/CORS_ORIGIN=\".*\"/CORS_ORIGIN=\"http:\/\/localhost:80,http:\/\/localhost:3000,http:\/\/127.0.0.1:80,http:\/\/$LOCAL_IP:80\"/g" backend/.env.production

echo "✅ 設定完了！"
echo ""
echo "🚀 デプロイを実行します..."
./deploy.sh

echo ""
echo "🌐 アクセス可能なURL:"
echo "ローカル: http://localhost"
echo "同一ネット: http://$LOCAL_IP"
echo "API: http://localhost:3001"