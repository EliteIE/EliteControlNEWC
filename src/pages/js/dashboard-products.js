/**
 * @fileoverview Módulo de produtos do dashboard
 * @version 1.0.0
 */

export async function loadProductsSection(AppState, databaseService) {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="products-container">
            <div class="section-header">
                <h2>Produtos</h2>
                <button class="btn-primary" id="btnNewProduct">
                    <i class="fas fa-plus mr-2"></i> Novo Produto
                </button>
            </div>
            <div class="products-grid mt-6" id="productsGrid">
                <p class="text-muted">Carregando produtos...</p>
            </div>
        </div>
    `;

    try {
        const snapshot = await databaseService.collection('products').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        AppState.products = products;
        renderProducts(products);
    } catch (error) {
        document.getElementById('productsGrid').innerHTML = `<p class="text-danger">Erro ao carregar produtos.</p>`;
    }

    function renderProducts(products) {
        const grid = document.getElementById('productsGrid');
        if (!products.length) {
            grid.innerHTML = '<p class="text-muted">Nenhum produto cadastrado.</p>';
            return;
        }
        grid.innerHTML = products.map(prod => `
            <div class="product-card">
                <h4>${prod.name}</h4>
                <p>Categoria: ${prod.category || '-'}</p>
                <p>Preço: R$ ${prod.price?.toFixed(2) || '0,00'}</p>
                <p>Estoque: ${prod.stock ?? '-'}</p>
            </div>
        `).join('');
    }

    // Event listener para novo produto (placeholder)
    document.getElementById('btnNewProduct').onclick = () => {
        alert('Funcionalidade de novo produto em desenvolvimento!');
    };
} 