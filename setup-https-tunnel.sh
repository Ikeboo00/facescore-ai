#!/bin/bash

echo "🌐 HTTPS対応のためのトンネル設定"
echo "================================"

echo "選択肢:"
echo "A) ngrok（簡単・推奨）"
echo "B) Cloudflare Tunnel（高度）"
echo "C) ローカルSSL証明書"
echo ""

read -p "どれを選択しますか？ (A/B/C): " choice

case $choice in
    [Aa]* )
        echo "📦 ngrokをインストール中..."
        
        # ngrokインストール
        if ! command -v ngrok &> /dev/null; then
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | gpg --dearmor > /usr/share/keyrings/ngrok.gpg
            echo "deb [signed-by=/usr/share/keyrings/ngrok.gpg] https://ngrok-agent.s3.amazonaws.com buster main" > /etc/apt/sources.list.d/ngrok.list
            apt update && apt install ngrok
        fi
        
        echo "🔧 ngrok設定方法:"
        echo "1. https://ngrok.com/ でアカウント作成"
        echo "2. authtoken取得"
        echo "3. ngrok authtoken YOUR_TOKEN"
        echo "4. ngrok http 3001"
        echo ""
        echo "実行例:"
        echo "ngrok http 3001"
        ;;
    [Bb]* )
        echo "☁️ Cloudflare Tunnel設定:"
        echo "1. cloudflared をインストール"
        echo "2. cloudflare-tunnel.yml 設定ファイル作成"
        echo "3. トンネル起動"
        ;;
    [Cc]* )
        echo "🔒 ローカルSSL証明書設定:"
        echo "1. 自己署名証明書生成"
        echo "2. Express HTTPS設定"
        echo "3. サーバー再起動"
        ;;
    * )
        echo "無効な選択です"
        ;;
esac

echo ""
echo "⚡ 最も簡単な解決方法:"
echo "ngrok を使用してHTTPS対応のURLを取得することを推奨します"