# Guia de Implantação - CloudControl

Este documento fornece instruções detalhadas para implantar o CloudControl em diferentes ambientes de produção.

## Sumário

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Ambiente](#preparação-do-ambiente)
3. [Configuração do Firebase](#configuração-do-firebase)
4. [Implantação no Firebase Hosting](#implantação-no-firebase-hosting)
5. [Implantação em Servidores Tradicionais](#implantação-em-servidores-tradicionais)
6. [Configuração de Domínio Personalizado](#configuração-de-domínio-personalizado)
7. [Monitoramento e Manutenção](#monitoramento-e-manutenção)
8. [Solução de Problemas](#solução-de-problemas)

## Pré-requisitos

Antes de iniciar o processo de implantação, certifique-se de ter:

- Node.js (versão 14 ou superior)
- NPM (versão 6 ou superior)
- Firebase CLI (`npm install -g firebase-tools`)
- Git
- Conta no Firebase (para autenticação e banco de dados)
- Editor de código (VS Code recomendado)

## Preparação do Ambiente

### 1. Clone o repositório

```bash
git clone https://github.com/EliteIE/CloudControl.git
cd CloudControl
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
FIREBASE_API_KEY=sua_api_key
FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
FIREBASE_PROJECT_ID=seu_projeto
FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
FIREBASE_APP_ID=seu_app_id
FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

### 4. Construa o projeto

```bash
npm run build
```

Este comando irá:
- Minificar os arquivos JavaScript
- Otimizar as imagens
- Compilar os arquivos CSS
- Gerar a versão de produção na pasta `dist/`

## Configuração do Firebase

### 1. Crie um projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Siga as instruções para criar um novo projeto
4. Ative o Google Analytics (opcional, mas recomendado)

### 2. Configure a Autenticação

1. No console do Firebase, vá para "Authentication"
2. Clique em "Começar"
3. Ative os métodos de autenticação:
   - Email/Senha
   - Google (opcional)
   - Telefone (opcional)

### 3. Configure o Firestore

1. No console do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha o modo de segurança (iniciar em modo de teste)
4. Selecione a região mais próxima dos seus usuários
5. Clique em "Próximo" e depois em "Ativar"

### 4. Configure o Storage

1. No console do Firebase, vá para "Storage"
2. Clique em "Começar"
3. Aceite as configurações padrão
4. Clique em "Próximo" e depois em "Concluído"

### 5. Configure as Regras de Segurança

#### Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autenticação necessária para todas as operações
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Regras específicas para coleções
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'inventory_manager');
    }
    
    match /sales/{saleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                             (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
                              request.resource.data.sellerId == request.auth.uid);
    }
    
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    (request.resource.metadata.role == 'admin' || 
                     request.resource.metadata.role == 'inventory_manager');
    }
  }
}
```

## Implantação no Firebase Hosting

### 1. Faça login no Firebase CLI

```bash
firebase login
```

### 2. Inicialize o Firebase no projeto

```bash
firebase init
```

Selecione os seguintes recursos:
- Firestore
- Storage
- Hosting
- Functions (opcional)

### 3. Configure o Firebase Hosting

Durante a inicialização, responda às perguntas:
- Diretório público: `dist`
- Configurar como SPA: `sim`
- Configurar builds automáticas: `não`

### 4. Implante o projeto

```bash
firebase deploy
```

Após a conclusão, você receberá uma URL onde seu aplicativo está hospedado.

## Implantação em Servidores Tradicionais

### 1. Servidor Apache

1. Copie o conteúdo da pasta `dist/` para o diretório raiz do seu servidor web (geralmente `/var/www/html/`)

2. Configure o arquivo `.htaccess` na raiz do diretório:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Cabeçalhos de segurança
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set Content-Security-Policy "default-src 'self' https://www.gstatic.com https://*.googleapis.com; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleapis.com; connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com;"
</IfModule>

# Configurações de cache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
  ExpiresByType application/x-font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
  ExpiresByType application/font-sfnt "access plus 1 year"
  ExpiresByType application/vnd.ms-fontobject "access plus 1 year"
</IfModule>
```

### 2. Servidor Nginx

1. Copie o conteúdo da pasta `dist/` para o diretório do seu servidor (geralmente `/var/www/html/` ou `/usr/share/nginx/html/`)

2. Configure o arquivo de configuração do site:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    root /var/www/html;
    index index.html;

    # Configurações de segurança
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Content-Security-Policy "default-src 'self' https://www.gstatic.com https://*.googleapis.com; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://*.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleapis.com; connect-src 'self' https://*.googleapis.com wss://*.firebaseio.com;" always;

    # Configurações de cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Configuração para SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configuração para Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        expires -1;
    }
}
```

3. Reinicie o Nginx:

```bash
sudo systemctl restart nginx
```

## Configuração de Domínio Personalizado

### 1. Firebase Hosting

1. No console do Firebase, vá para "Hosting"
2. Clique em "Adicionar domínio personalizado"
3. Siga as instruções para verificar a propriedade do domínio
4. Configure os registros DNS conforme indicado

### 2. Servidor Tradicional

1. Configure o domínio no seu provedor de DNS
2. Aponte o registro A para o IP do seu servidor
3. Configure o servidor web para responder ao domínio (veja as configurações acima)

### 3. Configuração de SSL/TLS

#### Com Certbot (Let's Encrypt)

```bash
sudo apt-get update
sudo apt-get install certbot
```

Para Apache:
```bash
sudo apt-get install python3-certbot-apache
sudo certbot --apache -d seu-dominio.com -d www.seu-dominio.com
```

Para Nginx:
```bash
sudo apt-get install python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

## Monitoramento e Manutenção

### 1. Firebase Analytics

1. No console do Firebase, vá para "Analytics"
2. Configure eventos personalizados no código:

```javascript
// Exemplo de evento personalizado
firebase.analytics().logEvent('button_click', {
  button_name: 'login',
  screen_name: 'login_page'
});
```

### 2. Logs e Monitoramento

1. Configure o Firebase Performance Monitoring:

```javascript
// Inicializar Performance Monitoring
const perf = firebase.performance();

// Monitorar tempo de carregamento de uma função
const trace = perf.trace('data_load');
trace.start();

loadData().then(() => {
  trace.stop();
});
```

2. Configure o Firebase Crashlytics para capturar erros:

```javascript
// Capturar erros não tratados
window.addEventListener('error', (e) => {
  firebase.crashlytics().recordError(e.error);
});

// Capturar erros manualmente
try {
  // Código que pode gerar erro
} catch (error) {
  firebase.crashlytics().recordError(error);
}
```

### 3. Atualizações e Manutenção

1. Atualize regularmente as dependências:

```bash
npm update
```

2. Verifique vulnerabilidades:

```bash
npm audit
```

3. Implante atualizações:

```bash
npm run build
firebase deploy
```

## Solução de Problemas

### Problemas de Autenticação

1. Verifique se as regras de CORS estão configuradas corretamente
2. Confirme se o domínio está autorizado no Firebase Authentication
3. Verifique os logs no console do Firebase

### Problemas de Banco de Dados

1. Verifique as regras de segurança do Firestore
2. Confirme se a estrutura do banco de dados está correta
3. Verifique os índices necessários para consultas complexas

### Problemas de Performance

1. Use o Firebase Performance Monitoring para identificar gargalos
2. Otimize consultas ao Firestore
3. Implemente estratégias de cache para dados frequentemente acessados
4. Utilize o Lazy Loading para componentes e rotas

### Problemas de Implantação

1. Limpe o cache do navegador após atualizações
2. Verifique se o Service Worker está sendo atualizado corretamente
3. Confirme se todos os arquivos estáticos foram carregados corretamente

---

Para suporte adicional, entre em contato com a equipe de desenvolvimento em suporte@cloudcontrol.com.br ou abra uma issue no repositório do GitHub.

