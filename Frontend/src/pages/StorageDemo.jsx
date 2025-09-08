import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import FileManager from '../components/FileManager';
import BackupManager from '../components/BackupManager';

const StorageDemo = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    // Arquivos enviados
  };

  const handleFileSelect = (file) => {
    // Arquivo selecionado
  };

  const handleFileEdit = (file) => {
    // Editar arquivo
  };

  const handleFileDelete = (fileId) => {
    // Arquivo deletado
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const tabs = [
    { id: 'upload', label: 'Upload de Arquivos', icon: '📤' },
    { id: 'manage', label: 'Gerenciar Arquivos', icon: '📁' },
    { id: 'backup', label: 'Backups', icon: '💾' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🗂️ Sistema de Armazenamento Brimu
          </h1>
          <p className="mt-2 text-gray-600">
            Sistema completo de gerenciamento de arquivos com upload, organização e backup automático
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="space-y-6">
          {/* Tab Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload de Imagens */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    📸 Upload de Imagens
                  </h3>
                  <FileUpload
                    onUpload={handleUpload}
                    multiple={true}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    maxFiles={10}
                    destination="images"
                  />
                </div>

                {/* Upload de Documentos */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    📄 Upload de Documentos
                  </h3>
                  <FileUpload
                    onUpload={handleUpload}
                    multiple={true}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                    maxSize={10 * 1024 * 1024}
                    maxFiles={5}
                    destination="documents"
                  />
                </div>
              </div>

              {/* Arquivos Enviados Recentemente */}
              {uploadedFiles.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    ✅ Arquivos Enviados Recentemente
                  </h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">✓</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.originalname}</p>
                            <p className="text-sm text-gray-500">
                              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Tamanho não disponível'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-green-600">
                          Enviado com sucesso
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Gerenciar */}
          {activeTab === 'manage' && (
            <div>
              <FileManager
                onFileSelect={handleFileSelect}
                onFileEdit={handleFileEdit}
                onFileDelete={handleFileDelete}
              />
            </div>
          )}

          {/* Tab Backup */}
          {activeTab === 'backup' && (
            <div>
              <BackupManager />
            </div>
          )}
        </div>

        {/* Informações do Sistema */}
        <div className="mt-12 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ℹ️ Informações do Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📤 Upload</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Imagens: até 5MB cada</li>
                <li>• Documentos: até 10MB cada</li>
                <li>• Múltiplos arquivos simultâneos</li>
                <li>• Validação automática de tipo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔒 Segurança</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Autenticação JWT obrigatória</li>
                <li>• Controle de permissões por usuário</li>
                <li>• Validação de tipos de arquivo</li>
                <li>• Rate limiting por IP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">💾 Backup</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Backup automático diário</li>
                <li>• Backup semanal e mensal</li>
                <li>• Compressão automática</li>
                <li>• Limpeza de backups antigos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDemo;
