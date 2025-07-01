#!/bin/bash

echo "🌐 LocalTunnel でHTTPS対応APIエンドポイント作成"
echo "================================================"

# LocalTunnelのインストール
echo "📦 LocalTunnelをインストール中..."
npm install -g localtunnel

echo ""
echo "🚀 HTTPSトンネルを開始中..."
echo "バックエンドサーバー（ポート3001）をHTTPS化します"

# LocalTunnelでトンネルを開始
lt --port 3001 --print-requests &

echo ""
echo "⏳ トンネルの開始を待機中..."
sleep 5

echo ""
echo "✅ LocalTunnelが起動しました"
echo ""
echo "📝 生成されたHTTPS URLをNetlify設定に使用してください"
echo "形式: https://random-name.loca.lt"
echo ""
echo "🔧 次の手順:"
echo "1. 生成されたHTTPS URLをコピー"
echo "2. netlify.toml の VITE_API_URL を更新"
echo "3. GitHub にプッシュしてNetlifyに自動デプロイ"