/**
 * @fileoverview Configuração do Firebase
 * @version 1.0.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Variável para armazenar instâncias do Firebase por tenant
const firebaseApps = {};

/**
 * Inicializa ou retorna a instância do Firebase App para o tenant
 * @param {Object} config - Configuração do Firebase
 * @param {string} tenantId - Identificador do tenant
 * @returns {Object} Instância do Firebase App
 */
export function getFirebaseApp(config, tenantId = 'default') {
    if (!firebaseApps[tenantId]) {
        firebaseApps[tenantId] = initializeApp(config, tenantId);
    }
    return firebaseApps[tenantId];
}

/**
 * Obtém a instância do Firestore
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Firestore
 */
export function getFirestoreInstance(app) {
    return getFirestore(app);
}

/**
 * Obtém a instância do Authentication
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Authentication
 */
export function getAuthInstance(app) {
    return getAuth(app);
}

/**
 * Obtém a instância do Storage
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Storage
 */
export function getStorageInstance(app) {
    return getStorage(app);
}

/**
 * Obtém a instância do Analytics
 * @param {Object} app - Instância do Firebase App
 * @returns {Object} Instância do Analytics
 */
export function getAnalytics(app) {
    return firebase.analytics(app);
}

/**
 * Obtém um timestamp do servidor
 * @returns {Object} Timestamp do servidor
 */
export function getServerTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
}

/**
 * Converte um timestamp do Firestore para um objeto Date
 * @param {Object} timestamp - Timestamp do Firestore
 * @returns {Date} Objeto Date
 */
export function timestampToDate(timestamp) {
    if (!timestamp) {
        return null;
    }
    
    if (timestamp instanceof Date) {
        return timestamp;
    }
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    
    return new Date(timestamp);
}

/**
 * Formata um timestamp para exibição
 * @param {Object|Date} timestamp - Timestamp do Firestore ou objeto Date
 * @param {Object} options - Opções de formatação
 * @returns {string} Data formatada
 */
export function formatTimestamp(timestamp, options = {}) {
    const date = timestampToDate(timestamp);
    
    if (!date) {
        return '';
    }
    
    const defaultOptions = {
        dateStyle: 'medium',
        timeStyle: 'short'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('pt-BR', formatOptions).format(date);
}

// Nova configuração do Firebase fornecida pelo usuário
export const firebaseConfig = {
  apiKey: "AIzaSyBBBeQl1uVJTTzQ9VRhZrl5Ru8B7R7vj4E",
  authDomain: "meusaas-514ed.firebaseapp.com",
  projectId: "meusaas-514ed",
  storageBucket: "meusaas-514ed.appspot.com",
  messagingSenderId: "583332907183",
  appId: "1:583332907183:web:b880a631388614a8e9ac5a",
  measurementId: "G-H0TWHRRFN5"
};

