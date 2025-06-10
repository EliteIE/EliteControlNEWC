/**
 * @fileoverview Serviço de CRM para o CloudControl
 * @version 1.0.0
 */

import { databaseService } from '../firebase/database-service.js';
import { showNotification } from '../../utils/helpers.js';
import { formatDocument, formatPhone } from '../../utils/formatters.js';
import { isValidCPF, isValidCNPJ, isValidPhone, isValidEmail } from '../../utils/validators.js';

/**
 * Classe para gerenciar operações de CRM
 */
class CRMService {
    constructor() {
        this.customersCollection = 'customers';
        this.interactionsCollection = 'customer_interactions';
        this.salesCollection = 'sales';
    }

    /**
     * Inicializa o serviço de CRM
     */
    init() {
        console.log('✅ Serviço de CRM inicializado');
    }

    /**
     * Adiciona um novo cliente
     * @param {Object} customerData - Dados do cliente
     * @returns {Promise<Object>} Cliente criado
     */
    async addCustomer(customerData) {
        try {
            // Validar dados obrigatórios
            if (!customerData.name) {
                throw new Error('Nome do cliente é obrigatório');
            }

            // Validar documento (CPF/CNPJ)
            if (customerData.document) {
                const doc = customerData.document.replace(/\D/g, '');
                
                if (doc.length === 11 && !isValidCPF(doc)) {
                    throw new Error('CPF inválido');
                } else if (doc.length === 14 && !isValidCNPJ(doc)) {
                    throw new Error('CNPJ inválido');
                }
                
                // Formatar documento
                customerData.document = formatDocument(customerData.document);
            }

            // Validar telefone
            if (customerData.phone && !isValidPhone(customerData.phone)) {
                throw new Error('Telefone inválido');
            } else if (customerData.phone) {
                // Formatar telefone
                customerData.phone = formatPhone(customerData.phone);
            }

            // Validar email
            if (customerData.email && !isValidEmail(customerData.email)) {
                throw new Error('Email inválido');
            }

            // Adicionar metadados
            const customer = {
                ...customerData,
                status: customerData.status || 'active',
                type: customerData.type || 'person',
                createdAt: new Date(),
                updatedAt: new Date(),
                totalPurchases: 0,
                totalSpent: 0,
                lastPurchase: null
            };

            // Salvar no banco de dados
            const result = await databaseService.addDocument(this.customersCollection, customer);
            
            showNotification('Cliente adicionado com sucesso!', 'success');
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao adicionar cliente:', error);
            showNotification(error.message || 'Erro ao adicionar cliente', 'error');
            throw error;
        }
    }

    /**
     * Atualiza um cliente existente
     * @param {string} customerId - ID do cliente
     * @param {Object} customerData - Dados do cliente
     * @returns {Promise<Object>} Cliente atualizado
     */
    async updateCustomer(customerId, customerData) {
        try {
            // Validar documento (CPF/CNPJ)
            if (customerData.document) {
                const doc = customerData.document.replace(/\D/g, '');
                
                if (doc.length === 11 && !isValidCPF(doc)) {
                    throw new Error('CPF inválido');
                } else if (doc.length === 14 && !isValidCNPJ(doc)) {
                    throw new Error('CNPJ inválido');
                }
                
                // Formatar documento
                customerData.document = formatDocument(customerData.document);
            }

            // Validar telefone
            if (customerData.phone && !isValidPhone(customerData.phone)) {
                throw new Error('Telefone inválido');
            } else if (customerData.phone) {
                // Formatar telefone
                customerData.phone = formatPhone(customerData.phone);
            }

            // Validar email
            if (customerData.email && !isValidEmail(customerData.email)) {
                throw new Error('Email inválido');
            }

            // Adicionar metadados
            const customer = {
                ...customerData,
                updatedAt: new Date()
            };

            // Atualizar no banco de dados
            const result = await databaseService.updateDocument(this.customersCollection, customerId, customer);
            
            showNotification('Cliente atualizado com sucesso!', 'success');
            
            return result;
        } catch (error) {
            console.error(`❌ Erro ao atualizar cliente ${customerId}:`, error);
            showNotification(error.message || 'Erro ao atualizar cliente', 'error');
            throw error;
        }
    }

    /**
     * Obtém um cliente pelo ID
     * @param {string} customerId - ID do cliente
     * @returns {Promise<Object>} Cliente
     */
    async getCustomer(customerId) {
        try {
            return await databaseService.getDocument(this.customersCollection, customerId);
        } catch (error) {
            console.error(`❌ Erro ao obter cliente ${customerId}:`, error);
            throw error;
        }
    }

    /**
     * Obtém todos os clientes
     * @param {Object} options - Opções de consulta
     * @returns {Promise<Array>} Lista de clientes
     */
    async getCustomers(options = {}) {
        try {
            return await databaseService.getDocuments(this.customersCollection, options);
        } catch (error) {
            console.error('❌ Erro ao obter clientes:', error);
            throw error;
        }
    }

    /**
     * Exclui um cliente
     * @param {string} customerId - ID do cliente
     * @returns {Promise<void>}
     */
    async deleteCustomer(customerId) {
        try {
            // Verificar se há vendas associadas
            const sales = await databaseService.getDocuments(this.salesCollection, {
                where: [['customerId', '==', customerId]],
                limit: 1
            });

            if (sales.length > 0) {
                throw new Error('Não é possível excluir um cliente com vendas associadas');
            }

            // Excluir interações
            const interactions = await databaseService.getDocuments(this.interactionsCollection, {
                where: [['customerId', '==', customerId]]
            });

            await databaseService.runBatch(async (batch) => {
                // Excluir interações
                interactions.forEach(interaction => {
                    const docRef = databaseService.collection(this.interactionsCollection).doc(interaction.id);
                    batch.delete(docRef);
                });

                // Excluir cliente
                const customerRef = databaseService.collection(this.customersCollection).doc(customerId);
                batch.delete(customerRef);
            });

            showNotification('Cliente excluído com sucesso!', 'success');
        } catch (error) {
            console.error(`❌ Erro ao excluir cliente ${customerId}:`, error);
            showNotification(error.message || 'Erro ao excluir cliente', 'error');
            throw error;
        }
    }

    /**
     * Registra uma interação com o cliente
     * @param {string} customerId - ID do cliente
     * @param {Object} interactionData - Dados da interação
     * @returns {Promise<Object>} Interação registrada
     */
    async addInteraction(customerId, interactionData) {
        try {
            // Validar dados obrigatórios
            if (!interactionData.type) {
                throw new Error('Tipo de interação é obrigatório');
            }

            if (!interactionData.description) {
                throw new Error('Descrição da interação é obrigatória');
            }

            // Adicionar metadados
            const interaction = {
                ...interactionData,
                customerId,
                date: interactionData.date || new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Salvar no banco de dados
            const result = await databaseService.addDocument(this.interactionsCollection, interaction);
            
            showNotification('Interação registrada com sucesso!', 'success');
            
            return result;
        } catch (error) {
            console.error('❌ Erro ao registrar interação:', error);
            showNotification(error.message || 'Erro ao registrar interação', 'error');
            throw error;
        }
    }

    /**
     * Obtém interações de um cliente
     * @param {string} customerId - ID do cliente
     * @param {Object} options - Opções de consulta
     * @returns {Promise<Array>} Lista de interações
     */
    async getInteractions(customerId, options = {}) {
        try {
            const queryOptions = {
                ...options,
                where: [['customerId', '==', customerId]],
                orderBy: options.orderBy || 'date',
                orderDirection: options.orderDirection || 'desc'
            };

            return await databaseService.getDocuments(this.interactionsCollection, queryOptions);
        } catch (error) {
            console.error(`❌ Erro ao obter interações do cliente ${customerId}:`, error);
            throw error;
        }
    }

    /**
     * Atualiza os dados de compra de um cliente
     * @param {string} customerId - ID do cliente
     * @param {number} amount - Valor da compra
     * @returns {Promise<Object>} Cliente atualizado
     */
    async updateCustomerPurchaseData(customerId, amount) {
        try {
            // Obter cliente atual
            const customer = await this.getCustomer(customerId);
            
            if (!customer) {
                throw new Error('Cliente não encontrado');
            }

            // Atualizar dados de compra
            const updatedCustomer = {
                totalPurchases: (customer.totalPurchases || 0) + 1,
                totalSpent: (customer.totalSpent || 0) + amount,
                lastPurchase: new Date(),
                updatedAt: new Date()
            };

            // Atualizar no banco de dados
            return await databaseService.updateDocument(this.customersCollection, customerId, updatedCustomer);
        } catch (error) {
            console.error(`❌ Erro ao atualizar dados de compra do cliente ${customerId}:`, error);
            throw error;
        }
    }

    /**
     * Busca clientes por termo
     * @param {string} term - Termo de busca
     * @param {number} limit - Limite de resultados
     * @returns {Promise<Array>} Lista de clientes
     */
    async searchCustomers(term, limit = 10) {
        try {
            // Normalizar termo de busca
            const searchTerm = term.toLowerCase().trim();
            
            // Obter todos os clientes (limitado a 100 para performance)
            const allCustomers = await databaseService.getDocuments(this.customersCollection, {
                limit: 100
            });
            
            // Filtrar clientes que correspondem ao termo de busca
            const filteredCustomers = allCustomers.filter(customer => {
                const name = (customer.name || '').toLowerCase();
                const document = (customer.document || '').replace(/\D/g, '');
                const email = (customer.email || '').toLowerCase();
                const phone = (customer.phone || '').replace(/\D/g, '');
                
                return name.includes(searchTerm) || 
                       document.includes(searchTerm) || 
                       email.includes(searchTerm) || 
                       phone.includes(searchTerm);
            });
            
            // Limitar resultados
            return filteredCustomers.slice(0, limit);
        } catch (error) {
            console.error('❌ Erro ao buscar clientes:', error);
            throw error;
        }
    }

    /**
     * Obtém estatísticas de clientes
     * @returns {Promise<Object>} Estatísticas
     */
    async getCustomerStats() {
        try {
            // Obter todos os clientes
            const customers = await databaseService.getDocuments(this.customersCollection);
            
            // Calcular estatísticas
            const stats = {
                total: customers.length,
                active: 0,
                inactive: 0,
                totalSpent: 0,
                averageSpent: 0,
                topCustomers: []
            };
            
            // Processar clientes
            customers.forEach(customer => {
                if (customer.status === 'active') {
                    stats.active++;
                } else {
                    stats.inactive++;
                }
                
                stats.totalSpent += customer.totalSpent || 0;
            });
            
            // Calcular média
            if (stats.total > 0) {
                stats.averageSpent = stats.totalSpent / stats.total;
            }
            
            // Obter top clientes
            stats.topCustomers = customers
                .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
                .slice(0, 5);
            
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas de clientes:', error);
            throw error;
        }
    }

    /**
     * Configura um listener para mudanças em um cliente
     * @param {string} customerId - ID do cliente
     * @param {Function} callback - Função de callback
     * @returns {Function} Função para cancelar o listener
     */
    onCustomerChange(customerId, callback) {
        return databaseService.onDocumentChange(this.customersCollection, customerId, callback);
    }

    /**
     * Configura um listener para mudanças na lista de clientes
     * @param {Object} options - Opções de consulta
     * @param {Function} callback - Função de callback
     * @returns {Function} Função para cancelar o listener
     */
    onCustomersChange(options, callback) {
        return databaseService.onCollectionChange(this.customersCollection, options, callback);
    }
}

// Exportar instância única (Singleton)
export const crmService = new CRMService();
export default crmService;

