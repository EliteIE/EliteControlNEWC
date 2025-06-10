/**
 * @fileoverview Serviço de banco de dados do Firebase
 * @version 1.0.0
 */

import { getServerTimestamp, timestampToDate } from './config.js';
import { showNotification } from '../../utils/helpers.js';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

/**
 * Classe para gerenciar operações de banco de dados
 */
export class DatabaseService {
    constructor(firestore, storage, auth, tenantId) {
        this.db = firestore;
        this.storage = storage;
        this.auth = auth;
        this.tenantId = tenantId;
    }

    /**
     * Inicializa/atualiza o serviço de banco de dados para o tenant
     * @param {Object} firestore - Instância do Firestore
     * @param {Object} storage - Instância do Storage
     * @param {Object} auth - Instância do Auth
     * @param {string} tenantId - Identificador do tenant
     */
    init(firestore, storage, auth, tenantId) {
        this.db = firestore;
        this.storage = storage;
        this.auth = auth;
        this.tenantId = tenantId;
        console.log(`✅ DatabaseService inicializado para tenant: ${tenantId}`);
    }

    /**
     * Cria uma nova instância do DatabaseService para um tenant
     * @param {Object} firestore
     * @param {Object} storage
     * @param {Object} auth
     * @param {string} tenantId
     * @returns {DatabaseService}
     */
    static createForTenant(firestore, storage, auth, tenantId) {
        return new DatabaseService(firestore, storage, auth, tenantId);
    }

    /**
     * Obtém uma referência para uma coleção
     * @param {string} collectionName - Nome da coleção
     * @returns {Object} Referência da coleção
     */
    collection(collectionName) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        // Busca multi-tenant-aware
        return collection(this.db, 'tenants', this.tenantId, collectionName);
    }

    /**
     * Obtém um documento pelo ID
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @returns {Promise<Object>} Documento
     */
    async getDocument(collectionName, docId) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        try {
            const docRef = doc(this.db, 'tenants', this.tenantId, collectionName, docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`❌ Erro ao obter documento ${docId} da coleção ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Obtém todos os documentos de uma coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} options - Opções de consulta
     * @param {Array} options.where - Condições de filtro
     * @param {string} options.orderBy - Campo para ordenação
     * @param {string} options.orderDirection - Direção da ordenação ('asc' ou 'desc')
     * @param {number} options.limit - Limite de documentos
     * @returns {Promise<Array>} Lista de documentos
     */
    async getDocuments(collectionName, options = {}) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        try {
            let q = collection(this.db, 'tenants', this.tenantId, collectionName);
            // Aplicar filtros
            if (options.where && Array.isArray(options.where)) {
                options.where.forEach(condition => {
                    if (condition.length === 3) {
                        q = query(q, where(condition[0], condition[1], condition[2]));
                    }
                });
            }
            // Aplicar ordenação
            if (options.orderBy) {
                const direction = options.orderDirection === 'desc' ? 'desc' : 'asc';
                q = query(q, orderBy(options.orderBy, direction));
            }
            // Aplicar limite
            if (options.limit && typeof options.limit === 'number') {
                q = query(q, limit(options.limit));
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`❌ Erro ao obter documentos da coleção ${collectionName}:`, error);
            throw error;
        }
    }

    /**
     * Adiciona um novo documento
     * @param {string} collectionName - Nome da coleção
     * @param {Object} data - Dados do documento
     * @returns {Promise<Object>} Documento criado
     */
    async addDocument(collectionName, data) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        try {
            const docRef = doc(collection(this.db, 'tenants', this.tenantId, collectionName));
            await setDoc(docRef, {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: this.auth?.currentUser?.uid || null
            });
            return {
                id: docRef.id,
                ...data
            };
        } catch (error) {
            console.error(`❌ Erro ao adicionar documento à coleção ${collectionName}:`, error);
            showNotification('Erro ao salvar dados. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Atualiza um documento existente
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @param {Object} data - Dados a serem atualizados
     * @returns {Promise<Object>} Documento atualizado
     */
    async updateDocument(collectionName, docId, data) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        try {
            const docRef = doc(this.db, 'tenants', this.tenantId, collectionName, docId);
            await updateDoc(docRef, {
                ...data,
                updatedAt: new Date(),
                updatedBy: this.auth?.currentUser?.uid || null
            });
            const updatedDoc = await getDoc(docRef);
            return {
                id: updatedDoc.id,
                ...updatedDoc.data()
            };
        } catch (error) {
            console.error(`❌ Erro ao atualizar documento ${docId} da coleção ${collectionName}:`, error);
            showNotification('Erro ao atualizar dados. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Exclui um documento
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @returns {Promise<void>}
     */
    async deleteDocument(collectionName, docId) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        try {
            const docRef = doc(this.db, 'tenants', this.tenantId, collectionName, docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`❌ Erro ao excluir documento ${docId} da coleção ${collectionName}:`, error);
            showNotification('Erro ao excluir dados. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Realiza uma transação para garantir consistência
     * @param {Function} transactionFn - Função de transação
     * @returns {Promise<*>} Resultado da transação
     */
    async runTransaction(transactionFn) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            return await this.db.runTransaction(transactionFn);
        } catch (error) {
            console.error('❌ Erro na transação:', error);
            showNotification('Erro na operação. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Realiza operações em lote
     * @param {Function} batchFn - Função de lote
     * @returns {Promise<void>}
     */
    async runBatch(batchFn) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        
        try {
            const batch = this.db.batch();
            await batchFn(batch);
            await batch.commit();
        } catch (error) {
            console.error('❌ Erro no lote:', error);
            showNotification('Erro na operação em lote. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Faz upload de um arquivo para o Storage
     * @param {File} file - Arquivo a ser enviado
     * @param {string} path - Caminho no Storage
     * @param {Object} metadata - Metadados do arquivo
     * @returns {Promise<string>} URL do arquivo
     */
    async uploadFile(file, path, metadata = {}) {
        if (!this.storage) {
            throw new Error('Serviço de storage não inicializado');
        }
        
        try {
            const storageRef = this.storage.ref();
            const fileRef = storageRef.child(path);
            
            // Adicionar metadados
            const fileMetadata = {
                ...metadata,
                customMetadata: {
                    ...metadata.customMetadata,
                    uploadedBy: this.auth?.currentUser?.uid || 'anonymous',
                    uploadedAt: new Date().toISOString()
                }
            };
            
            // Fazer upload
            const snapshot = await fileRef.put(file, fileMetadata);
            
            // Obter URL
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
        } catch (error) {
            console.error('❌ Erro ao fazer upload de arquivo:', error);
            showNotification('Erro ao enviar arquivo. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Exclui um arquivo do Storage
     * @param {string} path - Caminho no Storage
     * @returns {Promise<void>}
     */
    async deleteFile(path) {
        if (!this.storage) {
            throw new Error('Serviço de storage não inicializado');
        }
        
        try {
            const storageRef = this.storage.ref();
            const fileRef = storageRef.child(path);
            
            await fileRef.delete();
        } catch (error) {
            console.error('❌ Erro ao excluir arquivo:', error);
            showNotification('Erro ao excluir arquivo. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Configura um listener para mudanças em um documento
     * @param {string} collectionName - Nome da coleção
     * @param {string} docId - ID do documento
     * @param {Function} callback - Função de callback
     * @returns {Function} Função para cancelar o listener
     */
    onDocumentChange(collectionName, docId, callback) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        const docRef = doc(this.db, 'tenants', this.tenantId, collectionName, docId);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            } else {
                callback(null);
            }
        }, error => {
            console.error(`❌ Erro ao observar documento ${docId}:`, error);
        });
    }

    /**
     * Configura um listener para mudanças em uma coleção
     * @param {string} collectionName - Nome da coleção
     * @param {Object} options - Opções de consulta
     * @param {Function} callback - Função de callback
     * @returns {Function} Função para cancelar o listener
     */
    onCollectionChange(collectionName, options = {}, callback) {
        if (!this.db) {
            throw new Error('Serviço de banco de dados não inicializado');
        }
        let q = collection(this.db, 'tenants', this.tenantId, collectionName);
        // Aplicar filtros
        if (options.where && Array.isArray(options.where)) {
            options.where.forEach(condition => {
                if (condition.length === 3) {
                    q = query(q, where(condition[0], condition[1], condition[2]));
                }
            });
        }
        // Aplicar ordenação
        if (options.orderBy) {
            const direction = options.orderDirection === 'desc' ? 'desc' : 'asc';
            q = query(q, orderBy(options.orderBy, direction));
        }
        // Aplicar limite
        if (options.limit && typeof options.limit === 'number') {
            q = query(q, limit(options.limit));
        }
        return onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(docs);
        }, error => {
            console.error(`❌ Erro ao observar coleção ${collectionName}:`, error);
        });
    }
}

