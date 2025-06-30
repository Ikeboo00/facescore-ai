#!/bin/bash

# 自己署名SSL証明書自動生成スクリプト
# 開発・テスト環境用

echo "🔐 自己署名SSL証明書を生成中..."

# SSL証明書ディレクトリを作成
mkdir -p nginx/ssl

# 証明書設定ファイルを作成
cat > nginx/ssl/cert.conf <<EOF
[req]
default_bits = 2048
prompt = no
distinguished_name = req_distinguished_name
req_extensions = v3_req
x509_extensions = v3_ca

[req_distinguished_name]
C=JP
ST=Tokyo
L=Tokyo
O=FaceScore AI
OU=Development
CN=localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[v3_ca]
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always,issuer
basicConstraints = CA:true
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
DNS.3 = 127.0.0.1
DNS.4 = ::1
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# 秘密鍵を生成
openssl genrsa -out nginx/ssl/key.pem 2048

# 証明書署名要求を生成
openssl req -new -key nginx/ssl/key.pem -out nginx/ssl/cert.csr -config nginx/ssl/cert.conf

# 自己署名証明書を生成（有効期限365日）
openssl x509 -req -in nginx/ssl/cert.csr -signkey nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -extensions v3_ca -extfile nginx/ssl/cert.conf

# 不要なファイルを削除
rm nginx/ssl/cert.csr nginx/ssl/cert.conf

# ファイル権限を設定
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem

echo "✅ SSL証明書が生成されました:"
echo "   - 証明書: nginx/ssl/cert.pem"
echo "   - 秘密鍵: nginx/ssl/key.pem"
echo ""
echo "📝 証明書情報:"
openssl x509 -in nginx/ssl/cert.pem -text -noout | grep -E "(Subject:|DNS:|IP Address:|Not After)"

echo ""
echo "⚠️  注意: これは自己署名証明書です。"
echo "   ブラウザで警告が表示される場合がありますが、"
echo "   開発・テスト環境では問題ありません。"
echo ""
echo "🌐 HTTPS接続テスト:"
echo "   https://localhost (nginx経由)"