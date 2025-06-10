/**
 * @fileoverview Script principal para a página de login
 * @version 1.0.0
 */

import { firebaseConfig } from './services/firebase/config.js';
import { authService } from './services/firebase/auth-service.js';
import { showNotification } from './utils/helpers.js';
import { isValidEmail, isValidPassword } from './utils/validators.js';

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar serviço de autenticação
    authService.init();
    
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    
    // Modais
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const registerModal = document.getElementById('registerModal');
    const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
    const closeRegisterModal = document.getElementById('closeRegisterModal');
    const recoveryEmailInput = document.getElementById('recoveryEmail');
    const sendRecoveryButton = document.getElementById('sendRecoveryButton');
    const cancelRecoveryButton = document.getElementById('cancelRecoveryButton');
    const registerNameInput = document.getElementById('registerName');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerPasswordConfirmInput = document.getElementById('registerPasswordConfirm');
    const createAccountButton = document.getElementById('createAccountButton');
    const cancelRegisterButton = document.getElementById('cancelRegisterButton');
    
    // Verificar se o usuário já está autenticado
    authService.onAuthStateChanged((user) => {
        if (user) {
            // Redirecionar para o dashboard
            window.location.href = './pages/dashboard.html';
        }
    });
    
    // Função para mostrar modal
    function showModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    // Função para esconder modal
    function hideModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Event Listeners
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!isValidEmail(email)) {
            showNotification('Por favor, insira um email válido.', 'warning');
            emailInput.focus();
            return;
        }
        
        if (!isValidPassword(password)) {
            showNotification('A senha deve ter pelo menos 6 caracteres.', 'warning');
            passwordInput.focus();
            return;
        }
        
        // Desabilitar botão durante o login
        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Entrando...';
        
        try {
            await authService.loginWithEmailAndPassword(email, password);
            // Redirecionamento será feito pelo onAuthStateChanged
        } catch (error) {
            // Erro tratado no serviço de autenticação
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i> Entrar';
        }
    });
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        recoveryEmailInput.value = emailInput.value;
        showModal(forgotPasswordModal);
    });
    
    registerButton.addEventListener('click', () => {
        showModal(registerModal);
    });
    
    closeForgotPasswordModal.addEventListener('click', () => {
        hideModal(forgotPasswordModal);
    });
    
    closeRegisterModal.addEventListener('click', () => {
        hideModal(registerModal);
    });
    
    cancelRecoveryButton.addEventListener('click', () => {
        hideModal(forgotPasswordModal);
    });
    
    cancelRegisterButton.addEventListener('click', () => {
        hideModal(registerModal);
    });
    
    sendRecoveryButton.addEventListener('click', async () => {
        const email = recoveryEmailInput.value.trim();
        
        if (!isValidEmail(email)) {
            showNotification('Por favor, insira um email válido.', 'warning');
            recoveryEmailInput.focus();
            return;
        }
        
        sendRecoveryButton.disabled = true;
        sendRecoveryButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Enviando...';
        
        try {
            await authService.sendPasswordResetEmail(email);
            hideModal(forgotPasswordModal);
        } catch (error) {
            // Erro tratado no serviço de autenticação
        } finally {
            sendRecoveryButton.disabled = false;
            sendRecoveryButton.innerHTML = 'Enviar';
        }
    });
    
    createAccountButton.addEventListener('click', async () => {
        const name = registerNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value;
        const passwordConfirm = registerPasswordConfirmInput.value;
        
        if (!name) {
            showNotification('Por favor, insira seu nome.', 'warning');
            registerNameInput.focus();
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Por favor, insira um email válido.', 'warning');
            registerEmailInput.focus();
            return;
        }
        
        if (!isValidPassword(password)) {
            showNotification('A senha deve ter pelo menos 6 caracteres.', 'warning');
            registerPasswordInput.focus();
            return;
        }
        
        if (password !== passwordConfirm) {
            showNotification('As senhas não coincidem.', 'warning');
            registerPasswordConfirmInput.focus();
            return;
        }
        
        createAccountButton.disabled = true;
        createAccountButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Criando...';
        
        try {
            await authService.registerWithEmailAndPassword(email, password, name);
            hideModal(registerModal);
            // Redirecionamento será feito pelo onAuthStateChanged
        } catch (error) {
            // Erro tratado no serviço de autenticação
            createAccountButton.disabled = false;
            createAccountButton.innerHTML = 'Criar Conta';
        }
    });
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            hideModal(forgotPasswordModal);
        }
        
        if (e.target === registerModal) {
            hideModal(registerModal);
        }
    });
    
    // Registrar service worker para PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('Service Worker registrado com sucesso:', registration.scope);
                })
                .catch(error => {
                    console.error('Erro ao registrar Service Worker:', error);
                });
        });
    }
}); 