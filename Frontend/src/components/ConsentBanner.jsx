import React, { useState, useEffect } from 'react';
import { updateConsent } from '../utils/analytics/gtag';

const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Sempre true, não pode ser desabilitado
    analytics: false,
    marketing: false,
    functional: false,
    personalization: false
  });

  // Verificar se o usuário já deu consentimento
  useEffect(() => {
    const consent = localStorage.getItem('brimu-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      try {
        const parsedConsent = JSON.parse(consent);
        setPreferences(parsedConsent);
        updateConsent(parsedConsent);
      } catch (error) {
        console.error('Erro ao parsear consentimento salvo:', error);
        setIsVisible(true);
      }
    }
  }, []);

  // Salvar consentimento
  const saveConsent = (consentData) => {
    localStorage.setItem('brimu-consent', JSON.stringify(consentData));
    localStorage.setItem('brimu-consent-date', new Date().toISOString());
    updateConsent(consentData);
    setIsVisible(false);
  };

  // Aceitar todos os cookies
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      personalization: true
    };
    saveConsent(allAccepted);
  };

  // Aceitar apenas necessários
  const acceptNecessary = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      personalization: false
    };
    saveConsent(onlyNecessary);
  };

  // Salvar preferências customizadas
  const savePreferences = () => {
    saveConsent(preferences);
  };

  // Atualizar preferência individual
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
      <div className="max-w-6xl mx-auto p-4">
        {!showDetails ? (
          // Banner simples
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-forest-800 mb-2">
                🍪 Cookies e Privacidade
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site e 
                personalizar conteúdo. Você pode escolher quais tipos de cookies aceitar.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 min-w-max">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-forest-600 border border-forest-600 rounded-lg hover:bg-forest-50 transition-colors text-sm font-medium"
              >
                Personalizar
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Apenas Necessários
              </button>
              <button
                onClick={acceptAll}
                className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        ) : (
          // Painel detalhado
          <div className="max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-forest-800">
                Configurações de Cookies
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Cookies Necessários */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-forest-700">Cookies Necessários</h4>
                    <p className="text-sm text-gray-600">
                      Essenciais para o funcionamento básico do site
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Sempre Ativo
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Incluem cookies de sessão, preferências de idioma e funcionalidades básicas de segurança.
                </p>
              </div>

              {/* Cookies de Analytics */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-forest-700">Analytics e Performance</h4>
                    <p className="text-sm text-gray-600">
                      Nos ajudam a entender como você usa o site
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => updatePreference('analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Google Analytics, Web Vitals e métricas de performance para melhorar nossos serviços.
                </p>
              </div>

              {/* Cookies de Marketing */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-forest-700">Marketing e Publicidade</h4>
                    <p className="text-sm text-gray-600">
                      Para personalizar anúncios e conteúdo
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => updatePreference('marketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Cookies de redes sociais e plataformas de publicidade para mostrar anúncios relevantes.
                </p>
              </div>

              {/* Cookies Funcionais */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-forest-700">Funcionalidades Avançadas</h4>
                    <p className="text-sm text-gray-600">
                      Melhoram a experiência e funcionalidades
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => updatePreference('functional', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Chat widgets, mapas interativos e outras funcionalidades que melhoram sua experiência.
                </p>
              </div>

              {/* Cookies de Personalização */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-forest-700">Personalização</h4>
                    <p className="text-sm text-gray-600">
                      Lembram suas preferências pessoais
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={(e) => updatePreference('personalization', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-forest-600"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Tema preferido, configurações de acessibilidade e outras preferências pessoais.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <a
                href="/privacy-policy"
                className="text-sm text-forest-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidade
              </a>
              
              <div className="flex gap-3">
                <button
                  onClick={acceptNecessary}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Apenas Necessários
                </button>
                <button
                  onClick={savePreferences}
                  className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 transition-colors text-sm font-medium"
                >
                  Salvar Preferências
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentBanner;