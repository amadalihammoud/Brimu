import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração de armazenamento para imagens
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/images';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuração de armazenamento para documentos
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/documents';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtros de arquivo
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype;

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas documentos são permitidos!'), false);
  }
};

// Configurações de upload
const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFilter
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: documentFilter
});

// Middleware para múltiplas imagens
const multipleImages = imageUpload.array('images', 10); // Máximo 10 imagens

// Middleware para múltiplos documentos
const multipleDocuments = documentUpload.array('documents', 5); // Máximo 5 documentos

module.exports = {
  imageUpload,
  documentUpload,
  multipleImages,
  multipleDocuments,
  imageStorage,
  documentStorage
};
