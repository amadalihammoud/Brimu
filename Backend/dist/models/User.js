const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    // Informações básicas
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // Informações de perfil
    avatar: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        trim: true
    },
    // Controle de acesso
    role: {
        type: String,
        enum: ['admin', 'manager', 'employee', 'client'],
        default: 'employee'
    },
    permissions: {
        upload: {
            type: Boolean,
            default: true
        },
        download: {
            type: Boolean,
            default: true
        },
        delete: {
            type: Boolean,
            default: false
        },
        manageUsers: {
            type: Boolean,
            default: false
        },
        manageFiles: {
            type: Boolean,
            default: false
        },
        viewAnalytics: {
            type: Boolean,
            default: false
        }
    },
    // Configurações de upload
    uploadSettings: {
        maxFileSize: {
            type: Number,
            default: 10 * 1024 * 1024 // 10MB
        },
        maxFilesPerUpload: {
            type: Number,
            default: 10
        },
        allowedFileTypes: [{
                type: String
            }],
        autoCompressImages: {
            type: Boolean,
            default: true
        },
        createThumbnails: {
            type: Boolean,
            default: true
        }
    },
    // Status da conta
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    },
    // Configurações de notificação
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        uploadComplete: {
            type: Boolean,
            default: true
        },
        downloadAlert: {
            type: Boolean,
            default: false
        },
        systemUpdates: {
            type: Boolean,
            default: true
        }
    },
    // Estatísticas
    stats: {
        totalUploads: {
            type: Number,
            default: 0
        },
        totalDownloads: {
            type: Number,
            default: 0
        },
        totalStorageUsed: {
            type: Number,
            default: 0
        },
        lastUploadDate: {
            type: Date,
            default: null
        }
    },
    // Configurações de segurança
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: {
            type: String,
            default: null
        },
        passwordResetToken: {
            type: String,
            default: null
        },
        passwordResetExpires: {
            type: Date,
            default: null
        },
        emailVerificationToken: {
            type: String,
            default: null
        },
        emailVerificationExpires: {
            type: Date,
            default: null
        }
    },
    // Metadados
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.security.twoFactorSecret;
            delete ret.security.passwordResetToken;
            delete ret.security.emailVerificationToken;
            return ret;
        }
    },
    toObject: { virtuals: true }
});
// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
// Virtual para nome completo
userSchema.virtual('fullName').get(function () {
    return this.name;
});
// Virtual para storage usado formatado
userSchema.virtual('formattedStorageUsed').get(function () {
    const bytes = this.stats.totalStorageUsed;
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});
// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Método para comparar senhas
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
// Método para verificar permissão
userSchema.methods.hasPermission = function (permission) {
    if (this.role === 'admin')
        return true;
    return this.permissions[permission] === true;
};
// Método para verificar se pode fazer upload
userSchema.methods.canUpload = function (fileSize, fileCount) {
    if (!this.hasPermission('upload'))
        return false;
    if (fileSize > this.uploadSettings.maxFileSize)
        return false;
    if (fileCount > this.uploadSettings.maxFilesPerUpload)
        return false;
    return true;
};
// Método para atualizar estatísticas
userSchema.methods.updateStats = function (type, value) {
    switch (type) {
        case 'upload':
            this.stats.totalUploads += 1;
            this.stats.totalStorageUsed += value;
            this.stats.lastUploadDate = new Date();
            break;
        case 'download':
            this.stats.totalDownloads += 1;
            break;
    }
    return this.save();
};
// Método para gerar token de reset de senha
userSchema.methods.generatePasswordResetToken = function () {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.security.passwordResetToken = token;
    this.security.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    return token;
};
// Método para gerar token de verificação de email
userSchema.methods.generateEmailVerificationToken = function () {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    this.security.emailVerificationToken = token;
    this.security.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
    return token;
};
// Método estático para buscar usuários por role
userSchema.statics.findByRole = function (role) {
    return this.find({ role, isActive: true })
        .select('-password -security')
        .sort({ name: 1 });
};
// Método estático para buscar usuários ativos
userSchema.statics.findActive = function () {
    return this.find({ isActive: true })
        .select('-password -security')
        .sort({ name: 1 });
};
// Método estático para estatísticas gerais
userSchema.statics.getStats = async function () {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                },
                totalStorage: { $sum: '$stats.totalStorageUsed' },
                totalUploads: { $sum: '$stats.totalUploads' },
                totalDownloads: { $sum: '$stats.totalDownloads' }
            }
        }
    ]);
    return stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        totalStorage: 0,
        totalUploads: 0,
        totalDownloads: 0
    };
};
module.exports = mongoose.model('User', userSchema);
