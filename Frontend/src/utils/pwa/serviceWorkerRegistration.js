/**
 * Service Worker Registration - Gerenciamento inteligente de PWA
 */

// Configurações do Service Worker
const SW_CONFIG = {
  swUrl: '/service-worker.js',
  scope: '/',
  updateCheckInterval: 60000, // 1 minuto
  enableAutoUpdate: true,
  enableNotifications: true
};

let registration = null;
let isUpdateAvailable = false;

/**
 * Registra o Service Worker
 * @param {Object} config - Configurações opcionais
 * @returns {Promise} Promise do registro
 */
export async function registerSW(config = {}) {
  const finalConfig = { ...SW_CONFIG, ...config };
  
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não é suportado neste navegador');
    return null;
  }

  try {
    registration = await navigator.serviceWorker.register(
      finalConfig.swUrl,
      { scope: finalConfig.scope }
    );

    console.log('✅ Service Worker registrado:', registration.scope);

    // Configurar listeners
    setupEventListeners(finalConfig);
    
    // Verificar atualizações periodicamente
    if (finalConfig.enableAutoUpdate) {
      setupAutoUpdate(finalConfig.updateCheckInterval);
    }

    return registration;
  } catch (error) {
    console.error('❌ Falha ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Configura event listeners do Service Worker
 */
function setupEventListeners(config) {
  if (!registration) return;

  // Listener para novo Service Worker instalado
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    console.log('🔄 Nova versão do Service Worker encontrada');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // Nova versão disponível
          isUpdateAvailable = true;
          handleUpdateAvailable();
        } else {
          // Service Worker instalado pela primeira vez
          console.log('🎉 PWA instalada e pronta para uso offline!');
          if (config.enableNotifications) {
            showInstallNotification();
          }
        }
      }
    });
  });

  // Listener para quando o Service Worker controla a página
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker ativado, recarregando página...');
    window.location.reload();
  });

  // Listener para mensagens do Service Worker
  navigator.serviceWorker.addEventListener('message', handleSWMessage);
}

/**
 * Configura verificação automática de atualizações
 */
function setupAutoUpdate(interval) {
  setInterval(() => {
    if (registration) {
      registration.update();
    }
  }, interval);
}

/**
 * Lida com atualização disponível
 */
function handleUpdateAvailable() {
  console.log('🆕 Atualização disponível');
  
  // Dispatch evento customizado
  window.dispatchEvent(new CustomEvent('swUpdateAvailable', {
    detail: { registration }
  }));
  
  // Mostrar notificação se habilitado
  showUpdateNotification();
}

/**
 * Aplica atualização do Service Worker
 */
export function applyUpdate() {
  if (!registration || !registration.waiting) {
    return;
  }

  // Enviar mensagem para o SW pular a espera
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Obtém informações do cache
 */
export async function getCacheInfo() {
  if (!registration || !registration.active) {
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'CACHE_INFO') {
        resolve(event.data.payload);
      }
    };

    registration.active.postMessage(
      { type: 'GET_CACHE_INFO' },
      [messageChannel.port2]
    );
  });
}

/**
 * Limpa todos os caches
 */
export async function clearAllCaches() {
  if (!registration || !registration.active) {
    return false;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'CACHE_CLEARED') {
        resolve(true);
      }
    };

    registration.active.postMessage(
      { type: 'CLEAR_CACHE' },
      [messageChannel.port2]
    );
  });
}

/**
 * Prefetch de recursos
 */
export async function prefetchResources(urls) {
  if (!registration || !registration.active) {
    return false;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      if (event.data.type === 'PREFETCH_COMPLETE') {
        resolve(true);
      }
    };

    registration.active.postMessage(
      { type: 'PREFETCH_RESOURCES', payload: { urls } },
      [messageChannel.port2]
    );
  });
}

/**
 * Lida com mensagens do Service Worker
 */
function handleSWMessage(event) {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CACHE_UPDATE':
      console.log('📦 Cache atualizado:', payload);
      break;
    case 'OFFLINE_READY':
      console.log('📱 App pronto para uso offline');
      break;
    default:
      console.log('📨 Mensagem do SW:', event.data);
  }
}

/**
 * Mostra notificação de instalação
 */
function showInstallNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Brimu instalado!', {
      body: 'O app está pronto para uso offline. Você pode acessá-lo sem conexão à internet.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'brimu-installed'
    });
  }
}

/**
 * Mostra notificação de atualização
 */
function showUpdateNotification() {
  // Criar elemento de notificação customizada
  createUpdateBanner();
}

/**
 * Cria banner de atualização customizado
 */
function createUpdateBanner() {
  // Remove banner existente se houver
  const existingBanner = document.getElementById('sw-update-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  // Criar novo banner
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #2d5a3d;
      color: white;
      padding: 12px 16px;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 1.2rem;">🆕</span>
        <span>Nova versão disponível! Clique para atualizar.</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="applyBrimuUpdate()" style="
          background: #22c55e;
          color: #0f1a13;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
        ">
          Atualizar
        </button>
        <button onclick="dismissBrimuUpdate()" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        ">
          Depois
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Adicionar funções globais para os botões
  window.applyBrimuUpdate = () => {
    applyUpdate();
    banner.remove();
  };

  window.dismissBrimuUpdate = () => {
    banner.remove();
  };
}

/**
 * Desregistra o Service Worker
 */
export async function unregisterSW() {
  if ('serviceWorker' in navigator && registration) {
    try {
      const result = await registration.unregister();
      console.log('Service Worker desregistrado:', result);
      return result;
    } catch (error) {
      console.error('Erro ao desregistrar Service Worker:', error);
      return false;
    }
  }
  return false;
}

/**
 * Verifica se o app está sendo executado como PWA
 */
export function isPWA() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Verifica se o usuário está online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Configurar listeners de conectividade
 */
export function setupConnectivityListeners() {
  window.addEventListener('online', () => {
    console.log('🌐 Conectado à internet');
    window.dispatchEvent(new CustomEvent('networkStatusChange', {
      detail: { online: true }
    }));
  });

  window.addEventListener('offline', () => {
    console.log('📱 Modo offline');
    window.dispatchEvent(new CustomEvent('networkStatusChange', {
      detail: { online: false }
    }));
  });
}

export default {
  registerSW,
  applyUpdate,
  getCacheInfo,
  clearAllCaches,
  prefetchResources,
  unregisterSW,
  isPWA,
  isOnline,
  setupConnectivityListeners
};