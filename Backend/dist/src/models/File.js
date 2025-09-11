"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fileSchema = new mongoose_1.default.Schema({
    // Informações básicas do arquivo
    filename: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true,
        trim: true
    },
    size: {
        type: Number,
        required: true,
        min: 0
    },
    mimetype: {
        type: String,
        required: true
    },
    extension: {
        type: String,
        required: true,
        lowercase: true
    },
    // Categorização
    category: {
        type: String,
        enum: ['image', 'document', 'video', 'other'],
        required: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    // Metadados de imagem (se aplicável)
    imageMetadata: {
        width: Number,
        height: Number,
        format: String,
        hasThumbnail: {
            type: Boolean,
            default: false
        },
        thumbnailPath: String,
        colors: [String], // Cores dominantes
        exif: mongoose_1.default.Schema.Types.Mixed
    },
    // Metadados de documento (se aplicável)
    documentMetadata: {
        pageCount: Number,
        author: String,
        title: String,
        subject: String,
        keywords: [String],
        language: String,
        createdDate: Date,
        modifiedDate: Date
    },
    // Informações de upload
    uploadedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    // Controle de acesso
    isPublic: {
        type: Boolean,
        default: false
    },
    permissions: {
        read: [{
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }],
        write: [{
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }],
        delete: [{
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User'
            }]
    },
    // Tags e organização
    tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    // Estatísticas
    downloadCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    },
    // Controle de versão
    version: {
        type: Number,
        default: 1
    },
    parentFile: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'File'
    },
    isVersion: {
        type: Boolean,
        default: false
    },
    // Status e controle
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted', 'processing'],
        default: 'active'
    },
    isBackedUp: {
        type: Boolean,
        default: false
    },
    backupDate: Date,
    backupPath: String,
    // Checksum para integridade
    checksum: {
        type: String,
        required: true
    },
    // Metadados adicionais
    metadata: {
        type: mongoose_1.default.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Índices para performance
fileSchema.index({ filename: 1 });
fileSchema.index({ originalName: 1 });
fileSchema.index({ category: 1, subcategory: 1 });
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ uploadDate: -1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ isPublic: 1 });
fileSchema.index({ 'imageMetadata.format': 1 });
fileSchema.index({ 'documentMetadata.author': 1 });
// Virtual para URL do arquivo
fileSchema.virtual('url').get(function () {
    return `/uploads/${this.category}s/${this.filename}`;
});
// Virtual para URL do thumbnail
fileSchema.virtual('thumbnailUrl').get(function () {
    if (this.category === 'image' && this.imageMetadata.hasThumbnail) {
        return `/uploads/thumbnails/${this.filename}`;
    }
    return null;
});
// Virtual para tamanho formatado
fileSchema.virtual('formattedSize').get(function () {
    const bytes = this.size;
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});
// Middleware para definir categoria baseada no mimetype
fileSchema.pre('save', function (next) {
    if (this.isNew) {
        if (this.mimetype.startsWith('image/')) {
            this.category = 'image';
        }
        else if (this.mimetype.startsWith('video/')) {
            this.category = 'video';
        }
        else if (this.mimetype.includes('pdf') ||
            this.mimetype.includes('document') ||
            this.mimetype.includes('text') ||
            this.mimetype.includes('spreadsheet')) {
            this.category = 'document';
        }
        else {
            this.category = 'other';
        }
        // Definir extensão
        this.extension = this.originalName.split('.').pop().toLowerCase();
    }
    next();
});
// Método para incrementar contador de downloads
fileSchema.methods.incrementDownload = function () {
    this.downloadCount += 1;
    this.lastAccessed = new Date();
    return this.save();
};
// Método para incrementar contador de visualizações
fileSchema.methods.incrementView = function () {
    this.viewCount += 1;
    this.lastAccessed = new Date();
    return this.save();
};
// Método para verificar permissões
fileSchema.methods.canAccess = function (userId, permission = 'read') {
    if (this.isPublic && permission === 'read') {
        return true;
    }
    if (this.uploadedBy.toString() === userId.toString()) {
        return true;
    }
    return this.permissions[permission].some(perm => perm.toString() === userId.toString());
};
// Método estático para buscar arquivos por categoria
fileSchema.statics.findByCategory = function (category, options = {}) {
    const query = { category, status: 'active' };
    if (options.userId) {
        query.$or = [
            { isPublic: true },
            { uploadedBy: options.userId },
            { 'permissions.read': options.userId }
        ];
    }
    return this.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ uploadDate: -1 })
        .limit(options.limit || 50);
};
// Método estático para buscar arquivos por tags
fileSchema.statics.findByTags = function (tags, options = {}) {
    const query = {
        tags: { $in: tags.map(tag => tag.toLowerCase()) },
        status: 'active'
    };
    if (options.userId) {
        query.$or = [
            { isPublic: true },
            { uploadedBy: options.userId },
            { 'permissions.read': options.userId }
        ];
    }
    return this.find(query)
        .populate('uploadedBy', 'name email')
        .sort({ uploadDate: -1 })
        .limit(options.limit || 50);
};
exports.default = mongoose_1.default.model('File', fileSchema);
