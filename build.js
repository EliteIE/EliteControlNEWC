/**
 * Script de build para o CloudControl
 * 
 * Este script realiza as seguintes tarefas:
 * 1. Limpa o diretório de build
 * 2. Copia os arquivos HTML
 * 3. Minifica os arquivos CSS
 * 4. Minifica os arquivos JavaScript
 * 5. Otimiza as imagens
 * 6. Copia outros recursos estáticos
 * 7. Gera o service worker
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configurações
const sourceDir = __dirname;
const buildDir = path.join(__dirname, 'dist');
const tempDir = path.join(__dirname, '.temp');

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Função para criar diretório se não existir
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Função para limpar diretório
function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  ensureDirectoryExists(dir);
}

// Função para copiar diretório recursivamente
function copyDirectory(source, destination) {
  ensureDirectoryExists(destination);
  
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Função para instalar dependências se necessário
function installDependencies() {
  console.log(`${colors.cyan}Verificando dependências...${colors.reset}`);
  
  try {
    // Verificar se terser está instalado
    require.resolve('terser');
    require.resolve('clean-css');
    require.resolve('html-minifier');
    require.resolve('imagemin');
  } catch (error) {
    console.log(`${colors.yellow}Instalando dependências necessárias...${colors.reset}`);
    
    execSync('npm install --no-save terser clean-css html-minifier imagemin imagemin-mozjpeg imagemin-pngquant', {
      stdio: 'inherit'
    });
  }
}

// Função para minificar HTML
function minifyHTML(source, destination) {
  const htmlMinifier = require('html-minifier');
  
  const content = fs.readFileSync(source, 'utf8');
  const minified = htmlMinifier.minify(content, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });
  
  fs.writeFileSync(destination, minified);
}

// Função para minificar CSS
function minifyCSS(source, destination) {
  const CleanCSS = require('clean-css');
  
  const content = fs.readFileSync(source, 'utf8');
  const minified = new CleanCSS({
    level: 2,
    compatibility: 'ie11'
  }).minify(content);
  
  fs.writeFileSync(destination, minified.styles);
}

// Função para minificar JS
function minifyJS(source, destination) {
  const { minify } = require('terser');
  
  const content = fs.readFileSync(source, 'utf8');
  
  minify(content, {
    compress: {
      drop_console: false,
      drop_debugger: true
    },
    mangle: true,
    output: {
      comments: false
    }
  }).then(result => {
    fs.writeFileSync(destination, result.code);
  }).catch(error => {
    console.error(`${colors.red}Erro ao minificar ${source}:${colors.reset}`, error);
    // Copiar o arquivo original em caso de erro
    fs.copyFileSync(source, destination);
  });
}

// Função para otimizar imagens
async function optimizeImages(sourceDir, destDir) {
  const imagemin = require('imagemin');
  const imageminMozjpeg = require('imagemin-mozjpeg');
  const imageminPngquant = require('imagemin-pngquant');
  
  const files = await imagemin([`${sourceDir}/*.{jpg,jpeg,png,gif,svg}`], {
    destination: destDir,
    plugins: [
      imageminMozjpeg({ quality: 80 }),
      imageminPngquant({ quality: [0.6, 0.8] })
    ]
  });
  
  return files;
}

// Função para processar arquivos
function processFiles(sourceDir, destDir, fileExtension, processor) {
  ensureDirectoryExists(destDir);
  
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      processFiles(sourcePath, destPath, fileExtension, processor);
    } else if (entry.name.endsWith(fileExtension)) {
      processor(sourcePath, destPath);
    } else {
      // Copiar outros arquivos sem processamento
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Função principal de build
async function build() {
  console.log(`${colors.bright}${colors.cyan}=== Iniciando build do CloudControl ===${colors.reset}\n`);
  
  // Instalar dependências se necessário
  installDependencies();
  
  // Limpar diretórios
  console.log(`${colors.yellow}Limpando diretórios...${colors.reset}`);
  cleanDirectory(buildDir);
  cleanDirectory(tempDir);
  
  // Copiar arquivos HTML e minificar
  console.log(`${colors.yellow}Processando arquivos HTML...${colors.reset}`);
  processFiles(
    path.join(sourceDir, 'pages'),
    path.join(buildDir, 'pages'),
    '.html',
    minifyHTML
  );
  
  // Processar arquivo index.html na raiz
  if (fs.existsSync(path.join(sourceDir, 'index.html'))) {
    minifyHTML(
      path.join(sourceDir, 'index.html'),
      path.join(buildDir, 'index.html')
    );
  }
  
  // Processar arquivos CSS
  console.log(`${colors.yellow}Processando arquivos CSS...${colors.reset}`);
  processFiles(
    path.join(sourceDir, 'styles'),
    path.join(buildDir, 'styles'),
    '.css',
    minifyCSS
  );
  
  // Processar arquivos JavaScript
  console.log(`${colors.yellow}Processando arquivos JavaScript...${colors.reset}`);
  processFiles(
    path.join(sourceDir, 'services'),
    path.join(buildDir, 'services'),
    '.js',
    minifyJS
  );
  
  processFiles(
    path.join(sourceDir, 'utils'),
    path.join(buildDir, 'utils'),
    '.js',
    minifyJS
  );
  
  processFiles(
    path.join(sourceDir, 'components'),
    path.join(buildDir, 'components'),
    '.js',
    minifyJS
  );
  
  // Processar Service Worker
  if (fs.existsSync(path.join(sourceDir, 'sw.js'))) {
    console.log(`${colors.yellow}Processando Service Worker...${colors.reset}`);
    minifyJS(
      path.join(sourceDir, 'sw.js'),
      path.join(buildDir, 'sw.js')
    );
  }
  
  // Copiar manifest.json
  if (fs.existsSync(path.join(sourceDir, 'manifest.json'))) {
    console.log(`${colors.yellow}Copiando manifest.json...${colors.reset}`);
    fs.copyFileSync(
      path.join(sourceDir, 'manifest.json'),
      path.join(buildDir, 'manifest.json')
    );
  }
  
  // Otimizar imagens
  console.log(`${colors.yellow}Otimizando imagens...${colors.reset}`);
  try {
    await optimizeImages(
      path.join(sourceDir, 'assets/images'),
      path.join(buildDir, 'assets/images')
    );
  } catch (error) {
    console.error(`${colors.red}Erro ao otimizar imagens:${colors.reset}`, error);
    // Copiar imagens sem otimização em caso de erro
    copyDirectory(
      path.join(sourceDir, 'assets/images'),
      path.join(buildDir, 'assets/images')
    );
  }
  
  // Copiar outros recursos
  console.log(`${colors.yellow}Copiando outros recursos...${colors.reset}`);
  copyDirectory(
    path.join(sourceDir, 'assets/fonts'),
    path.join(buildDir, 'assets/fonts')
  );
  
  copyDirectory(
    path.join(sourceDir, 'assets/icons'),
    path.join(buildDir, 'assets/icons')
  );
  
  // Copiar README e documentação
  if (fs.existsSync(path.join(sourceDir, 'README.md'))) {
    fs.copyFileSync(
      path.join(sourceDir, 'README.md'),
      path.join(buildDir, 'README.md')
    );
  }
  
  if (fs.existsSync(path.join(sourceDir, 'docs'))) {
    copyDirectory(
      path.join(sourceDir, 'docs'),
      path.join(buildDir, 'docs')
    );
  }
  
  // Limpar diretório temporário
  cleanDirectory(tempDir);
  fs.rmdirSync(tempDir);
  
  console.log(`\n${colors.bright}${colors.green}=== Build concluído com sucesso! ===${colors.reset}`);
  console.log(`${colors.green}Os arquivos estão disponíveis em: ${colors.bright}${buildDir}${colors.reset}\n`);
}

// Executar build
build().catch(error => {
  console.error(`${colors.bright}${colors.red}Erro durante o build:${colors.reset}`, error);
  process.exit(1);
});

