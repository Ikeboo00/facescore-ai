module.exports = {
  apps: [
    {
      name: 'facescore-backend',
      script: 'dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      // ログ設定
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      
      // 監視設定
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // 再起動設定
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      
      // メモリ制限
      max_memory_restart: '1G',
      
      // 自動再起動設定
      autorestart: true,
      
      // クラスターモード設定
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      
      // 環境変数
      env_file: '.env.production'
    }
  ],
  
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo',
      path: '/home/ubuntu/facescore-ai',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};