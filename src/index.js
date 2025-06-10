import { TenantResolver } from './core/tenant/TenantResolver.js';

async function initializeApp() {
  const tenantId = TenantResolver.getTenantIdentifier();
  if (!tenantId) {
    document.getElementById('app').innerHTML = '<h2>Tenant não identificado. Acesse via subdomínio ou path correto.</h2>';
    return;
  }
  const tenantConfig = await TenantResolver.loadTenantConfig(tenantId);
  if (!tenantConfig) {
    document.getElementById('app').innerHTML = `<h2>Configuração do tenant <b>${tenantId}</b> não encontrada.</h2>`;
    return;
  }
  // Aplicar branding (exemplo)
  document.body.style.background = tenantConfig.branding?.primaryColor || '#fff';
  // Salvar config globalmente se necessário
  window.tenantConfig = tenantConfig;
  // Continuar com o roteamento SPA
  renderRoute();
  window.addEventListener('hashchange', renderRoute);
}

function renderRoute() {
  const hash = window.location.hash.replace('#', '');
  const app = document.getElementById('app');
  const tenant = TenantResolver.getTenantIdentifier();
  const basePath = tenant ? `/${tenant}` : '';
  if (hash === 'dashboard') {
    app.innerHTML = '';
    import('./pages/js/dashboard.js');
  } else if (hash === 'login') {
    import('./pages/js/login.js').then(module => module.renderLogin());
  } else if (hash === 'cadastro-empresa') {
    import('./pages/js/cadastro-empresa.js').then(module => module.renderCadastroEmpresa());
  } else {
    app.innerHTML = `<nav style="margin-bottom:1rem">
      <a href="${basePath}#dashboard">Dashboard</a> |
      <a href="${basePath}#login">Login</a>
    </nav>
    <h1>Bem-vindo ao CloudControl!</h1>
      <p>Tenant: <b>${window.tenantConfig?.companyName || 'N/A'}</b></p>
      <a href="#cadastro-empresa" style="display:inline-block;margin-top:2rem;font-weight:bold;color:#1976d2">Quero cadastrar minha empresa</a>`;
  }
}

initializeApp(); 