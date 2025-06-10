// Módulo de inicialização da Dashboard (Lazy Loaded)
export function initDashboard() {
    // Inicialização da interface
    document.addEventListener('DOMContentLoaded', function() {
        // Esconder loading screen após carregar
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hidden');
        }, 1500);

        // Atualizar data atual
        updateCurrentDate();
        setInterval(updateCurrentDate, 60000);

        // Inicializar tempo online
        initializeOnlineTime();

        // Configurar mobile menu
        setupMobileMenu();

        // Configurar FAB
        setupFloatingActionButton();

        // Configurar busca global
        setupGlobalSearch();

        // Configurar ações rápidas
        setupQuickActions();
    });

    function updateCurrentDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const element = document.getElementById('currentDate');
        if (element) {
            element.textContent = dateString;
        }
    }

    function initializeOnlineTime() {
        const startTime = Date.now();
        function updateOnlineTime() {
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            const element = document.getElementById('onlineTime');
            if (element) {
                element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        setInterval(updateOnlineTime, 1000);
    }

    function setupMobileMenu() {
        const toggle = document.getElementById('mobileMenuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const closeBtn = document.getElementById('sidebarCloseButton');
        const openSidebar = () => {
            sidebar.classList.add('mobile-open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        };
        const closeSidebar = () => {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        };
        if (toggle) toggle.addEventListener('click', openSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    }

    function setupFloatingActionButton() {
        const mainFab = document.getElementById('mainFab');
        const fabMenu = document.getElementById('fabMenu');
        if (mainFab && fabMenu) {
            mainFab.addEventListener('click', () => {
                fabMenu.classList.toggle('hidden');
            });
            // Fechar menu ao clicar fora
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.fab-container')) {
                    fabMenu.classList.add('hidden');
                }
            });
            // Ações dos itens do FAB
            document.querySelectorAll('.fab-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = e.target.closest('.fab-item').dataset.action;
                    handleFabAction(action);
                    fabMenu.classList.add('hidden');
                });
            });
        }
    }

    function handleFabAction(action) {
        switch (action) {
            case 'new-sale':
                window.location.hash = '#registrar-venda';
                break;
            case 'new-product':
                if (typeof openProductModal === 'function') {
                    openProductModal();
                }
                break;
            case 'new-customer':
                if (typeof showCustomerModal === 'function') {
                    showCustomerModal();
                }
                break;
        }
    }

    function setupGlobalSearch() {
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleGlobalSearch, 300));
        }
    }

    function handleGlobalSearch(e) {
        const query = e.target.value.trim();
        if (query.length < 2) return;
        // Implementar busca global aqui
        console.log('Busca global:', query);
    }

    function setupQuickActions() {
        const quickSaleBtn = document.getElementById('quickSaleButton');
        const quickProductBtn = document.getElementById('quickProductButton');
        if (quickSaleBtn) {
            quickSaleBtn.addEventListener('click', () => {
                window.location.hash = '#registrar-venda';
            });
        }
        if (quickProductBtn) {
            quickProductBtn.addEventListener('click', () => {
                if (typeof openProductModal === 'function') {
                    openProductModal();
                }
            });
        }
    }

    function showUserProfile() {
        // Implementar perfil do usuário
        console.log('Mostrar perfil do usuário');
    }

    function showSettings() {
        window.location.hash = '#config';
    }

    function showHelp() {
        // Implementar ajuda
        console.log('Mostrar ajuda');
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
} 