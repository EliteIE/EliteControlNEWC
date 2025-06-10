/**
 * @fileoverview Script principal do dashboard
 * @version 2.0.0
 */

import { AuthService } from '../../../services/firebase/auth-service.js';
import { DatabaseService } from '../../../services/firebase/database-service.js';

// Estado global da aplicação
const AppState = {
    currentUser: null,
    currentSection: null,
    products: [],
    sales: [],
    customers: [],
    isLoading: false
};

// Configuração de seções por role
const ROLE_SECTIONS = {
    'Dono/Gerente': [
        { id: 'geral', icon: 'fa-chart-pie', text: 'Painel Geral' },
        { id: 'produtos', icon: 'fa-boxes-stacked', text: 'Produtos' },
        { id: 'vendas', icon: 'fa-file-invoice-dollar', text: 'Vendas' },
        { id: 'clientes', icon: 'fa-users', text: 'Clientes' },
        { id: 'relatorios', icon: 'fa-chart-bar', text: 'Relatórios' }
    ],
    'Controlador de Estoque': [
        { id: 'estoque', icon: 'fa-warehouse', text: 'Painel Estoque' },
        { id: 'produtos', icon: 'fa-boxes-stacked', text: 'Produtos' },
        { id: 'movimentacoes', icon: 'fa-exchange-alt', text: 'Movimentações' }
    ],
    'Vendedor': [
        { id: 'vendas-painel', icon: 'fa-dollar-sign', text: 'Painel Vendas' },
        { id: 'nova-venda', icon: 'fa-cash-register', text: 'Nova Venda' },
        { id: 'minhas-vendas', icon: 'fa-history', text: 'Minhas Vendas' },
        { id: 'produtos-consulta', icon: 'fa-search', text: 'Consultar Produtos' }
    ]
};

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando CloudControl Dashboard v2.0...');
    let dashboardLoaded = false;
    setTimeout(() => {
        if (!dashboardLoaded) {
            const contentArea = document.getElementById('dynamicContentArea');
            if (contentArea) {
                contentArea.innerHTML = `<div style="color:#ef4444;text-align:center;padding:2rem"><h2>Não foi possível carregar o dashboard.</h2><p>Verifique sua conexão ou tente recarregar a página.</p></div>`;
            }
        }
    }, 5000);
    try {
        const tenantConfig = window.tenantConfig?.firebaseConfig;
        const tenantId = window.tenantConfig?.companyName || 'default';
        const authService = AuthService.createForTenant(tenantConfig, tenantId);
        const databaseService = DatabaseService.createForTenant(
            authService.db, authService.storage, authService.auth, tenantId
        );
        authService.onAuthStateChanged(user => handleAuthStateChange(user, databaseService));
        initializeUI();
        setupNavigation();
        setupEventListeners();
        window.databaseService = databaseService;
        dashboardLoaded = true;
        // Carregar painel inicial automaticamente
        loadSection('geral');
        console.log('✅ Dashboard inicializado com sucesso');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
        const contentArea = document.getElementById('dynamicContentArea');
        if (contentArea) {
            contentArea.innerHTML = `<div style="color:#ef4444;text-align:center;padding:2rem"><h2>Erro ao inicializar o dashboard.</h2><p>${error.message || 'Erro desconhecido.'}</p></div>`;
        }
    }
});

// Manipulador de mudança de estado de autenticação
async function handleAuthStateChange(user, databaseService) {
    if (user) {
        try {
            // Buscar dados do usuário
            const userDoc = await databaseService.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                AppState.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc.data()
                };
                // Atualizar UI com dados do usuário
                updateUserInterface(AppState.currentUser);
                // Carregar seção inicial
                const hash = window.location.hash.substring(1);
                const defaultSection = ROLE_SECTIONS[AppState.currentUser.role]?.[0]?.id || 'geral';
                loadSection(hash || defaultSection);
            } else {
                throw new Error('Dados do usuário não encontrados');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            showNotification('Erro ao carregar perfil', 'error');
            // Fazer logout pelo authService
            // await authService.logout(); // authService não está disponível aqui, mas pode ser passado se necessário
        }
    } else {
        // Usuário não autenticado - redirecionar para login
        window.location.href = '../index.html';
    }
}

// Atualizar interface com dados do usuário
function updateUserInterface(user) {
    // Atualizar nome e iniciais
    const initials = user.name ? 
        user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() :
        user.email.substring(0, 2).toUpperCase();
    document.getElementById('userInitials').textContent = initials;
    document.getElementById('usernameDisplay').textContent = user.name || user.email.split('@')[0];
    document.getElementById('userRoleDisplay').textContent = user.role || 'Usuário';
    // Atualizar sidebar
    updateSidebar(user.role);
}

// Atualizar sidebar com links baseados no role
function updateSidebar(role) {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    const sections = ROLE_SECTIONS[role] || [];
    navLinks.innerHTML = sections.map(section => `
        <a href="#${section.id}" class="nav-link" data-section="${section.id}">
            <i class="fas ${section.icon} nav-link-icon"></i>
            <span>${section.text}</span>
        </a>
    `).join('');
}

// Carregar seção
async function loadSection(sectionId) {
    const contentArea = document.getElementById('dynamicContentArea');
    if (!contentArea) return;
    console.log('[Dashboard] Iniciando loadSection:', sectionId);
    // Mostrar loading
    contentArea.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Carregando ${sectionId}...</p>
        </div>
    `;
    try {
        AppState.currentSection = sectionId;
        // Atualizar estado ativo no sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
        // Carregar conteúdo baseado na seção
        switch (sectionId) {
            case 'geral':
            case 'vendas-painel':
            case 'estoque': {
                console.log('[Dashboard] Importando dashboard-kpis.js para:', sectionId);
                try {
                    const { loadKPIs } = await import('./dashboard-kpis.js');
                    await loadDashboard(sectionId, (type) => loadKPIs(type, window.databaseService));
                } catch (err) {
                    console.error('[Dashboard] Erro ao importar ou executar dashboard-kpis.js:', err);
                    contentArea.innerHTML = `<div style='color:#ef4444;text-align:center;padding:2rem'><h2>Erro ao carregar KPIs.</h2><p>${err.message}</p></div>`;
                }
                break;
            }
            case 'produtos':
            case 'produtos-consulta': {
                const { loadProductsSection } = await import('./dashboard-products.js');
                await loadProductsSection(AppState, window.databaseService);
                break;
            }
            case 'vendas':
            case 'minhas-vendas': {
                const { loadSalesSection } = await import('./dashboard-sales.js');
                await loadSalesSection(AppState, sectionId, window.databaseService);
                break;
            }
            case 'nova-venda':
                await loadNewSale();
                break;
            case 'clientes': {
                const { loadCustomersSection } = await import('./dashboard-customers.js');
                await loadCustomersSection(AppState, window.databaseService);
                break;
            }
            case 'relatorios': {
                const { loadReportsSection } = await import('./dashboard-reports.js');
                await loadReportsSection(AppState);
                break;
            }
            case 'movimentacoes': {
                const { loadMovementsSection } = await import('./dashboard-movements.js');
                await loadMovementsSection(AppState);
                break;
            }
            default:
                contentArea.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-hard-hat fa-3x"></i>
                        <h3>Seção em Desenvolvimento</h3>
                        <p>Esta funcionalidade estará disponível em breve.</p>
                    </div>
                `;
        }
        console.log('[Dashboard] loadSection concluído:', sectionId);
    } catch (error) {
        console.error('[Dashboard] Erro ao carregar seção:', error);
        contentArea.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Erro ao Carregar</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="btn-primary mt-4">
                    <i class="fas fa-redo mr-2"></i> Recarregar
                </button>
            </div>
        `;
    }
}

// Atualizar função loadDashboard para aceitar loadKPIs como parâmetro
async function loadDashboard(type, loadKPIs) {
    const contentArea = document.getElementById('dynamicContentArea');
    // Estrutura básica do dashboard
    contentArea.innerHTML = `
        <div class="dashboard-container">
            <div class="dashboard-header">
                <h2>${getTitleForSection(type)}</h2>
                <p>Visão geral do sistema</p>
            </div>
            <div class="kpi-grid" id="kpiGrid">
                <!-- KPIs serão inseridos aqui -->
            </div>
            <div class="dashboard-content mt-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card">
                        <div class="card-header">
                            <h3>Atividade Recente</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-muted">Dados de atividade serão exibidos aqui</p>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-header">
                            <h3>Estatísticas</h3>
                        </div>
                        <div class="card-body">
                            <p class="text-muted">Gráficos e estatísticas serão exibidos aqui</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    // Carregar KPIs baseado no tipo
    await loadKPIs(type);
}

// Configurar navegação
function setupNavigation() {
    // Navegação por hash
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash && AppState.currentUser) {
            loadSection(hash);
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await firebase.auth().signOut();
                window.location.href = '../index.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
                showNotification('Erro ao sair', 'error');
            }
        });
    }
    // Mobile menu
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        });
    }
    // Dropdowns
    setupDropdowns();
}

// Configurar dropdowns
function setupDropdowns() {
    const dropdownTriggers = document.querySelectorAll('[data-dropdown]');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdownId = trigger.dataset.dropdown;
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                dropdown.classList.toggle('hidden');
            }
        });
    });
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.add('hidden');
        });
    });
}

// Função auxiliar para obter título da seção
function getTitleForSection(sectionId) {
    const sections = Object.values(ROLE_SECTIONS).flat();
    const section = sections.find(s => s.id === sectionId);
    return section ? section.text : 'Dashboard';
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const container = document.getElementById('temporaryAlertsContainer');
    if (!container) return;
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(notification);
    // Auto remover após 5 segundos
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Obter ícone para tipo de notificação
function getIconForType(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Funções stub para outras seções (a serem implementadas)
async function loadProducts(type) {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="products-container">
            <div class="section-header">
                <h2>Produtos</h2>
                <button class="btn-primary" onclick="openProductModal()">
                    <i class="fas fa-plus mr-2"></i> Novo Produto
                </button>
            </div>
            <div class="products-grid mt-6">
                <p class="text-muted">Lista de produtos será exibida aqui</p>
            </div>
        </div>
    `;
}

async function loadSales(type) {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="sales-container">
            <div class="section-header">
                <h2>${type === 'minhas-vendas' ? 'Minhas Vendas' : 'Todas as Vendas'}</h2>
            </div>
            <div class="sales-list mt-6">
                <p class="text-muted">Lista de vendas será exibida aqui</p>
            </div>
        </div>
    `;
}

async function loadNewSale() {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="new-sale-container">
            <div class="section-header">
                <h2>Nova Venda</h2>
            </div>
            <div class="sale-form mt-6">
                <p class="text-muted">Formulário de venda será exibido aqui</p>
            </div>
        </div>
    `;
}

async function loadCustomers() {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="customers-container">
            <div class="section-header">
                <h2>Clientes</h2>
                <button class="btn-primary" onclick="openCustomerModal()">
                    <i class="fas fa-plus mr-2"></i> Novo Cliente
                </button>
            </div>
            <div class="customers-list mt-6">
                <p class="text-muted">Lista de clientes será exibida aqui</p>
            </div>
        </div>
    `;
}

// Função placeholder para modal de produto
window.openProductModal = function() {
    showNotification('Modal de produto será implementado', 'info');
};

// Função placeholder para modal de cliente
window.openCustomerModal = function() {
    showNotification('Modal de cliente será implementado', 'info');
};

// Inicializar componentes UI
function initializeUI() {
    // Adicionar classes de loading
    document.body.classList.add('loading');
    // Remover loading screen após carregamento
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        document.body.classList.remove('loading');
    }, 1000);
}

// Exportar funções necessárias globalmente
window.AppState = AppState;
window.loadSection = loadSection;
window.showNotification = showNotification;

// Renderizar layout do dashboard no #app
function renderDashboardLayout() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = `
    <div id="loadingScreen" class="loading-screen">
        <div class="loading-content">
            <div class="loading-logo">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="loading-text">
                <h2>EliteControl</h2>
                <p>Carregando sistema...</p>
            </div>
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        </div>
    </div>
    <header class="header">
        <div class="header-content">
            <button id="mobileMenuToggle" class="mobile-menu-toggle md:hidden">
                <i class="fas fa-bars"></i>
            </button>
            <div class="header-logo">
                <div class="header-logo-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <span class="header-logo-text">EliteControl</span>
                <span class="header-version">v2.0</span>
            </div>
            <div class="header-actions">
                <div class="header-search hidden md:block">
                    <div class="search-container">
                        <input type="text" id="globalSearch" class="search-input" placeholder="Buscar...">
                        <i class="fas fa-search search-icon"></i>
                    </div>
                </div>
                <div class="quick-actions hidden md:flex">
                    <button id="quickSaleButton" class="quick-action-btn" title="Nova Venda">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button id="quickProductButton" class="quick-action-btn" title="Novo Produto">
                        <i class="fas fa-box"></i>
                    </button>
                </div>
                <div class="relative">
                    <button id="notificationBellButton" class="notification-button">
                        <i class="fas fa-bell"></i>
                        <span id="notificationCountBadge" class="notification-badge hidden">0</span>
                    </button>
                    <div id="notificationDropdown" class="notification-dropdown hidden">
                        <div class="notification-header">
                            <span class="notification-title">Notificações</span>
                            <button id="markAllAsReadButton" class="notification-action">Marcar todas como lidas</button>
                        </div>
                        <div id="notificationList" class="notification-list scrollbar-thin"></div>
                    </div>
                </div>
                <div class="user-menu">
                    <button id="userMenuButton" class="user-button">
                        <div id="userAvatar" class="user-avatar">
                            <span id="userInitials">U</span>
                        </div>
                        <div class="user-info hidden lg:block">
                            <div id="usernameDisplay" class="user-name">Usuário</div>
                            <div id="userRoleDisplay" class="user-role">Cargo</div>
                        </div>
                        <i class="fas fa-chevron-down user-chevron hidden lg:block"></i>
                    </button>
                    <div id="userDropdown" class="user-dropdown hidden">
                        <div class="user-dropdown-header">
                            <div class="user-dropdown-avatar">
                                <span id="userDropdownInitials">U</span>
                            </div>
                            <div id="userDropdownName" class="user-dropdown-name">Usuário</div>
                            <div id="userDropdownEmail" class="user-dropdown-email">usuario@exemplo.com</div>
                        </div>
                        <ul class="user-dropdown-menu">
                            <li class="user-dropdown-item" onclick="showUserProfile()">
                                <i class="fas fa-user user-dropdown-item-icon"></i>
                                <span>Meu Perfil</span>
                            </li>
                            <li class="user-dropdown-item" onclick="showSettings()">
                                <i class="fas fa-cog user-dropdown-item-icon"></i>
                                <span>Configurações</span>
                            </li>
                            <li class="user-dropdown-item" onclick="showHelp()">
                                <i class="fas fa-question-circle user-dropdown-item-icon"></i>
                                <span>Ajuda</span>
                            </li>
                            <div class="user-dropdown-divider"></div>
                            <li id="logoutButton" class="user-dropdown-item user-dropdown-item-logout">
                                <i class="fas fa-sign-out-alt user-dropdown-item-icon"></i>
                                <span>Sair</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </header>
    <aside id="sidebar" class="sidebar scrollbar-thin">
        <div id="sidebarOverlay" class="sidebar-overlay md:hidden"></div>
        <div class="sidebar-content">
            <div class="sidebar-header">
                <div id="sidebarProfileName" class="sidebar-title">Painel</div>
                <button id="sidebarCloseButton" class="sidebar-close md:hidden">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <nav id="navLinks" class="nav-section"></nav>
            <div class="sidebar-stats">
                <div class="stat-item">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-label">Online</div>
                        <div id="onlineTime" class="stat-value">--:--</div>
                    </div>
                </div>
            </div>
            <div class="sidebar-footer">
                <div class="sidebar-version">
                    <i class="fas fa-code-branch"></i>
                    EliteControl v2.0
                </div>
            </div>
        </div>
    </aside>
    <main id="mainContent" class="main-content">
        <div class="page-header">
            <div class="page-header-content">
                <div class="page-header-left">
                    <h1 id="pageTitle" class="page-title">Painel</h1>
                    <p id="pageSubtitle" class="page-subtitle">Sua visão personalizada do sistema.</p>
                </div>
                <div class="page-header-right">
                    <div class="page-header-time">
                        <i class="fas fa-calendar-alt"></i>
                        <span id="currentDate">--</span>
                    </div>
                </div>
            </div>
        </div>
        <div id="dynamicContentArea" class="dynamic-content">
            <div class="content-loading">
                <div class="loading-spinner-container">
                    <div class="loading-spinner-large">
                        <div class="spinner-large"></div>
                    </div>
                    <p>Carregando dashboard...</p>
                </div>
            </div>
        </div>
    </main>
    <div id="temporaryAlertsContainer" class="temporary-alerts-container"></div>
    <div id="productModal" class="modal-backdrop hidden">
        <div class="modal-content modal-lg">
            <!-- ...modal de produto... -->
        </div>
    </div>
    <div id="universalModal" class="modal-backdrop hidden">
        <div id="universalModalContent" class="modal-content"></div>
    </div>
    <div id="modalPlaceholder"></div>
    <div id="fabContainer" class="fab-container">
        <button id="mainFab" class="fab-main">
            <i class="fas fa-plus"></i>
        </button>
        <div id="fabMenu" class="fab-menu hidden">
            <button class="fab-item" data-action="new-sale" title="Nova Venda">
                <i class="fas fa-cash-register"></i>
            </button>
            <button class="fab-item" data-action="new-product" title="Novo Produto">
                <i class="fas fa-box"></i>
            </button>
            <button class="fab-item" data-action="new-customer" title="Novo Cliente">
                <i class="fas fa-user-plus"></i>
            </button>
        </div>
    </div>
    `;
}

// Chamar a função ao carregar o dashboard
renderDashboardLayout(); 