// Configurações de upload para o frontend
export const UPLOAD_CONFIG = {
  // URLs da API
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Endpoints
  ENDPOINTS: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
    DOCUMENT: '/upload/document',
    DOCUMENTS: '/upload/documents',
    FILES: '/upload/files',
    DELETE: '/upload/file',
    RESIZE: '/upload/resize-image',
    THUMBNAIL: '/upload/thumbnail',
    CLEANUP: '/upload/cleanup-temp',
    DISK_SPACE: '/upload/disk-space'
  },
  
  // Limites de arquivo
  LIMITS: {
    IMAGE: {
      MAX_SIZE: 5 * 1024 * 1024, // 5MB
      MAX_FILES: 10,
      ACCEPTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      ACCEPTED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    },
    DOCUMENT: {
      MAX_SIZE: 10 * 1024 * 1024, // 10MB
      MAX_FILES: 5,
      ACCEPTED_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain'
      ],
      ACCEPTED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt']
    }
  },
  
  // Configurações de imagem
  IMAGE: {
    THUMBNAIL_SIZE: 150,
    PREVIEW_SIZE: 800,
    QUALITY: 80,
    FORMAT: 'jpeg'
  },
  
  // Configurações de upload
  UPLOAD: {
    CHUNK_SIZE: 1024 * 1024, // 1MB por chunk
    RETRY_ATTEMPTS: 3,
    TIMEOUT: 30000, // 30 segundos
    SHOW_PROGRESS: true
  }
};

// Função para obter URL completa da API
export const getApiUrl = (endpoint) => {
  return `${UPLOAD_CONFIG.API_BASE_URL}${endpoint}`;
};

// Função para validar tipo de arquivo
export const validateFileType = (file, type) => {
  const config = UPLOAD_CONFIG.LIMITS[type.toUpperCase()];
  if (!config) return false;
  
  return config.ACCEPTED_TYPES.includes(file.type) ||
         config.ACCEPTED_EXTENSIONS.some(ext => 
           file.name.toLowerCase().endsWith(ext)
         );
};

// Função para validar tamanho do arquivo
export const validateFileSize = (file, type) => {
  const config = UPLOAD_CONFIG.LIMITS[type.toUpperCase()];
  if (!config) return false;
  
  return file.size <= config.MAX_SIZE;
};

// Função para formatar tamanho do arquivo
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Função para obter ícone baseado no tipo de arquivo
export const getFileIcon = (file) => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.includes('pdf')) {
    return 'pdf';
  } else if (file.type.includes('word') || file.type.includes('document')) {
    return 'document';
  } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
    return 'spreadsheet';
  } else if (file.type.includes('text')) {
    return 'text';
  } else {
    return 'file';
  }
};

// Função para criar preview de imagem
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Arquivo não é uma imagem'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

// Função para comprimir imagem antes do upload
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = UPLOAD_CONFIG.IMAGE.PREVIEW_SIZE,
      maxHeight = UPLOAD_CONFIG.IMAGE.PREVIEW_SIZE,
      quality = UPLOAD_CONFIG.IMAGE.QUALITY,
      format = UPLOAD_CONFIG.IMAGE.FORMAT
    } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converter para blob
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        `image/${format}`,
        quality / 100
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export default UPLOAD_CONFIG;
