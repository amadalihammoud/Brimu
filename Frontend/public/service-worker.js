/**
 * Brimu Service Worker - PWA com estratégias inteligentes de cache
 * Versão: 1.0.0
 */

const CACHE_NAME = 'brimu-v1.0.0';
const CACHE_STATIC = 'brimu-static-v1.0.0';
const CACHE_DYNAMIC = 'brimu-dynamic-v1.0.0';
const CACHE_IMAGES = 'brimu-images-v1.0.0';

// URLs para cache inicial (recursos críticos)
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Padrões de URLs para diferentes estratégias
const CACHE_STRATEGIES = {
  // Cache First - Recursos estáticos que raramente mudam
  CACHE_FIRST: [
    /^.*\.(css|js|woff|woff2|ttf|eot)$/,
    /^.*\/icons\/.*\.(png|jpg|jpeg|svg|ico)$/,
    /^.*\/images\/.*\.(png|jpg|jpeg|webp|svg)$/
  ],
  
  // Network First - HTML e dados dinâmicos
  NETWORK_FIRST: [
    /^.*\.(html)$/,
    /^.*\/api\//,
    /^.*\/#/
  ],
  
  // Stale While Revalidate - Recursos que podem estar desatualizados
  STALE_WHILE_REVALIDATE: [
    /^.*\/fonts\.googleapis\.com/,
    /^.*\/fonts\.gstatic\.com/
  ]
};

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('📦 Service Worker: Fazendo cache dos recursos estáticos');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída');
        // Força o SW a se tornar ativo imediatamente
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Erro na instalação do Service Worker:', error);
      })
  );
});

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    // Limpar caches antigos
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_STATIC && 
                     cacheName !== CACHE_DYNAMIC && 
                     cacheName !== CACHE_IMAGES &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída');
        // Toma controle de todas as páginas abertas
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Erro na ativação do Service Worker:', error);
      })
  );
});

/**
 * Interceptação de requisições
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Ignorar requisições para outros domínios (exceto fonts)
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // Determinar estratégia de cache
  const strategy = getCacheStrategy(request.url);
  
  switch (strategy) {
    case 'CACHE_FIRST':
      event.respondWith(handleCacheFirst(request));
      break;
    case 'NETWORK_FIRST':
      event.respondWith(handleNetworkFirst(request));
      break;
    case 'STALE_WHILE_REVALIDATE':
      event.respondWith(handleStaleWhileRevalidate(request));
      break;
    default:
      event.respondWith(handleNetworkFirst(request));
  }
});

/**
 * Determina a estratégia de cache baseada na URL
 */
function getCacheStrategy(url) {
  // Cache First para recursos estáticos
  if (CACHE_STRATEGIES.CACHE_FIRST.some(pattern => pattern.test(url))) {
    return 'CACHE_FIRST';
  }
  
  // Network First para conteúdo dinâmico
  if (CACHE_STRATEGIES.NETWORK_FIRST.some(pattern => pattern.test(url))) {
    return 'NETWORK_FIRST';
  }
  
  // Stale While Revalidate para fonts
  if (CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some(pattern => pattern.test(url))) {
    return 'STALE_WHILE_REVALIDATE';
  }
  
  return 'NETWORK_FIRST';
}

/**
 * Estratégia Cache First
 */
async function handleCacheFirst(request) {
  const cacheName = request.url.includes('image') ? CACHE_IMAGES : CACHE_STATIC;
  
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Cache First falhou:', error);
    return createOfflineResponse(request);
  }
}

/**
 * Estratégia Network First
 */
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('Network First falhou, tentando cache:', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return createOfflineResponse(request);
  }
}

/**
 * Estratégia Stale While Revalidate
 */
async function handleStaleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_STATIC);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Cria resposta offline customizada
 */
function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  // Para navegação HTML, retornar página offline
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    return new Response(
      `<!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Brimu - Offline</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #2d5a3d 0%, #1f3d2a 100%);
              color: white;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .offline-container {
              text-align: center;
              max-width: 500px;
              padding: 2rem;
            }
            .offline-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .offline-title {
              font-size: 2rem;
              margin-bottom: 1rem;
              color: #f0f9f4;
            }
            .offline-message {
              font-size: 1.1rem;
              margin-bottom: 2rem;
              color: #dcf2e3;
              line-height: 1.6;
            }
            .offline-button {
              background: #22c55e;
              color: #0f1a13;
              padding: 12px 24px;
              border: none;
              border-radius: 8px;
              font-size: 1rem;
              cursor: pointer;
              font-weight: 600;
            }
            .offline-button:hover {
              background: #16a34a;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">🌳</div>
            <h1 class="offline-title">Brimu - Offline</h1>
            <p class="offline-message">
              Você está offline no momento. Verifique sua conexão com a internet e tente novamente.
              Nossos serviços de arborização estarão disponíveis quando você voltar a ficar online!
            </p>
            <button class="offline-button" onclick="window.location.reload()">
              Tentar Novamente
            </button>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
  
  // Para outros recursos, retornar erro 503
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'Recurso não disponível offline' 
    }), 
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

/**
 * Manipulação de mensagens do cliente
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_INFO':
      getCacheInfo().then((info) => {
        event.ports[0].postMessage({ type: 'CACHE_INFO', payload: info });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
      });
      break;
      
    case 'PREFETCH_RESOURCES':
      prefetchResources(payload.urls).then(() => {
        event.ports[0].postMessage({ type: 'PREFETCH_COMPLETE' });
      });
      break;
  }
});

/**
 * Obtém informações sobre o cache
 */
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const cacheInfo = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    cacheInfo[cacheName] = keys.length;
  }
  
  return cacheInfo;
}

/**
 * Limpa todos os caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  return Promise.all(deletePromises);
}

/**
 * Prefetch de recursos
 */
async function prefetchResources(urls) {
  const cache = await caches.open(CACHE_DYNAMIC);
  const prefetchPromises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response && response.status === 200) {
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn(`Prefetch falhou para ${url}:`, error);
    }
  });
  
  return Promise.all(prefetchPromises);
}

/**
 * Limpeza periódica de cache
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(performCacheCleanup());
  }
});

/**
 * Executa limpeza de cache
 */
async function performCacheCleanup() {
  const caches = await caches.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
  
  for (const cacheName of caches) {
    if (cacheName.includes('dynamic')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response.headers.get('date');
        
        if (dateHeader) {
          const cacheDate = new Date(dateHeader).getTime();
          if (now - cacheDate > maxAge) {
            await cache.delete(request);
            console.log('🗑️ Removido do cache:', request.url);
          }
        }
      }
    }
  }
}

console.log('🌳 Brimu Service Worker carregado - Versão', CACHE_NAME);