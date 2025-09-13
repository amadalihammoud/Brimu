import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook personalizado para gerenciamento de SEO
 * @param {Object} seoData - Dados SEO da página
 * @returns {Object} Métodos e utilitários SEO
 */
const useSEO = (seoData = {}) => {
  const location = useLocation();
  
  const {
    title,
    description,
    keywords,
    image,
    noIndex = false,
    noFollow = false,
    canonical
  } = seoData;

  /**
   * Atualiza título da página
   */
  const updateTitle = (pageTitle) => {
    if (pageTitle) {
      document.title = `${pageTitle} | Brimu - Arborização e Paisagismo`;
    }
  };

  /**
   * Atualiza meta description
   */
  const updateDescription = (desc) => {
    if (desc) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = desc;
    }
  };

  /**
   * Atualiza meta keywords
   */
  const updateKeywords = (kw) => {
    if (kw) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = kw;
    }
  };

  /**
   * Atualiza robots meta tag
   */
  const updateRobots = (noIdx, noFol) => {
    let robotsContent = 'index, follow';
    
    if (noIdx && noFol) {
      robotsContent = 'noindex, nofollow';
    } else if (noIdx) {
      robotsContent = 'noindex, follow';
    } else if (noFol) {
      robotsContent = 'index, nofollow';
    }

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = robotsContent;
  };

  /**
   * Atualiza canonical URL
   */
  const updateCanonical = (canonicalUrl) => {
    const baseUrl = 'https://brimu-arborizacao.vercel.app';
    const fullUrl = canonicalUrl || `${baseUrl}${location.pathname}`;

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;
  };

  /**
   * Adiciona dados estruturados para página específica
   */
  const addStructuredData = (schema) => {
    const scriptId = 'page-structured-data';
    
    // Remove script anterior se existir
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Adiciona novo script
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  };

  /**
   * Configura Open Graph para página
   */
  const updateOpenGraph = (ogData) => {
    const baseUrl = 'https://brimu-arborizacao.vercel.app';
    
    const ogTags = {
      'og:title': ogData.title || title,
      'og:description': ogData.description || description,
      'og:image': ogData.image ? `${baseUrl}${ogData.image}` : `${baseUrl}/images/brimu-og-image.jpg`,
      'og:url': `${baseUrl}${location.pathname}`,
      'og:type': ogData.type || 'website'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.setAttribute('property', property);
          document.head.appendChild(metaTag);
        }
        metaTag.content = content;
      }
    });
  };

  /**
   * Configura Twitter Cards
   */
  const updateTwitterCards = (twitterData) => {
    const baseUrl = 'https://brimu-arborizacao.vercel.app';
    
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': twitterData.title || title,
      'twitter:description': twitterData.description || description,
      'twitter:image': twitterData.image ? `${baseUrl}${twitterData.image}` : `${baseUrl}/images/brimu-og-image.jpg`,
      'twitter:site': '@brimu_oficial'
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        let metaTag = document.querySelector(`meta[name="${name}"]`);
        if (!metaTag) {
          metaTag = document.createElement('meta');
          metaTag.name = name;
          document.head.appendChild(metaTag);
        }
        metaTag.content = content;
      }
    });
  };

  /**
   * Gera breadcrumb estruturado
   */
  const generateBreadcrumb = (items) => {
    const baseUrl = 'https://brimu-arborizacao.vercel.app';
    
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url ? `${baseUrl}${item.url}` : undefined
      }))
    };

    addStructuredData(breadcrumbSchema);
  };

  /**
   * Otimiza imagens para SEO
   */
  const optimizeImages = () => {
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      if (!img.alt) {
        const src = img.src;
        if (src.includes('tree') || src.includes('forest')) {
          img.alt = 'Serviços de arborização Brimu';
        } else if (src.includes('landscape') || src.includes('garden')) {
          img.alt = 'Paisagismo profissional Brimu';
        } else {
          img.alt = 'Brimu - Arborização e Paisagismo';
        }
      }
    });
  };

  // Efeitos para atualização automática
  useEffect(() => {
    updateTitle(title);
    updateDescription(description);
    updateKeywords(keywords);
    updateRobots(noIndex, noFollow);
    updateCanonical(canonical);
    optimizeImages();

    // Scroll to top em mudança de rota
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title, description, keywords, noIndex, noFollow, canonical, location.pathname]);

  return {
    updateTitle,
    updateDescription,
    updateKeywords,
    updateRobots,
    updateCanonical,
    addStructuredData,
    updateOpenGraph,
    updateTwitterCards,
    generateBreadcrumb,
    optimizeImages,
    currentPath: location.pathname
  };
};

export default useSEO;