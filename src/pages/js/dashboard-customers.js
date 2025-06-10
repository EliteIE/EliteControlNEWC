/**
 * @fileoverview Módulo de clientes do dashboard
 * @version 1.0.0
 */

export async function loadCustomersSection(AppState, databaseService) {
    const contentArea = document.getElementById('dynamicContentArea');
    contentArea.innerHTML = `
        <div class="customers-container">
            <div class="section-header">
                <h2>Clientes</h2>
                <button class="btn-primary" id="btnNewCustomer">
                    <i class="fas fa-plus mr-2"></i> Novo Cliente
                </button>
            </div>
            <div class="customers-list mt-6" id="customersList">
                <p class="text-muted">Carregando clientes...</p>
            </div>
        </div>
    `;

    try {
        const snapshot = await databaseService.collection('customers').get();
        const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        AppState.customers = customers;
        renderCustomers(customers);
    } catch (error) {
        document.getElementById('customersList').innerHTML = `<p class="text-danger">Erro ao carregar clientes.</p>`;
    }

    function renderCustomers(customers) {
        const list = document.getElementById('customersList');
        if (!customers.length) {
            list.innerHTML = '<p class="text-muted">Nenhum cliente cadastrado.</p>';
            return;
        }
        list.innerHTML = customers.map(cust => `
            <div class="customer-card">
                <h4>${cust.name}</h4>
                <p>Email: ${cust.email || '-'}</p>
                <p>Telefone: ${cust.phone || '-'}</p>
                <p>Documento: ${cust.document || '-'}</p>
            </div>
        `).join('');
    }

    // Event listener para novo cliente (placeholder)
    document.getElementById('btnNewCustomer').onclick = () => {
        alert('Funcionalidade de novo cliente em desenvolvimento!');
    };
} 