// Tela de cadastro de empresa/tenant para onboarding SaaS
export function renderCadastroEmpresa() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="cadastro-empresa-container">
      <h2>Cadastre sua Empresa</h2>
      <form id="cadastroEmpresaForm" class="cadastro-form">
        <label>Nome da Empresa</label>
        <input type="text" id="empresaNome" required placeholder="Ex: Padaria do João">
        <label>E-mail do Administrador</label>
        <input type="email" id="empresaEmail" required placeholder="admin@empresa.com">
        <label>Senha Inicial</label>
        <input type="password" id="empresaSenha" required minlength="6" placeholder="Mínimo 6 caracteres">
        <label>Cor Primária</label>
        <input type="color" id="empresaCor" value="#1976d2">
        <button type="submit">Criar Empresa</button>
      </form>
      <div id="cadastroEmpresaMsg" style="margin-top:1rem;"></div>
    </div>
    <style>
      .cadastro-empresa-container { max-width: 400px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #0001; padding: 2rem; }
      .cadastro-form label { margin-top: 1rem; display: block; font-weight: bold; }
      .cadastro-form input, .cadastro-form button { width: 100%; margin-top: 0.5rem; padding: 0.5rem; border-radius: 4px; border: 1px solid #ccc; }
      .cadastro-form button { background: #1976d2; color: #fff; font-weight: bold; border: none; margin-top: 1.5rem; cursor: pointer; }
      .cadastro-form button:hover { background: #125ea2; }
    </style>
  `;

  document.getElementById('cadastroEmpresaForm').onsubmit = async (e) => {
    e.preventDefault();
    const nome = document.getElementById('empresaNome').value.trim();
    const email = document.getElementById('empresaEmail').value.trim();
    const senha = document.getElementById('empresaSenha').value;
    const cor = document.getElementById('empresaCor').value;
    const msgDiv = document.getElementById('cadastroEmpresaMsg');
    msgDiv.textContent = '';
    if (!nome || !email || !senha) {
      msgDiv.textContent = 'Preencha todos os campos.';
      return;
    }
    msgDiv.innerHTML = '<span style="color:#1976d2">Criando empresa...</span>';
    // Simulação de provisionamento (mock)
    setTimeout(() => {
      // Gera um "slug" para o tenant
      const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      // Simula criação do tenant-config.json
      // Em produção, aqui faria chamada para backend/serverless
      msgDiv.innerHTML = `
        <span style="color:green">Empresa criada com sucesso!</span><br>
        <b>Link de acesso:</b> <a href="/${slug}" target="_blank">/${slug}</a><br>
        <small>Use o e-mail e senha cadastrados para acessar.</small>
      `;
    }, 1500);
  };
} 