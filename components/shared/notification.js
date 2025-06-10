/**
 * @fileoverview Componente de notificação
 * @version 1.0.0
 */

/**
 * Classe para gerenciar notificações na interface
 */
class NotificationComponent {
    constructor() {
        this.containerId = 'notification-container';
        this.notificationClass = 'notification';
        this.animationDuration = 300; // ms
        this.defaultDuration = 3000; // ms
        
        this.init();
    }
    
    /**
     * Inicializa o componente
     * @private
     */
    init() {
        // Verificar se o container já existe
        let container = document.getElementById(this.containerId);
        
        if (!container) {
            // Criar container
            container = document.createElement('div');
            container.id = this.containerId;
            container.style.position = 'fixed';
            container.style.top = '20px';
            container.style.right = '20px';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }
        
        // Adicionar estilos de animação
        this.addStyles();
    }
    
    /**
     * Adiciona estilos CSS ao documento
     * @private
     */
    addStyles() {
        if (document.getElementById('notification-styles')) {
            return;
        }
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'notification-styles';
        styleSheet.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(20px); }
            }
            
            .${this.notificationClass} {
                background-color: #3B82F6;
                color: #FFFFFF;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 300px;
                max-width: 450px;
                animation: fadeIn 0.3s ease;
            }
            
            .${this.notificationClass}-success {
                background-color: #10B981;
            }
            
            .${this.notificationClass}-error {
                background-color: #EF4444;
            }
            
            .${this.notificationClass}-warning {
                background-color: #F59E0B;
            }
            
            .${this.notificationClass}-info {
                background-color: #3B82F6;
            }
            
            .${this.notificationClass}-content {
                display: flex;
                align-items: center;
            }
            
            .${this.notificationClass}-icon {
                margin-right: 8px;
            }
            
            .${this.notificationClass}-close {
                background: none;
                border: none;
                color: #FFFFFF;
                font-size: 20px;
                cursor: pointer;
                margin-left: 8px;
            }
        `;
        
        document.head.appendChild(styleSheet);
    }
    
    /**
     * Mostra uma notificação
     * @param {string} message - Mensagem da notificação
     * @param {string} type - Tipo da notificação ('success', 'error', 'warning', 'info')
     * @param {number} duration - Duração em milissegundos
     * @returns {HTMLElement} Elemento da notificação
     */
    show(message, type = 'info', duration = this.defaultDuration) {
        // Obter container
        const container = document.getElementById(this.containerId);
        
        if (!container) {
            console.error('Container de notificações não encontrado');
            return null;
        }
        
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `${this.notificationClass} ${this.notificationClass}-${type}`;
        
        // Definir ícone com base no tipo
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fas fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                break;
        }
        
        // Montar conteúdo
        notification.innerHTML = `
            <div class="${this.notificationClass}-content">
                <span class="${this.notificationClass}-icon">${icon}</span>
                <span>${message}</span>
            </div>
            <button class="${this.notificationClass}-close">&times;</button>
        `;
        
        // Adicionar ao container
        container.appendChild(notification);
        
        // Configurar botão de fechar
        const closeButton = notification.querySelector(`.${this.notificationClass}-close`);
        closeButton.addEventListener('click', () => {
            this.hide(notification);
        });
        
        // Remover após o tempo definido
        if (duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, duration);
        }
        
        return notification;
    }
    
    /**
     * Esconde uma notificação
     * @param {HTMLElement} notification - Elemento da notificação
     */
    hide(notification) {
        if (!notification || !notification.parentNode) {
            return;
        }
        
        // Animar saída
        notification.style.animation = `fadeOut ${this.animationDuration / 1000}s ease`;
        
        // Remover após animação
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, this.animationDuration);
    }
    
    /**
     * Mostra uma notificação de sucesso
     * @param {string} message - Mensagem da notificação
     * @param {number} duration - Duração em milissegundos
     * @returns {HTMLElement} Elemento da notificação
     */
    success(message, duration = this.defaultDuration) {
        return this.show(message, 'success', duration);
    }
    
    /**
     * Mostra uma notificação de erro
     * @param {string} message - Mensagem da notificação
     * @param {number} duration - Duração em milissegundos
     * @returns {HTMLElement} Elemento da notificação
     */
    error(message, duration = this.defaultDuration) {
        return this.show(message, 'error', duration);
    }
    
    /**
     * Mostra uma notificação de aviso
     * @param {string} message - Mensagem da notificação
     * @param {number} duration - Duração em milissegundos
     * @returns {HTMLElement} Elemento da notificação
     */
    warning(message, duration = this.defaultDuration) {
        return this.show(message, 'warning', duration);
    }
    
    /**
     * Mostra uma notificação de informação
     * @param {string} message - Mensagem da notificação
     * @param {number} duration - Duração em milissegundos
     * @returns {HTMLElement} Elemento da notificação
     */
    info(message, duration = this.defaultDuration) {
        return this.show(message, 'info', duration);
    }
}

// Exportar instância única (Singleton)
export const notificationComponent = new NotificationComponent();
export default notificationComponent;

