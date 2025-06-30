#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🏭 本番環境用設定ファイル生成');
  console.log('===========================');
  console.log('');

  // ドメイン名入力
  const domain = await askQuestion('ドメイン名を入力してください (例: example.com): ');
  if (!domain) {
    console.log('❌ ドメイン名は必須です');
    process.exit(1);
  }

  // データベース設定入力
  console.log('\n📊 データベース設定:');
  const dbHost = await askQuestion('データベースホスト (デフォルト: postgres): ') || 'postgres';
  const dbName = await askQuestion('データベース名 (デフォルト: facescore_db): ') || 'facescore_db';
  const dbUser = await askQuestion('データベースユーザー (デフォルト: facescore_user): ') || 'facescore_user';
  const dbPassword = await askQuestion('データベースパスワード: ');
  
  if (!dbPassword) {
    console.log('❌ データベースパスワードは必須です');
    process.exit(1);
  }

  rl.close();

  console.log('\n🔐 セキュリティキーを生成中...');
  const jwtSecret = generateSecureKey(32);
  const sessionSecret = generateSecureKey(32);

  // バックエンド本番環境設定
  const backendProdConfig = {
    'NODE_ENV': 'production',
    'PORT': '3001',
    'DATABASE_URL': `"postgresql://${dbUser}:${dbPassword}@${dbHost}:5432/${dbName}?schema=public"`,
    'CORS_ORIGIN': `"https://${domain}"`,
    'JWT_SECRET': `"${jwtSecret}"`,
    'SESSION_SECRET': `"${sessionSecret}"`,
    'MAX_FILE_SIZE': '10485760',
    'UPLOAD_DIR': '"/app/uploads"',
    'LOG_LEVEL': 'warn',
    'LOG_DIR': '"/app/logs"',
    'RATE_LIMIT_WINDOW_MS': '900000',
    'RATE_LIMIT_MAX_REQUESTS': '50',
    // 本番環境用セキュリティ設定
    'TRUST_PROXY': 'true',
    'SECURE_COOKIES': 'true',
    'SESSION_COOKIE_SECURE': 'true',
    'SESSION_COOKIE_SAME_SITE': 'strict'
  };

  // フロントエンド本番環境設定
  const frontendProdConfig = {
    'VITE_API_URL': `https://${domain}`,
    'VITE_APP_TITLE': '"FaceScore AI"',
    'VITE_MAX_FILE_SIZE': '10485760',
    'VITE_DOMAIN': `"${domain}"`
  };

  // 環境変数ファイル作成
  function createEnvFile(filePath, config) {
    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(filePath, envContent + '\n');
    console.log(`✅ 本番環境設定ファイルを作成: ${filePath}`);
  }

  createEnvFile('./backend/.env.production', backendProdConfig);
  createEnvFile('./frontend/.env.production', frontendProdConfig);

  // Docker Compose本番環境設定を更新
  const dockerComposeContent = `version: '3.8'

services:
  # PostgreSQLデータベース
  postgres:
    image: postgres:15-alpine
    container_name: facescore-postgres-prod
    environment:
      POSTGRES_DB: ${dbName}
      POSTGRES_USER: ${dbUser}
      POSTGRES_PASSWORD: ${dbPassword}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${dbUser} -d ${dbName}"]
      interval: 30s
      timeout: 10s
      retries: 3

  # バックエンドAPI
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: facescore-backend-prod
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env.production
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # フロントエンド
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: facescore-frontend-prod
    env_file:
      - ./frontend/.env.production
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # Nginx + Certbot（Let's Encrypt）
  nginx:
    build:
      context: ./nginx
      dockerfile: Dockerfile.prod
    container_name: facescore-nginx-prod
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - certbot_certs:/etc/letsencrypt:ro
      - certbot_www:/var/www/certbot:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    environment:
      - DOMAIN=${domain}

  # Certbot（Let's Encrypt SSL証明書）
  certbot:
    image: certbot/certbot
    container_name: facescore-certbot
    volumes:
      - certbot_certs:/etc/letsencrypt
      - certbot_www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email admin@${domain} --agree-tos --no-eff-email -d ${domain}
    depends_on:
      - nginx

volumes:
  postgres_data:
  certbot_certs:
  certbot_www:

networks:
  default:
    driver: bridge`;

  fs.writeFileSync('./docker-compose.prod.yml', dockerComposeContent);
  console.log('✅ 本番用Docker Compose設定を作成: docker-compose.prod.yml');

  console.log('\n🎉 本番環境設定完了！');
  console.log('=====================');
  console.log(`🌐 ドメイン: ${domain}`);
  console.log(`💾 データベース: ${dbHost}:5432/${dbName}`);
  console.log('\n📋 生成されたファイル:');
  console.log('- backend/.env.production');
  console.log('- frontend/.env.production');
  console.log('- docker-compose.prod.yml');
  console.log('\n🚀 デプロイコマンド:');
  console.log('docker-compose -f docker-compose.prod.yml up -d');
}

main().catch(console.error);