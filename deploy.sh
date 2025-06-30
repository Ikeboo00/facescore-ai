#!/bin/bash

# FaceScore AI 本番デプロイスクリプト

set -e

echo "🚀 FaceScore AI 本番環境デプロイを開始します..."

# 環境変数チェック
if [ ! -f "./backend/.env.production" ]; then
    echo "❌ エラー: backend/.env.production ファイルが見つかりません"
    exit 1
fi

if [ ! -f "./frontend/.env.production" ]; then
    echo "❌ エラー: frontend/.env.production ファイルが見つかりません"
    exit 1
fi

# 既存のコンテナを停止・削除
echo "🛑 既存のコンテナを停止中..."
docker-compose down --remove-orphans

# イメージをビルド
echo "🔨 Dockerイメージをビルド中..."
docker-compose build --no-cache

# データベースマイグレーション
echo "🗄️ データベースマイグレーションを実行中..."
docker-compose run --rm backend npm run db:migrate:prod

# コンテナを起動
echo "🚀 コンテナを起動中..."
docker-compose up -d

# ヘルスチェック
echo "🏥 ヘルスチェックを実行中..."
sleep 10

# バックエンドのヘルスチェック
if curl -f http://localhost:3001/health 2>/dev/null; then
    echo "✅ バックエンドが正常に起動しました"
else
    echo "❌ バックエンドの起動に失敗しました"
    docker-compose logs backend
    exit 1
fi

# フロントエンドのヘルスチェック
if curl -f http://localhost:80 2>/dev/null; then
    echo "✅ フロントエンドが正常に起動しました"
else
    echo "❌ フロントエンドの起動に失敗しました"
    docker-compose logs frontend
    exit 1
fi

echo "🎉 デプロイが完了しました！"
echo "📱 フロントエンド: http://localhost"
echo "🔧 バックエンドAPI: http://localhost:3001"
echo ""
echo "📊 コンテナ状況:"
docker-compose ps