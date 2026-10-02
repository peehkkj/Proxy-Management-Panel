<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wandeath VIP — Elite Proxies & Digital Solutions</title>
    <meta name="description" content="Wandeath VIP - Painel de controle de proxies residenciais.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <!-- LOGIN SCREEN -->
    <div class="login-overlay" id="login-overlay">
        <div class="login-card">
            <div class="login-brand">
                <div class="brand-icon">W</div>
                <div class="brand-text-wrap">
                    <span class="brand-text">Wandeath</span>
                    <span class="brand-sub">VIP PROXIES</span>
                </div>
            </div>
            <h2 class="login-title">Acesso Restrito</h2>
            <p class="login-subtitle">Faça login para acessar o painel</p>
            <form id="login-form" autocomplete="off">
                <div class="form-group">
                    <label for="login-email">E-mail</label>
                    <input type="email" id="login-email" placeholder="seu@email.com" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Senha</label>
                    <input type="password" id="login-password" placeholder="••••••••" required>
                </div>
                <div class="login-error hidden" id="login-error">
                    <i class="fas fa-exclamation-circle"></i> Credenciais inválidas
                </div>
                <button type="submit" class="btn btn-primary btn-block" id="btn-login">
                    <i class="fas fa-sign-in-alt"></i> Entrar
                </button>
            </form>
        </div>
    </div>

    <!-- APP (hidden until login) -->
    <div class="app-wrap hidden" id="app-wrap">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-brand">
                <div class="brand-icon">W</div>
                <div class="brand-text-wrap">
                    <span class="brand-text">Wandeath</span>
                    <span class="brand-sub">VIP PROXIES</span>
                </div>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active" data-section="dashboard" id="nav-dashboard">
                    <i class="fas fa-chart-pie"></i><span>Dashboard</span>
                </a>
                <a href="#" class="nav-item" data-section="clients" id="nav-clients">
                    <i class="fas fa-users"></i><span>Clientes</span>
                </a>
                <a href="#" class="nav-item" data-section="create" id="nav-create">
                    <i class="fas fa-user-plus"></i><span>Novo Cliente</span>
                </a>
            </nav>
            <div class="sidebar-footer">
                <div class="server-status" id="server-status">
                    <span class="status-dot"></span>
                    <span>API Online</span>
                </div>
                <div class="sidebar-version">v1.0 — wandeath.com</div>
                <button class="btn-logout" id="btn-logout">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Top Bar -->
            <header class="topbar">
                <button class="menu-toggle" id="menu-toggle"><i class="fas fa-bars"></i></button>
                <h1 class="page-title" id="page-title">Dashboard</h1>
                <div class="topbar-actions">
                    <span class="topbar-tag"><i class="fas fa-shield-halved"></i> Elite Proxy SaaS</span>
                    <button class="btn-refresh" id="btn-refresh-all" title="Atualizar dados">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </header>

            <!-- Dashboard Section -->
            <section class="section active" id="section-dashboard">
                <div class="welcome-banner">
                    <div class="welcome-text">
                        <h2>Bem-vindo ao <span class="gradient-text">Wandeath VIP</span></h2>
                        <p>Gerencie seus proxies residenciais com controle total de tráfego.</p>
                    </div>
                    <div class="welcome-badges">
                        <span class="wb"><i class="fas fa-bolt"></i> Squid Engine</span>
                        <span class="wb"><i class="fas fa-globe"></i> Rayobyte IPs</span>
                        <span class="wb"><i class="fas fa-lock"></i> HTTPS</span>
                    </div>
                </div>
                <div class="stats-grid">
                    <div class="stat-card" id="stat-total">
                        <div class="stat-icon blue"><i class="fas fa-users"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="val-total">0</span>
                            <span class="stat-label">Total Clientes</span>
                        </div>
                    </div>
                    <div class="stat-card" id="stat-active">
                        <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="val-active">0</span>
                            <span class="stat-label">Ativos</span>
                        </div>
                    </div>
                    <div class="stat-card" id="stat-blocked">
                        <div class="stat-icon red"><i class="fas fa-ban"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="val-blocked">0</span>
                            <span class="stat-label">Bloqueados</span>
                        </div>
                    </div>
                    <div class="stat-card" id="stat-gb">
                        <div class="stat-icon purple"><i class="fas fa-database"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="val-gb">0 GB</span>
                            <span class="stat-label">GB Consumidos</span>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-list"></i> Clientes Recentes</h2>
                    </div>
                    <div class="table-wrap">
                        <table class="data-table" id="dashboard-table">
                            <thead>
                                <tr><th>Usuário</th><th>Plano</th><th>Consumo</th><th>Status</th></tr>
                            </thead>
                            <tbody id="dashboard-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Clients Section -->
            <section class="section" id="section-clients">
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-users"></i> Todos os Clientes</h2>
                        <button class="btn btn-sm" id="btn-refresh-clients"><i class="fas fa-sync-alt"></i> Atualizar</button>
                    </div>
                    <div class="table-wrap">
                        <table class="data-table" id="clients-table">
                            <thead>
                                <tr><th>Usuário</th><th>Plano</th><th>Limite</th><th>Usado</th><th>Progresso</th><th>Status</th><th>Ações</th></tr>
                            </thead>
                            <tbody id="clients-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Create Client Section -->
            <section class="section" id="section-create">
                <div class="card form-card">
                    <div class="card-header">
                        <h2><i class="fas fa-user-plus"></i> Criar Novo Cliente</h2>
                    </div>
                    <form id="create-form" autocomplete="off">
                        <div class="form-group">
                            <label for="input-user">Usuário</label>
                            <input type="text" id="input-user" placeholder="ex: cliente1" required>
                        </div>
                        <div class="form-group">
                            <label for="input-pass">Senha</label>
                            <div class="input-icon-wrap">
                                <input type="text" id="input-pass" placeholder="Senha do proxy" required>
                                <button type="button" class="btn-gen-pass" id="btn-gen-pass" title="Gerar senha"><i class="fas fa-key"></i></button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="input-plan">Plano</label>
                            <select id="input-plan" required>
                                <option value="">Selecione o plano...</option>
                                <option value="1gb">⚡ 1 GB</option>
                                <option value="3gb">🔥 3 GB</option>
                                <option value="5gb">💎 5 GB</option>
                                <option value="10gb">🚀 10 GB</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block" id="btn-create">
                            <i class="fas fa-plus"></i> Criar Cliente
                        </button>
                    </form>
                    <div class="form-result hidden" id="create-result"></div>
                </div>
            </section>
        </main>
    </div>

    <!-- Modal -->
    <div class="modal-overlay hidden" id="modal-overlay">
        <div class="modal" id="modal">
            <div class="modal-header">
                <h3 id="modal-title">Detalhes</h3>
                <button class="modal-close" id="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    </div>

    <!-- Toast -->
    <div class="toast-container" id="toast-container"></div>

    <script src="app.js"></script>
</body>

</html>