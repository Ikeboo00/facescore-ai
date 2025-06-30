#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function createEnvFile(filePath, config) {
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(filePath, envContent + '\n');
  console.log(`✅ 環境変数ファイルを作成しました: ${filePath}`);
}

// セキュリティキーを生成
const jwtSecret = generateSecureKey(32);
const sessionSecret = generateSecureKey(32);

console.log('🔐 セキュリティキーを自動生成中...');

// バックエンド用の開発環境設定
const backendDevConfig = {
  'NODE_ENV': 'development',
  'PORT': '3001',
  'DATABASE_URL': '"file:./dev.db"',
  'CORS_ORIGIN': '"http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"',
  'JWT_SECRET': `"${jwtSecret}"`,
  'SESSION_SECRET': `"${sessionSecret}"`,
  'MAX_FILE_SIZE': '10485760',
  'UPLOAD_DIR': '"./uploads"',
  'LOG_LEVEL': 'info',
  'LOG_DIR': '"./logs"',
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX_REQUESTS': '100'
};

// フロントエンド用の開発環境設定
const frontendDevConfig = {
  'VITE_API_URL': 'http://localhost:3001',
  'VITE_APP_TITLE': '"FaceScore AI - Development"',
  'VITE_MAX_FILE_SIZE': '10485760'
};

// 環境変数ファイルを作成
createEnvFile('./backend/.env.dev', backendDevConfig);
createEnvFile('./frontend/.env.dev', frontendDevConfig);

console.log('');
console.log('🎉 開発環境用の設定が完了しました！');
console.log('');
console.log('📝 次の手順でアプリケーションを起動できます:');
console.log('1. cd backend && cp .env.dev .env');
console.log('2. cd frontend && cp .env.dev .env');
console.log('3. npm install (各ディレクトリで実行)');
console.log('4. npm run dev (各ディレクトリで実行)');
console.log('');
console.log('⚠️  生成されたセキュリティキー:');
console.log(`JWT_SECRET: ${jwtSecret}`);
console.log(`SESSION_SECRET: ${sessionSecret}`);
console.log('');
console.log('🔒 これらのキーは安全に保管してください。');