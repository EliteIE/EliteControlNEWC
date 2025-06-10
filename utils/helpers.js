/**
 * @fileoverview Utilitários gerais para o CloudControl
 * @version 1.0.0
 */

/**
 * Exibe uma notificação na interface
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo da notificação ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duração em milissegundos
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Verificar se o componente de notificação está disponível
    if (window.notificationComponent) {
        window.notificationComponent.show(message, type, duration);
        return;
    }
    
    // Implementação alternativa caso o componente não esteja disponível
    const container = document.getElementById('notification-container') || createNotificationContainer();
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
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
        <div class="notification-content">
            <span class="notification-icon">${icon}</span>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Adicionar ao container
    container.appendChild(notification);
    
    // Configurar botão de fechar
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Remover após o tempo definido
    if (duration > 0) {
        setTimeout(() => {
            hideNotification(notification);
        }, duration);
    }
}

/**
 * Cria o container de notificações
 * @private
 * @returns {HTMLElement} Container de notificações
 */
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    
    // Adicionar estilos
    if (!document.getElementById('notification-styles')) {
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
            
            .notification {
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
            
            .notification-success {
                background-color: #10B981;
            }
            
            .notification-error {
                background-color: #EF4444;
            }
            
            .notification-warning {
                background-color: #F59E0B;
            }
            
            .notification-info {
                background-color: #3B82F6;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
            }
            
            .notification-icon {
                margin-right: 8px;
            }
            
            .notification-close {
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
    
    return container;
}

/**
 * Esconde uma notificação
 * @private
 * @param {HTMLElement} notification - Elemento da notificação
 */
function hideNotification(notification) {
    if (!notification || !notification.parentNode) {
        return;
    }
    
    // Animar saída
    notification.style.animation = 'fadeOut 0.3s ease';
    
    // Remover após animação
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Gera um ID único
 * @param {string} prefix - Prefixo para o ID
 * @returns {string} ID único
 */
export function generateUniqueId(prefix = '') {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}-${random}`;
}

/**
 * Copia um texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} Verdadeiro se o texto foi copiado com sucesso
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback para navegadores mais antigos
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    } catch (error) {
        console.error('❌ Erro ao copiar para a área de transferência:', error);
        return false;
    }
}

/**
 * Debounce para limitar a frequência de execução de uma função
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em milissegundos
 * @returns {Function} Função com debounce
 */
export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle para limitar a frequência de execução de uma função
 * @param {Function} func - Função a ser executada
 * @param {number} limit - Limite de tempo em milissegundos
 * @returns {Function} Função com throttle
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Obtém parâmetros da URL
 * @param {string} name - Nome do parâmetro
 * @returns {string|null} Valor do parâmetro ou null se não existir
 */
export function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Adiciona parâmetros à URL atual
 * @param {Object} params - Parâmetros a serem adicionados
 * @returns {string} URL com os parâmetros
 */
export function addUrlParams(params) {
    const url = new URL(window.location.href);
    
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.set(key, value);
        }
    });
    
    return url.toString();
}

/**
 * Remove parâmetros da URL atual
 * @param {Array} paramNames - Nomes dos parâmetros a serem removidos
 * @returns {string} URL sem os parâmetros
 */
export function removeUrlParams(paramNames) {
    const url = new URL(window.location.href);
    
    paramNames.forEach(name => {
        url.searchParams.delete(name);
    });
    
    return url.toString();
}

/**
 * Formata um objeto para query string
 * @param {Object} params - Objeto com os parâmetros
 * @returns {string} Query string
 */
export function formatQueryString(params) {
    return Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

/**
 * Analisa uma query string para objeto
 * @param {string} queryString - Query string
 * @returns {Object} Objeto com os parâmetros
 */
export function parseQueryString(queryString) {
    if (!queryString) return {};
    
    const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    
    return query.split('&').reduce((params, param) => {
        const [key, value] = param.split('=');
        if (key) {
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
        return params;
    }, {});
}

/**
 * Verifica se o dispositivo é móvel
 * @returns {boolean} Verdadeiro se o dispositivo for móvel
 */
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Obtém o tipo de dispositivo
 * @returns {string} Tipo de dispositivo ('mobile', 'tablet', 'desktop')
 */
export function getDeviceType() {
    const userAgent = navigator.userAgent;
    
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        return 'mobile';
    }
    
    if (/iPad|tablet|Tablet/i.test(userAgent)) {
        return 'tablet';
    }
    
    return 'desktop';
}

/**
 * Formata um número de bytes para uma unidade legível
 * @param {number} bytes - Bytes a serem formatados
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Tamanho formatado
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Obtém a extensão de um arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {string} Extensão do arquivo
 */
export function getFileExtension(filename) {
    if (!filename) return '';
    
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Verifica se um arquivo é uma imagem
 * @param {string} filename - Nome do arquivo
 * @returns {boolean} Verdadeiro se o arquivo for uma imagem
 */
export function isImageFile(filename) {
    const extension = getFileExtension(filename);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    
    return imageExtensions.includes(extension);
}

/**
 * Verifica se um arquivo é um documento
 * @param {string} filename - Nome do arquivo
 * @returns {boolean} Verdadeiro se o arquivo for um documento
 */
export function isDocumentFile(filename) {
    const extension = getFileExtension(filename);
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];
    
    return documentExtensions.includes(extension);
}

/**
 * Obtém o tipo MIME de um arquivo
 * @param {string} filename - Nome do arquivo
 * @returns {string} Tipo MIME
 */
export function getMimeType(filename) {
    const extension = getFileExtension(filename);
    
    const mimeTypes = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        txt: 'text/plain',
        csv: 'text/csv',
        json: 'application/json',
        xml: 'application/xml',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        avi: 'video/x-msvideo',
        mov: 'video/quicktime',
        html: 'text/html',
        css: 'text/css',
        js: 'application/javascript'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Converte um objeto File para Base64
 * @param {File} file - Arquivo a ser convertido
 * @returns {Promise<string>} String Base64
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            resolve(reader.result);
        };
        
        reader.onerror = error => {
            reject(error);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Converte uma string Base64 para Blob
 * @param {string} base64 - String Base64
 * @param {string} mimeType - Tipo MIME
 * @returns {Blob} Blob
 */
export function base64ToBlob(base64, mimeType) {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeType });
}

/**
 * Obtém a data atual formatada
 * @param {string} format - Formato da data ('date', 'datetime', 'time')
 * @returns {string} Data formatada
 */
export function getCurrentDate(format = 'date') {
    const now = new Date();
    
    switch (format) {
        case 'datetime':
            return now.toLocaleString('pt-BR');
        case 'time':
            return now.toLocaleTimeString('pt-BR');
        case 'date':
        default:
            return now.toLocaleDateString('pt-BR');
    }
}

/**
 * Obtém a diferença entre duas datas
 * @param {Date|string|number} date1 - Primeira data
 * @param {Date|string|number} date2 - Segunda data
 * @param {string} unit - Unidade de tempo ('days', 'hours', 'minutes', 'seconds', 'milliseconds')
 * @returns {number} Diferença entre as datas
 */
export function getDateDiff(date1, date2, unit = 'days') {
    const d1 = date1 instanceof Date ? date1 : new Date(date1);
    const d2 = date2 instanceof Date ? date2 : new Date(date2);
    
    const diffMs = Math.abs(d2 - d1);
    
    switch (unit) {
        case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        case 'hours':
            return Math.floor(diffMs / (1000 * 60 * 60));
        case 'minutes':
            return Math.floor(diffMs / (1000 * 60));
        case 'seconds':
            return Math.floor(diffMs / 1000);
        case 'milliseconds':
        default:
            return diffMs;
    }
}

/**
 * Adiciona tempo a uma data
 * @param {Date|string|number} date - Data base
 * @param {number} amount - Quantidade a ser adicionada
 * @param {string} unit - Unidade de tempo ('days', 'hours', 'minutes', 'seconds', 'milliseconds')
 * @returns {Date} Nova data
 */
export function addTime(date, amount, unit = 'days') {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    
    switch (unit) {
        case 'days':
            d.setDate(d.getDate() + amount);
            break;
        case 'hours':
            d.setHours(d.getHours() + amount);
            break;
        case 'minutes':
            d.setMinutes(d.getMinutes() + amount);
            break;
        case 'seconds':
            d.setSeconds(d.getSeconds() + amount);
            break;
        case 'milliseconds':
            d.setMilliseconds(d.getMilliseconds() + amount);
            break;
    }
    
    return d;
}

/**
 * Subtrai tempo de uma data
 * @param {Date|string|number} date - Data base
 * @param {number} amount - Quantidade a ser subtraída
 * @param {string} unit - Unidade de tempo ('days', 'hours', 'minutes', 'seconds', 'milliseconds')
 * @returns {Date} Nova data
 */
export function subtractTime(date, amount, unit = 'days') {
    return addTime(date, -amount, unit);
}

/**
 * Formata um número para moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
export function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata um número com separadores de milhar
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Converte um objeto para FormData
 * @param {Object} obj - Objeto a ser convertido
 * @returns {FormData} FormData
 */
export function objectToFormData(obj) {
    const formData = new FormData();
    
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (item instanceof File) {
                        formData.append(`${key}[${index}]`, item, item.name);
                    } else if (typeof item === 'object') {
                        formData.append(`${key}[${index}]`, JSON.stringify(item));
                    } else {
                        formData.append(`${key}[${index}]`, item);
                    }
                });
            } else if (value instanceof File) {
                formData.append(key, value, value.name);
            } else if (typeof value === 'object' && !(value instanceof File)) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        }
    });
    
    return formData;
}

/**
 * Converte um objeto para query string
 * @param {Object} obj - Objeto a ser convertido
 * @returns {string} Query string
 */
export function objectToQueryString(obj) {
    return Object.entries(obj)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.map(item => `${encodeURIComponent(key)}[]=${encodeURIComponent(item)}`).join('&');
            }
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        })
        .join('&');
}

/**
 * Converte uma query string para objeto
 * @param {string} queryString - Query string
 * @returns {Object} Objeto
 */
export function queryStringToObject(queryString) {
    if (!queryString) return {};
    
    const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
    
    return query.split('&').reduce((params, param) => {
        const [key, value] = param.split('=');
        if (key) {
            const decodedKey = decodeURIComponent(key);
            const decodedValue = decodeURIComponent(value || '');
            
            if (decodedKey.endsWith('[]')) {
                const arrayKey = decodedKey.slice(0, -2);
                if (!params[arrayKey]) {
                    params[arrayKey] = [];
                }
                params[arrayKey].push(decodedValue);
            } else {
                params[decodedKey] = decodedValue;
            }
        }
        return params;
    }, {});
}

/**
 * Cria um elemento HTML a partir de uma string
 * @param {string} html - String HTML
 * @returns {HTMLElement} Elemento HTML
 */
export function createElementFromHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
}

/**
 * Obtém o valor de um cookie
 * @param {string} name - Nome do cookie
 * @returns {string|null} Valor do cookie ou null se não existir
 */
export function getCookie(name) {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        
        if (cookie.startsWith(name + '=')) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    
    return null;
}

/**
 * Define um cookie
 * @param {string} name - Nome do cookie
 * @param {string} value - Valor do cookie
 * @param {Object} options - Opções do cookie
 */
export function setCookie(name, value, options = {}) {
    const defaultOptions = {
        path: '/',
        expires: null,
        maxAge: null,
        domain: null,
        secure: false,
        sameSite: 'Lax'
    };
    
    const opts = { ...defaultOptions, ...options };
    
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    if (opts.path) {
        cookie += `; path=${opts.path}`;
    }
    
    if (opts.expires) {
        const expiresDate = opts.expires instanceof Date ? opts.expires : new Date(opts.expires);
        cookie += `; expires=${expiresDate.toUTCString()}`;
    }
    
    if (opts.maxAge) {
        cookie += `; max-age=${opts.maxAge}`;
    }
    
    if (opts.domain) {
        cookie += `; domain=${opts.domain}`;
    }
    
    if (opts.secure) {
        cookie += '; secure';
    }
    
    if (opts.sameSite) {
        cookie += `; samesite=${opts.sameSite}`;
    }
    
    document.cookie = cookie;
}

/**
 * Remove um cookie
 * @param {string} name - Nome do cookie
 * @param {Object} options - Opções do cookie
 */
export function removeCookie(name, options = {}) {
    setCookie(name, '', {
        ...options,
        expires: new Date(0)
    });
}

/**
 * Obtém o valor de um item do localStorage
 * @param {string} key - Chave do item
 * @param {boolean} parse - Se deve fazer parse do JSON
 * @returns {*} Valor do item
 */
export function getLocalStorage(key, parse = true) {
    const value = localStorage.getItem(key);
    
    if (value === null) {
        return null;
    }
    
    if (parse) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }
    
    return value;
}

/**
 * Define um item no localStorage
 * @param {string} key - Chave do item
 * @param {*} value - Valor do item
 * @param {boolean} stringify - Se deve converter para JSON
 */
export function setLocalStorage(key, value, stringify = true) {
    if (stringify && typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.setItem(key, value);
    }
}

/**
 * Remove um item do localStorage
 * @param {string} key - Chave do item
 */
export function removeLocalStorage(key) {
    localStorage.removeItem(key);
}

/**
 * Obtém o valor de um item do sessionStorage
 * @param {string} key - Chave do item
 * @param {boolean} parse - Se deve fazer parse do JSON
 * @returns {*} Valor do item
 */
export function getSessionStorage(key, parse = true) {
    const value = sessionStorage.getItem(key);
    
    if (value === null) {
        return null;
    }
    
    if (parse) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    }
    
    return value;
}

/**
 * Define um item no sessionStorage
 * @param {string} key - Chave do item
 * @param {*} value - Valor do item
 * @param {boolean} stringify - Se deve converter para JSON
 */
export function setSessionStorage(key, value, stringify = true) {
    if (stringify && typeof value === 'object') {
        sessionStorage.setItem(key, JSON.stringify(value));
    } else {
        sessionStorage.setItem(key, value);
    }
}

/**
 * Remove um item do sessionStorage
 * @param {string} key - Chave do item
 */
export function removeSessionStorage(key) {
    sessionStorage.removeItem(key);
}

