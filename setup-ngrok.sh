#!/bin/bash

# ngrok セットアップスクリプト

echo "🚀 ngrok セットアップを開始します..."

# ngrokのインストール確認
if ! command -v ngrok &> /dev/null; then
    echo "📦 ngrokをインストールしています..."
    # Linux/WSL用
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install ngrok
fi

echo "🔧 ngrok設定ファイルを作成します..."

# ngrok設定ファイル作成
cat > ngrok.yml << 'EOF'
version: "2"
authtoken: YOUR_NGROK_AUTH_TOKEN
tunnels:
  frontend:
    addr: 80
    proto: http
    subdomain: facescore-app
  backend:
    addr: 3001
    proto: http
    subdomain: facescore-api
EOF

echo "✅ ngrok設定完了！"
echo ""
echo "📋 次の手順を実行してください："
echo "1. https://ngrok.com でアカウント作成"
echo "2. 認証トークンを取得"
echo "3. ngrok.yml の YOUR_NGROK_AUTH_TOKEN を実際のトークンに置換"
echo "4. ngrok start --all で両方のトンネルを開始"
echo ""
echo "🌐 公開URL例："
echo "フロントエンド: https://facescore-app.ngrok.io"
echo "バックエンド: https://facescore-api.ngrok.io"