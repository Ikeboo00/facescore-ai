#!/bin/bash

echo "🚀 FaceScore AI 開発環境セットアップ開始"
echo "===================================="

# 1. セキュリティキーと環境変数を生成
echo "📝 ステップ1: 環境変数とセキュリティキーを生成中..."
node generate-secrets.js

# 2. 環境変数ファイルをコピー
echo ""
echo "📂 ステップ2: 環境変数ファイルを配置中..."
cp backend/.env.dev backend/.env
cp frontend/.env.dev frontend/.env
echo "✅ 環境変数ファイルを配置しました"

# 3. SSL証明書を生成
echo ""
echo "🔐 ステップ3: SSL証明書を生成中..."
chmod +x generate-ssl.sh
./generate-ssl.sh

# 4. データベースの初期化
echo ""
echo "💾 ステップ4: データベースを初期化中..."
cd backend
npm install --silent
npx prisma generate
npx prisma db push
cd ..

echo ""
echo "🎉 セットアップ完了！"
echo "==================="
echo ""
echo "🌟 使用可能なコマンド:"
echo ""
echo "📦 開発サーバー起動（手動）:"
echo "   cd backend && npm run dev"
echo "   cd frontend && npm run dev"
echo ""
echo "🐳 Docker使用（推奨）:"
echo "   docker-compose -f docker-compose.simple.yml up -d"
echo ""
echo "🌐 アクセスURL:"
echo "   HTTP:  http://localhost:3000"
echo "   HTTPS: https://localhost (nginx経由)"
echo "   API:   http://localhost:3001"
echo ""
echo "📊 動作確認:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "⚠️  初回起動時はブラウザでSSL警告が表示される場合があります"
echo "   （自己署名証明書のため）"