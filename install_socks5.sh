#!/bin/bash
# ============================================
# INSTALAR SOCKS5 (microsocks) - Wandeath VIP
# Rodar no VPS: bash install_socks5.sh
# ============================================

set -e
echo "🔌 Instalando SOCKS5 (microsocks)..."

# 1. Instalar microsocks
apt update -y
apt install -y microsocks

# 2. Criar serviço systemd para persistência
cat > /etc/systemd/system/microsocks.service << 'EOF'
[Unit]
Description=MicroSocks SOCKS5 Proxy
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/microsocks -p 1080 -b 0.0.0.0
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 3. Habilitar e iniciar
systemctl daemon-reload
systemctl enable microsocks
systemctl start microsocks

# 4. Verificar
echo ""
echo "✅ SOCKS5 instalado e rodando na porta 1080!"
echo ""
systemctl status microsocks --no-pager
echo ""
echo "🔍 Testando porta 1080..."
ss -tlnp | grep 1080 || echo "⚠️  Porta 1080 ainda não aberta, aguarde..."
