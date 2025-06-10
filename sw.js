/**
 * Service Worker para CloudControl
 * Implementa estratégias de cache para funcionamento offline
 * @version 1.0.0
 */

// Nome e versão do cache
const CACHE_NAME = 'cloudcontrol-cache-v1';

// Recursos a serem cacheados na instalação
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/pages/dashboard.html',
    '/styles/main.css',
    '/styles/base/reset.css',
    '/styles/base/variables.css',
    '/manifest.json',
    // Recursos externos essenciais
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Recursos que não devem ser cacheados
const NO_CACHE_URLS = [
    '/api/',
    'firebase.googleapis.com',
    'firestore.googleapis.com'
];

/**
 * Verifica se uma URL deve ser cacheada
 * @param {string} url - URL a ser verificada
 * @returns {boolean} Se a URL deve ser cacheada
 */
function shouldCache(url) {
    return !NO_CACHE_URLS.some(nocacheUrl => url.includes(nocacheUrl));
}

/**
 * Evento de instalação do Service Worker
 * Pré-cacheia recursos essenciais
 */
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('📦 Service Worker: Pré-cacheando recursos');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Pré-cache concluído');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ Service Worker: Erro no pré-cache:', error);
            })
    );
});

/**
 * Evento de ativação do Service Worker
 * Limpa caches antigos
 */
self.addEventListener('activate', event => {
    console.log('🔧 Service Worker: Ativando...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== CACHE_NAME)
                        .map(cacheName => {
                            console.log(`🗑️ Service Worker: Removendo cache antigo ${cacheName}`);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Ativado e controlando a página');
                return self.clients.claim();
            })
    );
});

/**
 * Evento de fetch
 * Implementa estratégia de cache com fallback para rede
 */
self.addEventListener('fetch', event => {
    // Ignorar requisições que não devem ser cacheadas
    if (!shouldCache(event.request.url)) {
        return;
    }
    
    // Estratégia: Cache First, falling back to Network
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('📦 Service Worker: Retornando do cache:', event.request.url);
                    return cachedResponse;
                }
                
                console.log('🌐 Service Worker: Buscando na rede:', event.request.url);
                return fetch(event.request)
                    .then(response => {
                        // Não cachear respostas com erro
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar a resposta para poder armazená-la no cache
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                console.log('📦 Service Worker: Cacheando novo recurso:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(error => {
                        console.error('❌ Service Worker: Erro de fetch:', error);
                        
                        // Para páginas HTML, retornar página offline
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        
                        return new Response('Erro de conexão. Verifique sua internet.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

/**
 * Evento de sincronização em segundo plano
 * Processa operações pendentes quando a conexão é restaurada
 */
self.addEventListener('sync', event => {
    console.log('🔄 Service Worker: Evento de sincronização:', event.tag);
    
    if (event.tag === 'sync-pending-operations') {
        event.waitUntil(syncPendingOperations());
    }
});

/**
 * Sincroniza operações pendentes
 * @returns {Promise} Promise que resolve quando a sincronização é concluída
 */
async function syncPendingOperations() {
    console.log('🔄 Service Worker: Sincronizando operações pendentes');
    
    try {
        // Aqui seria implementada a lógica para sincronizar operações pendentes
        // Por exemplo, enviar vendas realizadas offline para o servidor
        
        console.log('✅ Service Worker: Sincronização concluída');
    } catch (error) {
        console.error('❌ Service Worker: Erro na sincronização:', error);
    }
}

/**
 * Evento de notificação push
 * Exibe notificações push recebidas
 */
self.addEventListener('push', event => {
    console.log('📬 Service Worker: Notificação push recebida');
    
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-96x96.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * Evento de clique em notificação
 * Abre a URL associada à notificação
 */
self.addEventListener('notificationclick', event => {
    console.log('🖱️ Service Worker: Clique em notificação');
    
    event.notification.close();
    
    const url = event.notification.data.url;
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then(windowClients => {
                // Verificar se já há uma janela aberta e focar nela
                for (const client of windowClients) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Se não houver janela aberta, abrir uma nova
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

