// ===== CONFIG =====
const API_BASE = ''; // same origin — Nginx proxies /api/ to Flask

// ===== LUCIDE ICONS =====
lucide.createIcons();

// ===== DOM REFS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const sidebar = $('#sidebar');
const menuToggle = $('#menu-toggle');
const navItems = $$('.nav-item');
const sections = $$('.section');
const pageTitle = $('#page-title');
const toastBox = $('#toast-container');
const modalOverlay = $('#modal-overlay');

// ===== NAVIGATION =====
const titles = { dashboard: 'Dashboard', clients: 'Proxies', create: 'Nova Proxy', admins: 'Admins' };

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const sec = item.dataset.section;
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    sections.forEach(s => s.classList.remove('active'));
    $(`#section-${sec}`).classList.add('active');
    pageTitle.textContent = titles[sec] || 'Dashboard';
    if (sec === 'clients') loadClients();
    if (sec === 'dashboard') loadDashboard();
    if (sec === 'admins') loadAdmins();
    sidebar.classList.remove('open');
  });
});

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

// ===== TOAST =====
function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  el.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
  toastBox.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ===== API HELPERS =====
async function api(endpoint, opts = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });

    let data = null;
    const text = await res.text();
    try {
      if (text) data = JSON.parse(text);
    } catch (e) {
      console.warn('Response not JSON:', text);
    }

    return { ok: res.ok, data, error: !res.ok && !data ? `Erro ${res.status}` : null };
  } catch (err) {
    return { ok: false, data: null, error: err.message };
  }
}

// ===== PARSE CLIENT DATA =====
// API returns array: [user, plan, limit_gb, used_gb, status]
function parseClient(arr) {
  return {
    user: arr[0],
    plan: arr[1],
    limit_gb: arr[2],
    used_gb: arr[3],
    status: arr[4],
  };
}

// ===== LOAD DASHBOARD =====
async function loadDashboard() {
  const { ok, data } = await api('/api/clients');
  if (!ok || !data) { toast('Erro ao carregar dados', 'error'); return; }

  const clients = data.map(parseClient);
  const total = clients.length;
  const active = clients.filter(c => c.status === 'active').length;
  const blocked = clients.filter(c => c.status === 'blocked').length;
  const gbUsed = clients.reduce((s, c) => s + (c.used_gb || 0), 0);

  animateValue($('#val-total'), total);
  animateValue($('#val-active'), active);
  animateValue($('#val-blocked'), blocked);
  $('#val-gb').textContent = gbUsed.toFixed(4) + ' GB';

  // All clients with usage, ordered by consumption
  const tbody = $('#dashboard-tbody');
  tbody.innerHTML = '';

  const usedClients = [...clients]
    .filter(c => c.used_gb > 0)
    .sort((a, b) => (b.used_gb || 0) - (a.used_gb || 0));

  if (usedClients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-dim)">Nenhuma proxy em uso</td></tr>';
  } else {
    usedClients.forEach(c => {
      const pct = c.limit_gb > 0 ? (c.used_gb / c.limit_gb * 100) : 0;
      tbody.innerHTML += `
        <tr>
          <td><strong>${esc(c.user)}</strong></td>
          <td>${esc(c.plan)}</td>
          <td>${c.used_gb.toFixed(4)} / ${c.limit_gb} GB</td>
          <td><span class="badge ${c.status}">${c.status === 'active' ? '● Ativo' : '● Bloqueado'}</span></td>
        </tr>`;
    });
  }

  updateServerStatus(true);
}

// ===== LOAD CLIENTS =====
async function loadClients() {
  const tbody = $('#clients-tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px"><div class="loading-spinner"></div></td></tr>';

  const { ok, data } = await api('/api/clients');
  if (!ok || !data) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--red)">Erro ao carregar</td></tr>'; return; }

  const clients = data.map(parseClient);
  tbody.innerHTML = '';

  if (clients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-dim)">Nenhum cliente cadastrado</td></tr>';
    return;
  }

  clients.forEach(c => {
    const pct = c.limit_gb > 0 ? Math.min((c.used_gb / c.limit_gb * 100), 100) : 0;
    const barClass = pct > 80 ? 'danger' : pct > 50 ? 'warn' : '';
    tbody.innerHTML += `
      <tr>
        <td><strong>${esc(c.user)}</strong></td>
        <td>${esc(c.plan)}</td>
        <td>${c.limit_gb} GB</td>
        <td>${c.used_gb.toFixed(4)} GB</td>
        <td>
          <div class="progress-bar"><div class="progress-fill ${barClass}" style="width:${pct}%"></div></div>
          <div class="progress-text">${pct.toFixed(1)}%</div>
        </td>
        <td><span class="badge ${c.status}">${c.status === 'active' ? '● Ativo' : '● Bloqueado'}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon" title="Detalhes" onclick="viewClient('${esc(c.user)}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
            <button class="btn-icon" title="Reset GB" onclick="resetClient('${esc(c.user)}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg></button>
            ${c.status === 'active'
        ? `<button class="btn-icon" title="Bloquear" onclick="blockClient('${esc(c.user)}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg></button>`
        : ''}
            <button class="btn-icon danger" title="Excluir" onclick="deleteClient('${esc(c.user)}')"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
          </div>
        </td>
      </tr>`;
  });
  reinitIcons();
}

// ===== VIEW CLIENT DETAIL =====
async function viewClient(user) {
  const { ok, data } = await api(`/api/client/${user}`);
  if (!ok || !data) { toast('Erro ao buscar cliente', 'error'); return; }

  const c = typeof data.user !== 'undefined' ? data : parseClient(data);
  const pct = c.limit_gb > 0 ? (c.used_gb / c.limit_gb * 100) : 0;

  $('#modal-title').textContent = `Cliente: ${c.user}`;
  $('#modal-body').innerHTML = `
    <div class="detail-row"><span class="detail-label">Usuário</span><span class="detail-value">${esc(c.user)}</span></div>
    <div class="detail-row"><span class="detail-label">Plano</span><span class="detail-value">${esc(c.plan)}</span></div>
    <div class="detail-row"><span class="detail-label">Limite</span><span class="detail-value">${c.limit_gb} GB</span></div>
    <div class="detail-row"><span class="detail-label">Usado</span><span class="detail-value">${(c.used_gb || 0).toFixed(6)} GB</span></div>
    <div class="detail-row"><span class="detail-label">Progresso</span><span class="detail-value">${pct.toFixed(2)}%</span></div>
    <div class="detail-row"><span class="detail-label">Status</span><span class="badge ${c.status}">${c.status === 'active' ? '● Ativo' : '● Bloqueado'}</span></div>
    <div class="detail-row"><span class="detail-label">Proxy (HTTP)</span><span class="detail-value" style="font-size:.78rem;word-break:break-all">proxy.wandeath.com:3128:${esc(c.user)}:***</span></div>
    <div class="detail-row"><span class="detail-label">Proxy (SOCKS5)</span><span class="detail-value" style="font-size:.78rem;word-break:break-all">proxy.wandeath.com:1080:${esc(c.user)}:***</span></div>
  `;
  showModal();
}

// ===== BLOCK CLIENT =====
function blockClient(user) {
  customConfirm('Bloquear Proxy', `Tem certeza que deseja bloquear <strong>${esc(user)}</strong>?`, async () => {
    const { ok, data, error } = await api('/api/client/block', { method: 'POST', body: JSON.stringify({ user }) });
    if (ok) { toast(`${user} bloqueado com sucesso`, 'success'); loadClients(); loadDashboard(); }
    else { toast(`Erro ao bloquear: ${data?.error || error || 'desconhecido'}`, 'error'); }
  });
}

// ===== RESET CLIENT GB =====
function resetClient(user) {
  customConfirm('Resetar GB', `Tem certeza que deseja resetar os GB de <strong>${esc(user)}</strong>? Isso zera o consumo.`, async () => {
    const { ok, data, error } = await api('/api/client/reset', { method: 'POST', body: JSON.stringify({ user }) });
    if (ok) { toast(`GB de ${user} resetado`, 'success'); loadClients(); loadDashboard(); }
    else { toast(`Erro ao resetar: ${data?.error || error || 'desconhecido'}`, 'error'); }
  });
}

// ===== CREATE CLIENT =====
$('#create-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = $('#input-user').value.trim();
  const password = $('#input-pass').value.trim();
  const plan = $('#input-plan').value;
  const proto = $('#input-proto').value;
  const protoName = proto === '1080' ? 'SOCKS5' : 'HTTP';
  const resultEl = $('#create-result');

  if (!user || !password || !plan || !proto) { toast('Preencha todos os campos', 'error'); return; }

  const btn = $('#btn-create');
  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner"></div> Criando...';

  const { ok, data, error } = await api('/api/client/create', {
    method: 'POST',
    body: JSON.stringify({ user, password, plan }),
  });

  btn.disabled = false;
  btn.innerHTML = '<i data-lucide="plus"></i> Criar Proxy';

  if (ok && data) {
    resultEl.classList.remove('hidden', 'error');
    resultEl.innerHTML = `
      <strong>✅ Proxy criada!</strong><br>
      <span style="color:var(--text-sec)">Proxy (${protoName}):</span> <strong>proxy.wandeath.com:${proto}:${esc(user)}:${esc(password)}</strong><br>
      <span style="color:var(--text-sec)">Limite:</span> ${data.limit_gb || plan} GB
    `;
    // Save password locally for the formatter
    const localPasswords = JSON.parse(localStorage.getItem('wandeath_proxy_passwords') || '{}');
    localPasswords[user] = password;
    localStorage.setItem('wandeath_proxy_passwords', JSON.stringify(localPasswords));

    $('#create-form').reset();
    toast('Proxy criada com sucesso!', 'success');
  } else {
    resultEl.classList.remove('hidden');
    resultEl.classList.add('error');
    resultEl.innerHTML = `<strong>❌ Erro:</strong> ${data?.error || error || 'Falha ao criar'}`;
    toast('Erro ao criar proxy', 'error');
  }
});

// ===== CREATE TABS =====
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab-btn').forEach(b => b.classList.remove('active'));
    $$('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    $(`#tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// ===== BULK CREATE =====
$('#btn-bulk-create')?.addEventListener('click', async () => {
  const qty = parseInt($('#bulk-qty').value) || 0;
  const plan = $('#bulk-plan').value;
  const port = $('#bulk-proto').value;
  const resultWrap = $('#bulk-result-wrap');
  const textarea = $('#bulk-textarea');
  const progress = $('#bulk-progress');
  const btn = $('#btn-bulk-create');

  if (qty < 1 || qty > 50) { toast('Quantidade inválida (1-50)', 'error'); return; }

  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner"></div> Gerando...';
  resultWrap.classList.remove('hidden');
  textarea.value = '';

  let createdCount = 0;
  let results = [];
  const localPasswords = JSON.parse(localStorage.getItem('wandeath_proxy_passwords') || '{}');

  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const genRand = (len) => {
    let s = '';
    for (let j = 0; j < len; j++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
  };

  for (let i = 0; i < qty; i++) {
    progress.textContent = `Criando ${i + 1} de ${qty}...`;

    // Generate random user and pass (NO PREFIX)
    const user = genRand(8).toLowerCase();
    const pass = genRand(12);

    const { ok, data } = await api('/api/client/create', {
      method: 'POST',
      body: JSON.stringify({ user, password: pass, plan }),
    });

    if (ok) {
      createdCount++;
      localPasswords[user] = pass;
      results.push(`proxy.wandeath.com:${port}:${user}:${pass}`);
      textarea.value = results.join('\n');
    }
  }

  localStorage.setItem('wandeath_proxy_passwords', JSON.stringify(localPasswords));
  btn.disabled = false;
  btn.innerHTML = '<i data-lucide="zap"></i> Gerar em Massa';
  progress.textContent = `Concluído! ${createdCount} proxies criadas.`;
  toast(`${createdCount} proxies criadas com sucesso!`, 'success');
  reinitIcons();
});

$('#btn-copy-bulk')?.addEventListener('click', () => {
  const textarea = $('#bulk-textarea');
  if (!textarea.value) return;
  textarea.select();
  document.execCommand('copy');
  toast('Lista copiada!', 'success');
});

// ===== GENERATE PASSWORD =====
$('#btn-gen-pass')?.addEventListener('click', () => {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#';
  let pass = '';
  for (let i = 0; i < 12; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  $('#input-pass').value = pass;
  toast('Senha gerada!', 'info');
});

// ===== REFRESH =====
$('#btn-refresh-all').addEventListener('click', () => {
  const btn = $('#btn-refresh-all');
  btn.classList.add('spinning');
  setTimeout(() => btn.classList.remove('spinning'), 600);
  const activeSec = document.querySelector('.nav-item.active')?.dataset.section;
  if (activeSec === 'dashboard') loadDashboard();
  if (activeSec === 'clients') loadClients();
  toast('Dados atualizados', 'info');
});

$('#btn-refresh-clients')?.addEventListener('click', loadClients);

// ===== MODAL =====
function showModal() { modalOverlay.classList.remove('hidden'); }
function hideModal() { modalOverlay.classList.add('hidden'); }
$('#modal-close').addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) hideModal(); });

// ===== SERVER STATUS =====
function updateServerStatus(online) {
  const el = $('#server-status');
  const dot = el.querySelector('.status-dot');
  if (online) {
    dot.classList.remove('offline');
    el.querySelector('span:last-child').textContent = 'API Online';
  } else {
    dot.classList.add('offline');
    el.querySelector('span:last-child').textContent = 'API Offline';
  }
}

// ===== ANIMATE NUMBER =====
function animateValue(el, target) {
  const start = parseInt(el.textContent) || 0;
  const diff = target - start;
  const dur = 400;
  const t0 = performance.now();
  function frame(t) {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(start + diff * p);
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ===== ESCAPE HTML =====
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ===== AUTH =====
const AUTH_EMAIL = 'wandersoncalixto15@hotmail.com';
const AUTH_PASS = 'Wandeath1!WW';

function isLoggedIn() {
  return sessionStorage.getItem('wandeath_auth') === 'true';
}

function showApp() {
  $('#login-overlay').classList.add('hidden');
  $('#app-wrap').classList.remove('hidden');
  loadDashboard();
}

function showLogin() {
  $('#login-overlay').classList.remove('hidden');
  $('#app-wrap').classList.add('hidden');
}

$('#login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#login-email').value.trim();
  const pass = $('#login-password').value;

  // Check owner
  let authenticated = (email === AUTH_EMAIL && pass === AUTH_PASS);

  // Check stored admins
  if (!authenticated) {
    const admins = JSON.parse(localStorage.getItem('wandeath_admins') || '[]');
    authenticated = admins.some(a => a.email === email && a.password === pass);
  }

  if (authenticated) {
    sessionStorage.setItem('wandeath_auth', 'true');
    $('#login-error').classList.add('hidden');
    showApp();
    toast('Bem-vindo ao Wandeath VIP!', 'success');
  } else {
    $('#login-error').classList.remove('hidden');
  }
});

$('#btn-logout').addEventListener('click', () => {
  sessionStorage.removeItem('wandeath_auth');
  showLogin();
});

// ===== INIT =====
if (isLoggedIn()) {
  showApp();
} else {
  showLogin();
}

// Auto-refresh every 30s
setInterval(() => {
  if (!isLoggedIn()) return;
  const activeSec = document.querySelector('.nav-item.active')?.dataset.section;
  if (activeSec === 'dashboard') loadDashboard();
  if (activeSec === 'clients') loadClients();
}, 30000);

// ===== MOUSE GLOW =====
const mouseGlow = document.getElementById('mouse-glow');
if (mouseGlow) {
  document.addEventListener('mousemove', (e) => {
    mouseGlow.style.left = e.clientX + 'px';
    mouseGlow.style.top = e.clientY + 'px';
  });
}

// Re-init Lucide icons after DOM updates
function reinitIcons() { try { lucide.createIcons(); } catch (e) { } }


// ===== CUSTOM CONFIRM =====
function customConfirm(title, message, onConfirm) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = `
    <div style="margin-bottom: 20px; color: var(--text-sec);">${message}</div>
    <div style="display: flex; gap: 10px; justify-content: flex-end;">
      <button class="btn btn-primary" onclick="hideModal()" style="background: var(--bg-sec); color: var(--text-main); border: 1px solid var(--border);">Cancelar</button>
      <button class="btn btn-primary" id="btn-confirm-action" style="background: var(--red);">Confirmar</button>
    </div>
  `;
  showModal();
  $('#btn-confirm-action').onclick = () => {
    hideModal();
    onConfirm();
  };
}

// ===== DELETE CLIENT =====
function deleteClient(user) {
  customConfirm('Excluir Proxy', `Tem certeza que deseja excluir a proxy <strong>${esc(user)}</strong>? Esta ação é irreversível.`, async () => {
    const { ok, data, error } = await api('/api/client/delete', { method: 'POST', body: JSON.stringify({ user }) });
    if (ok) { toast(`Proxy ${user} excluída`, 'success'); loadClients(); loadDashboard(); }
    else { toast(`Erro ao excluir: ${data?.error || error || 'desconhecido'}`, 'error'); }
  });
}

// ===== ADMIN MANAGEMENT =====
function getAdmins() {
  const stored = localStorage.getItem('wandeath_admins');
  if (stored) return JSON.parse(stored);
  return [{ email: 'wandersoncalixto15@hotmail.com', role: 'owner' }];
}

function saveAdmins(admins) {
  localStorage.setItem('wandeath_admins', JSON.stringify(admins));
}

function loadAdmins() {
  const admins = getAdmins();
  const list = $('#admin-list');
  if (!list) return;
  list.innerHTML = admins.map((a, i) => `
    <div class="admin-item">
      <span class="admin-email">${esc(a.email)}</span>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="admin-tag">${a.role || 'admin'}</span>
        ${a.role !== 'owner' ? `<button class="btn-icon danger" onclick="removeAdmin(${i})" title="Remover"><i data-lucide="trash-2"></i></button>` : ''}
      </div>
    </div>
  `).join('');
  reinitIcons();
}

function removeAdmin(index) {
  const admins = getAdmins();
  if (admins[index]?.role === 'owner') { toast('Não pode remover o owner', 'error'); return; }
  if (!confirm(`Remover admin ${admins[index].email}?`)) return;
  admins.splice(index, 1);
  saveAdmins(admins);
  loadAdmins();
  toast('Admin removido', 'success');
}

$('#admin-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#admin-email').value.trim();
  const pass = $('#admin-pass').value;
  if (!email || !pass) { toast('Preencha todos os campos', 'error'); return; }

  const admins = getAdmins();
  if (admins.find(a => a.email === email)) {
    toast('Este email já é admin', 'error');
    return;
  }
  admins.push({ email, password: pass, role: 'admin' });
  saveAdmins(admins);

  const result = $('#admin-result');
  result.classList.remove('hidden', 'error');
  result.innerHTML = `<strong>✅ Admin registrado!</strong><br>${esc(email)}`;
  $('#admin-form').reset();
  loadAdmins();
  toast('Novo admin adicionado!', 'success');
});
