/**
 * @fileoverview Módulo de Login do CloudControl
 * @version 1.0.0
 */

import { AuthService } from '../../../services/firebase/auth-service.js';

export function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <h2>Login</h2>
      <form id="loginForm">
        <input type="email" id="email" placeholder="Email" required><br>
        <input type="password" id="password" placeholder="Senha" required><br>
        <button type="submit">Entrar</button>
      </form>
      <div id="loginError" style="color: red; margin-top: 1rem;"></div>
    </div>
  `;

  // Inicializar AuthService multi-tenant-aware
  const tenantConfig = window.tenantConfig?.firebaseConfig;
  const tenantId = window.tenantConfig?.companyName || 'default';
  const authService = AuthService.createForTenant(tenantConfig, tenantId);

  document.getElementById('loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!email || !password) {
      document.getElementById('loginError').textContent = 'Preencha todos os campos.';
      return;
    }
    document.getElementById('loginError').textContent = '';
    try {
      await authService.loginWithEmailAndPassword(email, password);
      window.location.hash = 'dashboard';
    } catch (error) {
      document.getElementById('loginError').textContent = 'Credenciais inválidas ou erro de autenticação.';
    }
  };
} 