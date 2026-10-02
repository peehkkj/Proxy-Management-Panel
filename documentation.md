# Wandeath VIP — Elite Proxies & Digital Solutions

## 🌐 URLs de Produção

| Serviço | URL |
|---------|-----|
| **Dashboard** | `https://wandeath.com/` |

| **API Backend** | `https://api.wandeath.com/` |
| **Proxy Squid** | `proxy.wandeath.com:3128` (acesso via user:pass) |

## 📁 Arquivos do Frontend

| Arquivo | Função |
|---------|--------|
| `index.html` | Dashboard principal |
| `style.css` | Tema Wandeath VIP (dark purple) |
| `app.js` | Integração com API |

## 🔌 Endpoints da API

**Base:** `https://api.wandeath.com`

| Endpoint | Método | Body |
|----------|--------|------|
| `/api/clients` | GET | — |
| `/api/client/{user}` | GET | — |
| `/api/client/create` | POST | `{ user, password, plan }` |
| `/api/client/reset` | POST | `{ user }` |
| `/api/client/block` | POST | `{ user }` |

## 🔧 Configuração do VPS (Nginx + SSL)

### 1. Instalar Nginx
```bash
apt install nginx -y
```

### 2. Configurar Proxy Reverso
```bash
nano /etc/nginx/sites-available/wandeath
```

```nginx
# API (Flask)
server {
    listen 80;
    server_name api.wandeath.com;

    location / {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Dashboard (frontend estático)
server {
    listen 80;
    server_name wandeath.com www.wandeath.com;

    root /var/www/wandeath;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3. Ativar e SSL
```bash
ln -s /etc/nginx/sites-available/wandeath /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# SSL
apt install certbot python3-certbot-nginx -y
certbot --nginx -d wandeath.com -d www.wandeath.com -d api.wandeath.com
```

### 4. Deploy do frontend
```bash
mkdir -p /var/www/wandeath
# Copiar index.html, style.css, app.js para /var/www/wandeath/
```

### 5. Flask CORS (obrigatório)
```bash
pip install flask-cors
```
No `panel.py`:
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
```

## 🏗️ Arquitetura Final

```
wandeath.com (Dashboard)
   ↓ HTTPS
api.wandeath.com (Flask API)
   ↓
Squid + Monitor + SQLite
   ↓
DataImpulse (gateway)
   ↓
Rayobyte (IP residencial final)
```
