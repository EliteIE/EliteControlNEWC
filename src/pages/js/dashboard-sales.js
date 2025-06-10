/**
 * @fileoverview Módulo de vendas do dashboard
 * @version 1.0.0
 */

export async function loadSalesSection(AppState, type, databaseService) {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="sales-container">
            <div class="section-header">
                <h2>${type === 'minhas-vendas' ? 'Minhas Vendas' : 'Todas as Vendas'}</h2>
            </div>
            <div class="sales-list mt-6" id="salesList">
                <p class="text-muted">Carregando vendas...</p>
            </div>
        </div>
    `;

    try {
        let query = databaseService.collection('sales');
        if (type === 'minhas-vendas' && AppState.currentUser) {
            query = query.where('userId', '==', AppState.currentUser.uid);
        }
        const snapshot = await query.get();
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        AppState.sales = sales;
        renderSales(sales);
    } catch (error) {
        document.getElementById('salesList').innerHTML = `<p class="text-danger">Erro ao carregar vendas.</p>`;
    }

    function renderSales(sales) {
        const list = document.getElementById('salesList');
        if (!sales.length) {
            list.innerHTML = '<p class="text-muted">Nenhuma venda encontrada.</p>';
            return;
        }
        list.innerHTML = sales.map(sale => `
            <div class="sale-card">
                <h4>Venda #${sale.id}</h4>
                <p>Cliente: ${sale.customerName || '-'} | Valor: R$ ${sale.total?.toFixed(2) || '0,00'}</p>
                <p>Data: ${sale.date ? new Date(sale.date.seconds * 1000).toLocaleDateString('pt-BR') : '-'}</p>
            </div>
        `).join('');
    }
} 