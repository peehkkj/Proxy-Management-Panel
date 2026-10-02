#!/bin/bash
# ============================================
# DEPLOY - Wandeath VIP
# Rodar no VPS: bash deploy.sh
# ============================================

set -e
echo "🚀 Deploy Wandeath VIP..."

# 1. Instalar dependências
echo "📦 Instalando Nginx + Certbot..."
apt update -y
apt install -y nginx certbot python3-certbot-nginx

# 2. Instalar flask-cors
echo "🔧 Instalando flask-cors..."
pip install flask-cors 2>/dev/null || pip3 install flask-cors 2>/dev/null

# 3. Deploy dos arquivos do dashboard
echo "📁 Copiando dashboard..."
mkdir -p /var/www/wandeath-dash
cp -f /root/dashboard/index.html /var/www/wandeath-dash/
cp -f /root/dashboard/style.css /var/www/wandeath-dash/
cp -f /root/dashboard/app.js /var/www/wandeath-dash/
echo "✅ Arquivos copiados para /var/www/wandeath-dash/"

# 4. Configurar Nginx — api.wandeath.com
echo "⚙️  Configurando Nginx..."
cat > /etc/nginx/sites-available/wandeath-api << 'NGINX'
server {
    listen 80;
    server_name api.wandeath.com;

    # Dashboard (arquivos estáticos)
    root /var/www/wandeath-dash;
    index index.html;

    # API Flask — tudo que começa com /api/ vai pro Flask
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Dashboard — serve os arquivos estáticos
    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX

# 5. Ativar site
ln -sf /etc/nginx/sites-available/wandeath-api /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null

# 6. Testar e reiniciar
nginx -t
systemctl restart nginx
echo "✅ Nginx configurado"

# 7. SSL
echo "🔐 Configurando SSL..."
certbot --nginx -d api.wandeath.com --non-interactive --agree-tos --email admin@wandeath.com || echo "⚠️  Rode manualmente: certbot --nginx -d api.wandeath.com"

echo ""
echo "============================================"
echo "✅ DEPLOY COMPLETO!"
echo ""
echo "Loja:       https://wandeath.com/ (já existente)"
echo "Dashboard:  https://api.wandeath.com/"
echo "API:        https://api.wandeath.com/api/"
echo "Proxy:      wandeath.com:3128:user:password"
echo "============================================"
