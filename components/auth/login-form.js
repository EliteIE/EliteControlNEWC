/**
 * @fileoverview Componente de formulário de login
 * @version 1.0.0
 */

import { authService } from '../../services/firebase/auth-service.js';
import { notificationComponent } from '../shared/notification.js';
import { isValidEmail, isValidPassword } from '../../utils/validators.js';

/**
 * Classe para gerenciar o formulário de login
 */
class LoginFormComponent {
    constructor() {
        this.formId = 'loginForm';
        this.emailInputId = 'email';
        this.passwordInputId = 'password';
        this.loginButtonId = 'loginButton';
        this.rememberMeId = 'rememberMe';
        this.forgotPasswordLinkId = 'forgotPasswordLink';
        this.registerButtonId = 'registerButton';
        
        // Modais
        this.forgotPasswordModalId = 'forgotPasswordModal';
        this.registerModalId = 'registerModal';
        this.closeForgotPasswordModalId = 'closeForgotPasswordModal';
        this.closeRegisterModalId = 'closeRegisterModal';
        this.recoveryEmailInputId = 'recoveryEmail';
        this.sendRecoveryButtonId = 'sendRecoveryButton';
        this.cancelRecoveryButtonId = 'cancelRecoveryButton';
        this.registerNameInputId = 'registerName';
        this.registerEmailInputId = 'registerEmail';
        this.registerPasswordInputId = 'registerPassword';
        this.registerPasswordConfirmInputId = 'registerPasswordConfirm';
        this.createAccountButtonId = 'createAccountButton';
        this.cancelRegisterButtonId = 'cancelRegisterButton';
    }
    
    /**
     * Inicializa o componente
     */
    init() {
        // Obter elementos do DOM
        this.form = document.getElementById(this.formId);
        this.emailInput = document.getElementById(this.emailInputId);
        this.passwordInput = document.getElementById(this.passwordInputId);
        this.loginButton = document.getElementById(this.loginButtonId);
        this.rememberMe = document.getElementById(this.rememberMeId);
        this.forgotPasswordLink = document.getElementById(this.forgotPasswordLinkId);
        this.registerButton = document.getElementById(this.registerButtonId);
        
        // Modais
        this.forgotPasswordModal = document.getElementById(this.forgotPasswordModalId);
        this.registerModal = document.getElementById(this.registerModalId);
        this.closeForgotPasswordModal = document.getElementById(this.closeForgotPasswordModalId);
        this.closeRegisterModal = document.getElementById(this.closeRegisterModalId);
        this.recoveryEmailInput = document.getElementById(this.recoveryEmailInputId);
        this.sendRecoveryButton = document.getElementById(this.sendRecoveryButtonId);
        this.cancelRecoveryButton = document.getElementById(this.cancelRecoveryButtonId);
        this.registerNameInput = document.getElementById(this.registerNameInputId);
        this.registerEmailInput = document.getElementById(this.registerEmailInputId);
        this.registerPasswordInput = document.getElementById(this.registerPasswordInputId);
        this.registerPasswordConfirmInput = document.getElementById(this.registerPasswordConfirmInputId);
        this.createAccountButton = document.getElementById(this.createAccountButtonId);
        this.cancelRegisterButton = document.getElementById(this.cancelRegisterButtonId);
        
        // Verificar se os elementos existem
        if (!this.form) {
            console.error('Formulário de login não encontrado');
            return;
        }
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Verificar se há email salvo
        this.loadSavedEmail();
    }
    
    /**
     * Configura os listeners de eventos
     * @private
     */
    setupEventListeners() {
        // Evento de submit do formulário
        this.form.addEventListener('submit', this.handleLogin.bind(this));
        
        // Evento de clique no link de esqueci a senha
        if (this.forgotPasswordLink) {
            this.forgotPasswordLink.addEventListener('click', this.handleForgotPasswordClick.bind(this));
        }
        
        // Evento de clique no botão de registro
        if (this.registerButton) {
            this.registerButton.addEventListener('click', this.handleRegisterClick.bind(this));
        }
        
        // Eventos dos modais
        if (this.closeForgotPasswordModal) {
            this.closeForgotPasswordModal.addEventListener('click', this.handleCloseForgotPasswordModal.bind(this));
        }
        
        if (this.closeRegisterModal) {
            this.closeRegisterModal.addEventListener('click', this.handleCloseRegisterModal.bind(this));
        }
        
        if (this.cancelRecoveryButton) {
            this.cancelRecoveryButton.addEventListener('click', this.handleCloseForgotPasswordModal.bind(this));
        }
        
        if (this.cancelRegisterButton) {
            this.cancelRegisterButton.addEventListener('click', this.handleCloseRegisterModal.bind(this));
        }
        
        if (this.sendRecoveryButton) {
            this.sendRecoveryButton.addEventListener('click', this.handleSendRecovery.bind(this));
        }
        
        if (this.createAccountButton) {
            this.createAccountButton.addEventListener('click', this.handleCreateAccount.bind(this));
        }
        
        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.forgotPasswordModal) {
                this.hideModal(this.forgotPasswordModal);
            }
            
            if (e.target === this.registerModal) {
                this.hideModal(this.registerModal);
            }
        });
    }
    
    /**
     * Manipula o evento de login
     * @param {Event} e - Evento de submit
     * @private
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;
        const rememberMe = this.rememberMe?.checked || false;
        
        if (!isValidEmail(email)) {
            notificationComponent.warning('Por favor, insira um email válido.');
            this.emailInput.focus();
            return;
        }
        
        if (!isValidPassword(password)) {
            notificationComponent.warning('A senha deve ter pelo menos 6 caracteres.');
            this.passwordInput.focus();
            return;
        }
        
        // Desabilitar botão durante o login
        this.loginButton.disabled = true;
        this.loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Entrando...';
        
        try {
            await authService.loginWithEmailAndPassword(email, password);
            
            // Salvar email se "lembrar-me" estiver marcado
            if (rememberMe) {
                localStorage.setItem('savedEmail', email);
            } else {
                localStorage.removeItem('savedEmail');
            }
            
            // Redirecionamento será feito pelo onAuthStateChanged no serviço de autenticação
        } catch (error) {
            // Erro tratado no serviço de autenticação
            this.loginButton.disabled = false;
            this.loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
        }
    }
    
    /**
     * Manipula o evento de clique no link de esqueci a senha
     * @param {Event} e - Evento de clique
     * @private
     */
    handleForgotPasswordClick(e) {
        e.preventDefault();
        
        if (this.recoveryEmailInput && this.emailInput) {
            this.recoveryEmailInput.value = this.emailInput.value;
        }
        
        this.showModal(this.forgotPasswordModal);
    }
    
    /**
     * Manipula o evento de clique no botão de registro
     * @private
     */
    handleRegisterClick() {
        this.showModal(this.registerModal);
    }
    
    /**
     * Manipula o evento de fechar o modal de esqueci a senha
     * @private
     */
    handleCloseForgotPasswordModal() {
        this.hideModal(this.forgotPasswordModal);
    }
    
    /**
     * Manipula o evento de fechar o modal de registro
     * @private
     */
    handleCloseRegisterModal() {
        this.hideModal(this.registerModal);
    }
    
    /**
     * Manipula o evento de enviar email de recuperação
     * @private
     */
    async handleSendRecovery() {
        const email = this.recoveryEmailInput.value.trim();
        
        if (!isValidEmail(email)) {
            notificationComponent.warning('Por favor, insira um email válido.');
            this.recoveryEmailInput.focus();
            return;
        }
        
        this.sendRecoveryButton.disabled = true;
        this.sendRecoveryButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
        
        try {
            await authService.sendPasswordResetEmail(email);
            this.hideModal(this.forgotPasswordModal);
        } catch (error) {
            // Erro tratado no serviço de autenticação
        } finally {
            this.sendRecoveryButton.disabled = false;
            this.sendRecoveryButton.innerHTML = 'Enviar';
        }
    }
    
    /**
     * Manipula o evento de criar conta
     * @private
     */
    async handleCreateAccount() {
        const name = this.registerNameInput.value.trim();
        const email = this.registerEmailInput.value.trim();
        const password = this.registerPasswordInput.value;
        const passwordConfirm = this.registerPasswordConfirmInput.value;
        
        if (!name) {
            notificationComponent.warning('Por favor, insira seu nome.');
            this.registerNameInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            notificationComponent.warning('Por favor, insira um email válido.');
            this.registerEmailInput.focus();
            return;
        }
        
        if (!isValidPassword(password)) {
            notificationComponent.warning('A senha deve ter pelo menos 6 caracteres.');
            this.registerPasswordInput.focus();
            return;
        }
        
        if (password !== passwordConfirm) {
            notificationComponent.warning('As senhas não coincidem.');
            this.registerPasswordConfirmInput.focus();
            return;
        }
        
        this.createAccountButton.disabled = true;
        this.createAccountButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Criando...';
        
        try {
            await authService.registerWithEmailAndPassword(email, password, name);
            this.hideModal(this.registerModal);
            // Redirecionamento será feito pelo onAuthStateChanged no serviço de autenticação
        } catch (error) {
            // Erro tratado no serviço de autenticação
            this.createAccountButton.disabled = false;
            this.createAccountButton.innerHTML = 'Criar Conta';
        }
    }
    
    /**
     * Mostra um modal
     * @param {HTMLElement} modal - Elemento do modal
     * @private
     */
    showModal(modal) {
        if (!modal) return;
        
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    /**
     * Esconde um modal
     * @param {HTMLElement} modal - Elemento do modal
     * @private
     */
    hideModal(modal) {
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    /**
     * Carrega o email salvo
     * @private
     */
    loadSavedEmail() {
        const savedEmail = localStorage.getItem('savedEmail');
        
        if (savedEmail && this.emailInput) {
            this.emailInput.value = savedEmail;
            
            if (this.rememberMe) {
                this.rememberMe.checked = true;
            }
        }
    }
}

// Exportar classe
export default LoginFormComponent;

