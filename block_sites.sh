#!/bin/bash
echo "🚫 Bloqueando domínios no servidor..."

DOMAINS=(
  "global.esport001.com"
  "global.esport002.com"
  "esport001.com"
  "esport002.com"
)

for domain in "${DOMAINS[@]}"; do
  if ! grep -q "$domain" /etc/hosts; then
    echo "0.0.0.0 $domain" >> /etc/hosts
    echo "Bloqueado: $domain"
  else
    echo "Já estava bloqueado: $domain"
  fi
done

# Reiniciar serviços para limpar cache de DNS
systemctl restart squid || true
systemctl restart microsocks || true

echo "✅ Domínios bloqueados com sucesso em todas as proxies!"
