/**
 * @fileoverview Utilitários para formatação de dados
 * @version 1.0.0
 */

/**
 * Formata um valor para moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @param {Object} options - Opções de formatação
 * @returns {string} Valor formatado
 */
export function formatCurrency(value, options = {}) {
    const defaultOptions = {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.NumberFormat('pt-BR', formatOptions).format(value);
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
 * Formata um CPF
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} CPF formatado
 */
export function formatCPF(cpf) {
    if (!cpf) return '';
    
    // Remover caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    if (numbers.length !== 11) {
        return cpf;
    }
    
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata um CNPJ
 * @param {string} cnpj - CNPJ a ser formatado
 * @returns {string} CNPJ formatado
 */
export function formatCNPJ(cnpj) {
    if (!cnpj) return '';
    
    // Remover caracteres não numéricos
    const numbers = cnpj.replace(/\D/g, '');
    
    if (numbers.length !== 14) {
        return cnpj;
    }
    
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata um documento (CPF ou CNPJ)
 * @param {string} doc - Documento a ser formatado
 * @returns {string} Documento formatado
 */
export function formatDocument(doc) {
    if (!doc) return '';
    
    // Remover caracteres não numéricos
    const numbers = doc.replace(/\D/g, '');
    
    if (numbers.length === 11) {
        return formatCPF(numbers);
    } else if (numbers.length === 14) {
        return formatCNPJ(numbers);
    }
    
    return doc;
}

/**
 * Formata um telefone
 * @param {string} phone - Telefone a ser formatado
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
    if (!phone) return '';
    
    // Remover caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
        // Celular com DDD
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 10) {
        // Telefone fixo com DDD
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 9) {
        // Celular sem DDD
        return numbers.replace(/(\d{5})(\d{4})/, '$1-$2');
    } else if (numbers.length === 8) {
        // Telefone fixo sem DDD
        return numbers.replace(/(\d{4})(\d{4})/, '$1-$2');
    }
    
    return phone;
}

/**
 * Formata um CEP
 * @param {string} cep - CEP a ser formatado
 * @returns {string} CEP formatado
 */
export function formatCEP(cep) {
    if (!cep) return '';
    
    // Remover caracteres não numéricos
    const numbers = cep.replace(/\D/g, '');
    
    if (numbers.length !== 8) {
        return cep;
    }
    
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata uma data
 * @param {Date|string|number} date - Data a ser formatada
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada
 */
export function formatDate(date, options = {}) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    const defaultOptions = {
        dateStyle: 'short'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('pt-BR', formatOptions).format(dateObj);
}

/**
 * Formata uma data e hora
 * @param {Date|string|number} date - Data a ser formatada
 * @param {Object} options - Opções de formatação
 * @returns {string} Data e hora formatadas
 */
export function formatDateTime(date, options = {}) {
    if (!date) return '';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }
    
    const defaultOptions = {
        dateStyle: 'short',
        timeStyle: 'short'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('pt-BR', formatOptions).format(dateObj);
}

/**
 * Formata um texto para URL amigável (slug)
 * @param {string} text - Texto a ser formatado
 * @returns {string} Slug
 */
export function formatSlug(text) {
    if (!text) return '';
    
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

/**
 * Formata bytes para uma unidade legível
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
 * Formata um número de cartão de crédito
 * @param {string} cardNumber - Número do cartão
 * @returns {string} Número formatado
 */
export function formatCreditCard(cardNumber) {
    if (!cardNumber) return '';
    
    // Remover caracteres não numéricos
    const numbers = cardNumber.replace(/\D/g, '');
    
    // Formatar grupos de 4 dígitos
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Trunca um texto com reticências
 * @param {string} text - Texto a ser truncado
 * @param {number} length - Comprimento máximo
 * @returns {string} Texto truncado
 */
export function truncateText(text, length = 100) {
    if (!text) return '';
    
    if (text.length <= length) {
        return text;
    }
    
    return text.substring(0, length) + '...';
}

/**
 * Capitaliza a primeira letra de cada palavra
 * @param {string} text - Texto a ser capitalizado
 * @returns {string} Texto capitalizado
 */
export function capitalizeWords(text) {
    if (!text) return '';
    
    return text.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Formata um nome completo para exibição (primeiro nome + último sobrenome)
 * @param {string} fullName - Nome completo
 * @returns {string} Nome formatado
 */
export function formatDisplayName(fullName) {
    if (!fullName) return '';
    
    const names = fullName.trim().split(' ');
    
    if (names.length === 1) {
        return names[0];
    }
    
    return `${names[0]} ${names[names.length - 1]}`;
}

/**
 * Formata um valor percentual
 * @param {number} value - Valor a ser formatado
 * @param {number} decimals - Número de casas decimais
 * @returns {string} Valor formatado
 */
export function formatPercent(value, decimals = 2) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value / 100);
}

