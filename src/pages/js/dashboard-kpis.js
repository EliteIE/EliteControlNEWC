/**
 * @fileoverview Módulo de KPIs do dashboard
 * @version 1.0.0
 */

export async function loadKPIs(type, databaseService) {
    const kpiGrid = document.getElementById('kpiGrid');
    if (!kpiGrid) return;
    let kpis = [];
    try {
        if (type === 'geral') {
            // Buscar dados reais
            const [salesSnap, customersSnap, productsSnap] = await Promise.all([
                databaseService.collection('sales').get(),
                databaseService.collection('customers').get(),
                databaseService.collection('products').get()
            ]);
            const totalVendas = salesSnap.size;
            const receitaTotal = salesSnap.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            const totalClientes = customersSnap.size;
            const totalProdutos = productsSnap.size;
            kpis = [
                { icon: 'fa-dollar-sign', title: 'Receita Total', value: `R$ ${receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, color: 'green' },
                { icon: 'fa-shopping-cart', title: 'Total de Vendas', value: totalVendas, color: 'blue' },
                { icon: 'fa-users', title: 'Total de Clientes', value: totalClientes, color: 'purple' },
                { icon: 'fa-box', title: 'Produtos em Estoque', value: totalProdutos, color: 'orange' }
            ];
        } else if (type === 'vendas-painel') {
            // Exemplo: buscar vendas do dia
            const today = new Date();
            today.setHours(0,0,0,0);
            const salesSnap = await databaseService.collection('sales').where('date', '>=', today).get();
            const vendasHoje = salesSnap.size;
            const receitaHoje = salesSnap.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
            kpis = [
                { icon: 'fa-dollar-sign', title: 'Vendas Hoje', value: `R$ ${receitaHoje.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, color: 'green' },
                { icon: 'fa-percentage', title: 'Comissão', value: 'R$ 0,00', color: 'blue' },
                { icon: 'fa-trophy', title: 'Meta Mensal', value: 'N/A', color: 'yellow' },
                { icon: 'fa-chart-line', title: 'Tendência', value: 'N/A', color: 'purple' }
            ];
        } else if (type === 'estoque') {
            const productsSnap = await databaseService.collection('products').get();
            const totalProdutos = productsSnap.size;
            kpis = [
                { icon: 'fa-boxes', title: 'Total de Produtos', value: totalProdutos, color: 'blue' },
                { icon: 'fa-exclamation-triangle', title: 'Estoque Baixo', value: 'N/A', color: 'red' },
                { icon: 'fa-check-circle', title: 'Em Estoque', value: 'N/A', color: 'green' },
                { icon: 'fa-tags', title: 'Categorias', value: 'N/A', color: 'purple' }
            ];
        }
    } catch (error) {
        kpis = [{ icon: 'fa-exclamation-triangle', title: 'Erro ao carregar KPIs', value: '', color: 'red' }];
    }
    // Renderizar KPIs
    kpiGrid.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
            <div class="kpi-icon ${kpi.color}">
                <i class="fas ${kpi.icon}"></i>
            </div>
            <div class="kpi-content">
                <h4 class="kpi-title">${kpi.title}</h4>
                <p class="kpi-value">${kpi.value}</p>
            </div>
        </div>
    `).join('');
} 