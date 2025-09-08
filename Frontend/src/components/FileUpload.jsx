import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiImage, FiDownload, FiEye } from 'react-icons/fi';

const FileUpload = ({ 
  files = [], 
  onFilesChange, 
  maxFiles = 10, 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt'],
  className = '',
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const processFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];

    newFiles.forEach(file => {
      // Verificar tamanho
      if (file.size > maxSize) {
        errors.push(`${file.name}: Arquivo muito grande (máximo ${formatFileSize(maxSize)})`);
        return;
      }

      // Verificar tipo
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isValidType) {
        errors.push(`${file.name}: Tipo de arquivo não permitido`);
        return;
      }

      // Verificar limite de arquivos
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Máximo de ${maxFiles} arquivos permitidos`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Erros encontrados:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles.map(file => ({
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploaded: false
      }))];
      onFilesChange(updatedFiles);
    }
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <FiImage className="w-5 h-5 text-blue-500" />;
    }
    return <FiFile className="w-5 h-5 text-gray-500" />;
  };

  const openFile = (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200
          ${dragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-2">
          <FiUpload className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-blue-600 dark:text-blue-400">
              Clique para selecionar
            </span>
            {' '}ou arraste arquivos aqui
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Máximo {maxFiles} arquivos, até {formatFileSize(maxSize)} cada
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            Tipos permitidos: Imagens, PDF, DOC, DOCX, TXT
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Arquivos Anexados ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.type.startsWith('image/') && (
                    <button
                      onClick={() => openFile(file)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Visualizar"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => openFile(file)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Baixar"
                  >
                    <FiDownload className="w-4 h-4" />
                  </button>
                  
                  {!disabled && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remover"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;