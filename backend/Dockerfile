FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# アプリケーションファイルをコピー
COPY . .

# TypeScriptをビルド
RUN npm run build

# Prismaクライアントを生成
RUN npx prisma generate

# アップロードディレクトリを作成
RUN mkdir -p /app/uploads

# ログディレクトリを作成
RUN mkdir -p /app/logs

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# ファイルの所有権を変更
RUN chown -R nextjs:nodejs /app
USER nextjs

# ポートを公開
EXPOSE 3001

# アプリケーションを起動
CMD ["npm", "start"]