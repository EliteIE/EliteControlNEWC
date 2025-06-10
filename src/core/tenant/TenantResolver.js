/**
 * @fileoverview TenantResolver - Resolve o tenant atual por subdomínio ou path
 * @version 1.0.0
 */

export class TenantResolver {
  static getTenantIdentifier() {
    // 1. Tentar identificar por path
    const path = window.location.pathname.split('/');
    if (path.length > 1 && path[1] && path[1] !== 'index.html') {
      return path[1];
    }
    // 2. Tentar identificar por subdomínio (para produção com domínio próprio)
    const host = window.location.hostname;
    const parts = host.split('.');
    if (parts.length > 2) {
      return parts[0];
    }
    // 3. Default (multi-tenant não identificado)
    return null;
  }

  static async loadTenantConfig(tenantId) {
    // Exemplo: buscar config local ou via API
    // Aqui simula busca local, mas pode ser adaptado para fetch remoto
    try {
      const config = await import(`../../tenants/${tenantId}/tenant-config.json`);
      return config.default || config;
    } catch (e) {
      console.warn('Configuração do tenant não encontrada:', tenantId);
      return null;
    }
  }
} 