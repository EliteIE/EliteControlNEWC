/**
 * @fileoverview Serviço de autenticação do Firebase
 * @version 1.0.0
 */

import { firebaseConfig, getFirebaseApp, getFirestoreInstance, getAuthInstance, getStorageInstance } from './config.js';
import { showNotification } from '../../utils/helpers.js';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/**
 * Classe para gerenciar autenticação com Firebase
 */
export class AuthService {
    constructor(config, tenantId) {
        this.tenantId = tenantId;
        this.config = config;
        this.app = null;
        this.auth = null;
        this.db = null;
        this.storage = null;
        this.currentUser = null;
        this.authStateChangedCallbacks = [];
    }

    /**
     * Inicializa o serviço de autenticação para o tenant
     */
    init() {
        try {
            // Inicializar Firebase para o tenant
            this.app = getFirebaseApp(this.config, this.tenantId);
            this.auth = getAuthInstance(this.app);
            this.db = getFirestoreInstance(this.app);
            this.storage = getStorageInstance(this.app);
            this.auth.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
            console.log(`✅ AuthService inicializado para tenant: ${this.tenantId}`);
        } catch (error) {
            console.error('❌ Erro ao inicializar serviço de autenticação:', error);
            showNotification('Erro ao inicializar serviço de autenticação. Tente novamente mais tarde.', 'error');
        }
    }

    /**
     * Manipula mudanças no estado de autenticação
     * @param {Object} user - Usuário autenticado ou null
     * @private
     */
    async handleAuthStateChanged(user) {
        const hash = window.location.hash.replace('#', '');
        if (user) {
            try {
                // Obter dados adicionais do usuário do Firestore (padrão modular)
                const userDoc = await getDoc(doc(this.db, 'users', user.uid));
                if (userDoc.exists()) {
                    this.currentUser = {
                        ...user,
                        ...userDoc.data()
                    };
                } else {
                    this.currentUser = user;
                }
                // Redirecionar para dashboard se estiver na página de login
                if (hash === 'login' || hash === '') {
                    window.location.hash = '#dashboard';
                }
            } catch (error) {
                console.error('❌ Erro ao obter dados do usuário:', error);
                this.currentUser = user;
            }
        } else {
            this.currentUser = null;
            // Se não autenticado e não está na página de login, redirecionar para login
            if (hash !== 'login') {
                window.location.hash = '#login';
            }
        }
        // Notificar callbacks
        this.authStateChangedCallbacks.forEach(callback => {
            try {
                callback(this.currentUser);
            } catch (error) {
                console.error('❌ Erro em callback de authStateChanged:', error);
            }
        });
    }

    /**
     * Registra um callback para mudanças no estado de autenticação
     * @param {Function} callback - Função a ser chamada quando o estado de autenticação mudar
     * @returns {Function} Função para remover o callback
     */
    onAuthStateChanged(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback deve ser uma função');
        }
        
        this.authStateChangedCallbacks.push(callback);
        
        // Chamar imediatamente com o estado atual
        if (this.currentUser !== undefined) {
            try {
                callback(this.currentUser);
            } catch (error) {
                console.error('❌ Erro em callback de authStateChanged:', error);
            }
        }
        
        // Retornar função para remover o callback
        return () => {
            this.authStateChangedCallbacks = this.authStateChangedCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Realiza login com email e senha
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @returns {Promise<Object>} Usuário autenticado
     */
    async loginWithEmailAndPassword(email, password) {
        if (!this.auth) {
            throw new Error('Serviço de autenticação não inicializado');
        }
        
        try {
            const result = await signInWithEmailAndPassword(this.auth, email, password);
            showNotification('Login realizado com sucesso!', 'success');
            return result.user;
        } catch (error) {
            console.error('❌ Erro no login:', error);
            
            let errorMessage = 'Erro ao fazer login. Tente novamente.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Usuário desativado.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Senha incorreta.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas de login. Tente novamente mais tarde.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    /**
     * Realiza cadastro com email e senha
     * @param {string} email - Email do usuário
     * @param {string} password - Senha do usuário
     * @param {string} name - Nome do usuário
     * @returns {Promise<Object>} Usuário criado
     */
    async registerWithEmailAndPassword(email, password, name) {
        if (!this.auth || !this.db) {
            throw new Error('Serviço de autenticação não inicializado');
        }
        
        try {
            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = result.user;
            
            // Atualizar nome de exibição
            await user.updateProfile({
                displayName: name
            });
            
            // Criar perfil no Firestore
            await this.db.collection('users').doc(user.uid).set({
                uid: user.uid,
                email: email,
                name: name,
                role: 'user',
                createdAt: new Date()
            });
            
            showNotification('Conta criada com sucesso!', 'success');
            return user;
        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            
            let errorMessage = 'Erro ao criar conta. Tente novamente.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    /**
     * Envia email de redefinição de senha
     * @param {string} email - Email do usuário
     * @returns {Promise<void>}
     */
    async sendPasswordResetEmail(email) {
        if (!this.auth) {
            throw new Error('Serviço de autenticação não inicializado');
        }
        
        try {
            await this.auth.sendPasswordResetEmail(email);
            showNotification('Email de redefinição de senha enviado!', 'success');
        } catch (error) {
            console.error('❌ Erro ao enviar email de redefinição:', error);
            
            let errorMessage = 'Erro ao enviar email de redefinição. Tente novamente.';
            
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuário não encontrado.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    /**
     * Realiza logout
     * @returns {Promise<void>}
     */
    async logout() {
        if (!this.auth) {
            throw new Error('Serviço de autenticação não inicializado');
        }
        
        try {
            await this.auth.signOut();
            showNotification('Logout realizado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            showNotification('Erro ao fazer logout. Tente novamente.', 'error');
            throw error;
        }
    }

    /**
     * Atualiza o perfil do usuário
     * @param {Object} userData - Dados do usuário
     * @returns {Promise<Object>} Usuário atualizado
     */
    async updateUserProfile(userData) {
        if (!this.auth || !this.db || !this.currentUser) {
            throw new Error('Serviço de autenticação não inicializado ou usuário não autenticado');
        }
        
        try {
            const user = this.auth.currentUser;
            
            // Atualizar nome de exibição se fornecido
            if (userData.name) {
                await user.updateProfile({
                    displayName: userData.name
                });
            }
            
            // Atualizar email se fornecido
            if (userData.email && userData.email !== user.email) {
                await user.updateEmail(userData.email);
            }
            
            // Atualizar perfil no Firestore
            await this.db.collection('users').doc(user.uid).update({
                ...userData,
                updatedAt: new Date()
            });
            
            // Atualizar usuário atual
            this.currentUser = {
                ...this.currentUser,
                ...userData
            };
            
            showNotification('Perfil atualizado com sucesso!', 'success');
            return this.currentUser;
        } catch (error) {
            console.error('❌ Erro ao atualizar perfil:', error);
            
            let errorMessage = 'Erro ao atualizar perfil. Tente novamente.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'Esta operação é sensível e requer autenticação recente. Faça login novamente.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    /**
     * Atualiza a senha do usuário
     * @param {string} currentPassword - Senha atual
     * @param {string} newPassword - Nova senha
     * @returns {Promise<void>}
     */
    async updatePassword(currentPassword, newPassword) {
        if (!this.auth || !this.currentUser) {
            throw new Error('Serviço de autenticação não inicializado ou usuário não autenticado');
        }
        
        try {
            const user = this.auth.currentUser;
            
            // Reautenticar usuário
            const credential = firebase.auth.EmailAuthProvider.credential(
                user.email,
                currentPassword
            );
            
            await user.reauthenticateWithCredential(credential);
            
            // Atualizar senha
            await user.updatePassword(newPassword);
            
            showNotification('Senha atualizada com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao atualizar senha:', error);
            
            let errorMessage = 'Erro ao atualizar senha. Tente novamente.';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Senha atual incorreta.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Nova senha muito fraca. Use pelo menos 6 caracteres.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'Esta operação é sensível e requer autenticação recente. Faça login novamente.';
                    break;
            }
            
            showNotification(errorMessage, 'error');
            throw error;
        }
    }

    /**
     * Verifica se o usuário está autenticado
     * @returns {boolean} Verdadeiro se o usuário estiver autenticado
     */
    isAuthenticated() {
        return !!this.currentUser;
    }

    /**
     * Obtém o usuário atual
     * @returns {Object|null} Usuário atual ou null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verifica se o usuário tem uma determinada função
     * @param {string|Array} roles - Função ou array de funções
     * @returns {boolean} Verdadeiro se o usuário tiver a função
     */
    hasRole(roles) {
        if (!this.currentUser || !this.currentUser.role) {
            return false;
        }
        
        if (Array.isArray(roles)) {
            return roles.includes(this.currentUser.role);
        }
        
        return this.currentUser.role === roles;
    }

    /**
     * Cria uma nova instância do AuthService para um tenant
     * @param {Object} config - Configuração do Firebase
     * @param {string} tenantId - Identificador do tenant
     * @returns {AuthService}
     */
    static createForTenant(config, tenantId) {
        const instance = new AuthService(config, tenantId);
        instance.init();
        return instance;
    }
}

