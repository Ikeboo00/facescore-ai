FROM node:18-alpine as builder

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# アプリケーションファイルをコピー
COPY . .

# 本番用環境変数ファイルをコピー
COPY .env.production .env.production

# アプリケーションをビルド
RUN npm run build

# Nginx ステージ
FROM nginx:alpine

# ビルドされたファイルをコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx設定ファイルをコピー（後で作成）
COPY nginx.conf /etc/nginx/nginx.conf

# ポートを公開
EXPOSE 80

# Nginxを起動
CMD ["nginx", "-g", "daemon off;"]