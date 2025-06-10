/**
 * @fileoverview Utilitários para validação de dados
 * @version 1.0.0
 */

/**
 * Verifica se um valor é vazio (null, undefined, string vazia, array vazio, objeto vazio)
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for vazio
 */
export function isEmpty(value) {
    if (value === null || value === undefined) {
        return true;
    }
    
    if (typeof value === 'string') {
        return value.trim() === '';
    }
    
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    
    return false;
}

/**
 * Verifica se um email é válido
 * @param {string} email - Email a ser verificado
 * @returns {boolean} Verdadeiro se o email for válido
 */
export function isValidEmail(email) {
    if (!email) return false;
    
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Verifica se uma senha é válida
 * @param {string} password - Senha a ser verificada
 * @param {Object} options - Opções de validação
 * @returns {boolean} Verdadeiro se a senha for válida
 */
export function isValidPassword(password, options = {}) {
    if (!password) return false;
    
    const defaultOptions = {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false
    };
    
    const opts = { ...defaultOptions, ...options };
    
    if (password.length < opts.minLength) {
        return false;
    }
    
    if (opts.requireUppercase && !/[A-Z]/.test(password)) {
        return false;
    }
    
    if (opts.requireLowercase && !/[a-z]/.test(password)) {
        return false;
    }
    
    if (opts.requireNumbers && !/[0-9]/.test(password)) {
        return false;
    }
    
    if (opts.requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        return false;
    }
    
    return true;
}

/**
 * Verifica se um CPF é válido
 * @param {string} cpf - CPF a ser verificado
 * @returns {boolean} Verdadeiro se o CPF for válido
 */
export function isValidCPF(cpf) {
    if (!cpf) return false;
    
    // Remover caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) {
        return false;
    }
    
    // Validar dígitos verificadores
    let sum = 0;
    let remainder;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    
    if (remainder !== parseInt(cpf.substring(9, 10))) {
        return false;
    }
    
    // Segundo dígito verificador
    sum = 0;
    
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    
    if (remainder === 10 || remainder === 11) {
        remainder = 0;
    }
    
    if (remainder !== parseInt(cpf.substring(10, 11))) {
        return false;
    }
    
    return true;
}

/**
 * Verifica se um CNPJ é válido
 * @param {string} cnpj - CNPJ a ser verificado
 * @returns {boolean} Verdadeiro se o CNPJ for válido
 */
export function isValidCNPJ(cnpj) {
    if (!cnpj) return false;
    
    // Remover caracteres não numéricos
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) {
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) {
        return false;
    }
    
    // Validar dígitos verificadores
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    // Primeiro dígito verificador
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (result !== parseInt(digits.charAt(0))) {
        return false;
    }
    
    // Segundo dígito verificador
    size += 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    if (result !== parseInt(digits.charAt(1))) {
        return false;
    }
    
    return true;
}

/**
 * Verifica se um telefone é válido
 * @param {string} phone - Telefone a ser verificado
 * @returns {boolean} Verdadeiro se o telefone for válido
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    
    // Remover caracteres não numéricos
    phone = phone.replace(/\D/g, '');
    
    // Verificar comprimento
    if (phone.length < 8 || phone.length > 11) {
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(phone)) {
        return false;
    }
    
    return true;
}

/**
 * Verifica se um CEP é válido
 * @param {string} cep - CEP a ser verificado
 * @returns {boolean} Verdadeiro se o CEP for válido
 */
export function isValidCEP(cep) {
    if (!cep) return false;
    
    // Remover caracteres não numéricos
    cep = cep.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cep)) {
        return false;
    }
    
    return true;
}

/**
 * Verifica se uma data é válida
 * @param {Date|string|number} date - Data a ser verificada
 * @returns {boolean} Verdadeiro se a data for válida
 */
export function isValidDate(date) {
    if (!date) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    return !isNaN(dateObj.getTime());
}

/**
 * Verifica se uma data está no futuro
 * @param {Date|string|number} date - Data a ser verificada
 * @returns {boolean} Verdadeiro se a data estiver no futuro
 */
export function isFutureDate(date) {
    if (!isValidDate(date)) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    
    return dateObj > now;
}

/**
 * Verifica se uma data está no passado
 * @param {Date|string|number} date - Data a ser verificada
 * @returns {boolean} Verdadeiro se a data estiver no passado
 */
export function isPastDate(date) {
    if (!isValidDate(date)) return false;
    
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    
    return dateObj < now;
}

/**
 * Verifica se um valor é um número
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um número
 */
export function isNumber(value) {
    if (typeof value === 'number') {
        return !isNaN(value);
    }
    
    if (typeof value === 'string') {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    
    return false;
}

/**
 * Verifica se um valor é um número inteiro
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um número inteiro
 */
export function isInteger(value) {
    if (!isNumber(value)) return false;
    
    const num = parseFloat(value);
    return Number.isInteger(num);
}

/**
 * Verifica se um valor é um número positivo
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um número positivo
 */
export function isPositiveNumber(value) {
    if (!isNumber(value)) return false;
    
    const num = parseFloat(value);
    return num > 0;
}

/**
 * Verifica se um valor é um número negativo
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um número negativo
 */
export function isNegativeNumber(value) {
    if (!isNumber(value)) return false;
    
    const num = parseFloat(value);
    return num < 0;
}

/**
 * Verifica se um valor está dentro de um intervalo
 * @param {number} value - Valor a ser verificado
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} Verdadeiro se o valor estiver dentro do intervalo
 */
export function isInRange(value, min, max) {
    if (!isNumber(value)) return false;
    
    const num = parseFloat(value);
    return num >= min && num <= max;
}

/**
 * Verifica se um valor é um cartão de crédito válido (algoritmo de Luhn)
 * @param {string} cardNumber - Número do cartão
 * @returns {boolean} Verdadeiro se o cartão for válido
 */
export function isValidCreditCard(cardNumber) {
    if (!cardNumber) return false;
    
    // Remover caracteres não numéricos
    cardNumber = cardNumber.replace(/\D/g, '');
    
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    // Algoritmo de Luhn
    let sum = 0;
    let shouldDouble = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
}

/**
 * Verifica se uma URL é válida
 * @param {string} url - URL a ser verificada
 * @returns {boolean} Verdadeiro se a URL for válida
 */
export function isValidURL(url) {
    if (!url) return false;
    
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Verifica se um valor é um objeto
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um objeto
 */
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Verifica se um valor é um array
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um array
 */
export function isArray(value) {
    return Array.isArray(value);
}

/**
 * Verifica se um valor é uma função
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for uma função
 */
export function isFunction(value) {
    return typeof value === 'function';
}

/**
 * Verifica se um valor é uma string
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for uma string
 */
export function isString(value) {
    return typeof value === 'string';
}

/**
 * Verifica se um valor é um booleano
 * @param {*} value - Valor a ser verificado
 * @returns {boolean} Verdadeiro se o valor for um booleano
 */
export function isBoolean(value) {
    return typeof value === 'boolean';
}

