"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentStorage = exports.imageStorage = exports.multipleDocuments = exports.multipleImages = exports.documentUpload = exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuração de armazenamento para imagens
const imageStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/images';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.imageStorage = imageStorage;
// Configuração de armazenamento para documentos
const documentStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/documents';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.documentStorage = documentStorage;
// Filtros de arquivo
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
};
const documentFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype;
    if (extname) {
        return cb(null, true);
    }
    else {
        cb(new Error('Apenas documentos são permitidos!'), false);
    }
};
// Configurações de upload
const imageUpload = (0, multer_1.default)({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: imageFilter
});
exports.imageUpload = imageUpload;
const documentUpload = (0, multer_1.default)({
    storage: documentStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: documentFilter
});
exports.documentUpload = documentUpload;
// Middleware para múltiplas imagens
const multipleImages = imageUpload.array('images', 10); // Máximo 10 imagens
exports.multipleImages = multipleImages;
// Middleware para múltiplos documentos
const multipleDocuments = documentUpload.array('documents', 5); // Máximo 5 documentos
exports.multipleDocuments = multipleDocuments;
