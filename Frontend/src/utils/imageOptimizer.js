import config from '../config';

// Configurações de otimização de imagem
const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  formats: ['webp', 'jpeg', 'png'],
  lazyLoadOffset: 100, // pixels antes de carregar
  placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q2FycmVnYW5kby4uLjwvdGV4dD48L3N2Zz4='
};

// Verificar suporte a WebP
const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Redimensionar imagem
const resizeImage = (file, maxWidth = IMAGE_CONFIG.maxWidth, maxHeight = IMAGE_CONFIG.maxHeight, quality = IMAGE_CONFIG.quality) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Erro ao redimensionar imagem'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

// Converter para WebP
const convertToWebP = (file, quality = IMAGE_CONFIG.quality) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Erro ao converter para WebP'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

// Otimizar imagem
export const optimizeImage = async (file, options = {}) => {
  const {
    maxWidth = IMAGE_CONFIG.maxWidth,
    maxHeight = IMAGE_CONFIG.maxHeight,
    quality = IMAGE_CONFIG.quality,
    format = 'auto'
  } = options;

  try {
    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo não é uma imagem');
    }

    // Verificar tamanho do arquivo
    if (file.size > config.upload?.maxFileSize) {
      throw new Error(`Arquivo muito grande. Máximo: ${config.upload.maxFileSize / 1024 / 1024}MB`);
    }

    let optimizedBlob;

    // Redimensionar se necessário
    const resizedBlob = await resizeImage(file, maxWidth, maxHeight, quality);

    // Converter formato se necessário
    if (format === 'webp' || (format === 'auto' && await supportsWebP())) {
      optimizedBlob = await convertToWebP(resizedBlob, quality);
    } else {
      optimizedBlob = resizedBlob;
    }

    // Criar novo arquivo
    const optimizedFile = new File([optimizedBlob], file.name, {
      type: optimizedBlob.type,
      lastModified: Date.now()
    });

    return {
      file: optimizedFile,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      compressionRatio: Math.round((1 - optimizedFile.size / file.size) * 100),
      format: optimizedFile.type
    };

  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    throw error;
  }
};

// Lazy loading de imagens
export class LazyImageLoader {
  constructor() {
    this.observer = null;
    this.images = new Set();
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: `${IMAGE_CONFIG.lazyLoadOffset}px`
        }
      );
    }
  }

  observe(img) {
    if (this.observer) {
      this.observer.observe(img);
      this.images.add(img);
    } else {
      // Fallback para navegadores sem IntersectionObserver
      this.loadImage(img);
    }
  }

  unobserve(img) {
    if (this.observer) {
      this.observer.unobserve(img);
      this.images.delete(img);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (!src) return;

    const image = new Image();
    image.onload = () => {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
    };
    image.onerror = () => {
      img.classList.add('error');
    };
    image.src = src;
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }
}

// Instância singleton do lazy loader
export const lazyImageLoader = new LazyImageLoader();

// Componente de imagem otimizada
export const OptimizedImage = ({ src, alt, className = '', lazy = true, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (lazy && imgRef.current) {
      lazyImageLoader.observe(imgRef.current);
    }

    return () => {
      if (lazy && imgRef.current) {
        lazyImageLoader.unobserve(imgRef.current);
      }
    };
  }, [lazy]);

  const handleLoad = () => {
    setLoaded(true);
  };

  const handleError = () => {
    setError(true);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Erro ao carregar imagem</span>
        </div>
      )}

      <img
        ref={imgRef}
        src={lazy ? undefined : src}
        data-src={lazy ? src : undefined}
        alt={alt}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${lazy ? 'lazy' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

// Gerar placeholder para imagem
export const generateImagePlaceholder = (width, height, text = '') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  // Fundo
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, width, height);
  
  // Texto
  if (text) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
  }
  
  return canvas.toDataURL();
};

// Verificar se imagem está em cache do navegador
export const isImageCached = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

// Pré-carregar imagens
export const preloadImages = (urls) => {
  return Promise.all(
    urls.map(url => 
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Erro ao carregar ${url}`));
        img.src = url;
      })
    )
  );
};

// Obter dimensões da imagem
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = () => reject(new Error('Erro ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
};

// Validar imagem
export const validateImage = (file) => {
  const errors = [];
  
  // Verificar tipo
  if (!file.type.startsWith('image/')) {
    errors.push('Arquivo deve ser uma imagem');
  }
  
  // Verificar tamanho
  if (file.size > config.upload?.maxFileSize) {
    errors.push(`Arquivo muito grande. Máximo: ${config.upload.maxFileSize / 1024 / 1024}MB`);
  }
  
  // Verificar formato
  const allowedTypes = config.upload?.allowedTypes || ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Formato não suportado. Permitidos: ${allowedTypes.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  optimizeImage,
  OptimizedImage,
  lazyImageLoader,
  generateImagePlaceholder,
  isImageCached,
  preloadImages,
  getImageDimensions,
  validateImage
};
