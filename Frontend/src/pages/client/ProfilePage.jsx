import React, { useState } from 'react';
import { 
  FiUser, 
  FiMail,
  FiPhone,
  FiMapPin,
  FiHome,
  FiEdit,
  FiSave,
  FiX,
  FiCamera,
  FiBell,
  FiShield,
  FiLock,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';

const ProfilePage = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dados-pessoais');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Dados mockados do cliente
  const [profileData, setProfileData] = useState({
    personal: {
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 99999-9999',
      cpf: '123.456.789-00',
      birthDate: '1985-03-15'
    },
    company: {
      name: 'Silva & Associados',
      cnpj: '12.345.678/0001-90',
      phone: '(11) 3333-4444',
      email: 'contato@silvaassociados.com',
      website: 'www.silvaassociados.com'
    },
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Jardim das Américas',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    notifications: {
      smsNotifications: true,
      siteAppNotifications: true,
      orderUpdates: true,
      paymentReminders: true
    }
  });

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // Aqui seria feita a chamada para API
    // Salvando dados do perfil
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Aqui seria feito o reset dos dados
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      setAvatarImage(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = async () => {
    if (avatarImage) {
      // Aqui seria feita a chamada para API para upload do avatar
      try {
        console.log('Salvando avatar:', avatarImage.name);
        // Simular upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Reset dos estados
        setAvatarImage(null);
        setAvatarPreview(null);
        
        alert('Avatar alterado com sucesso!');
      } catch (error) {
        alert('Erro ao alterar avatar. Tente novamente.');
        console.error('Erro ao salvar avatar:', error);
      }
    }
  };

  const handleAvatarCancel = () => {
    setAvatarImage(null);
    setAvatarPreview(null);
  };

  const renderPersonalData = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Dados Pessoais</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Editar
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
          <input
            type="text"
            value={profileData.personal.name}
            onChange={(e) => handleInputChange('personal', 'name', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
          <input
            type="email"
            value={profileData.personal.email}
            onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <input
            type="tel"
            value={profileData.personal.phone}
            onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
          <input
            type="text"
            value={profileData.personal.cpf}
            onChange={(e) => handleInputChange('personal', 'cpf', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
          <input
            type="date"
            value={profileData.personal.birthDate}
            onChange={(e) => handleInputChange('personal', 'birthDate', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );

  const renderCompanyData = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Dados da Empresa</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Editar
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
          <input
            type="text"
            value={profileData.company.name}
            onChange={(e) => handleInputChange('company', 'name', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ</label>
          <input
            type="text"
            value={profileData.company.cnpj}
            onChange={(e) => handleInputChange('company', 'cnpj', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone da Empresa</label>
          <input
            type="tel"
            value={profileData.company.phone}
            onChange={(e) => handleInputChange('company', 'phone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">E-mail da Empresa</label>
          <input
            type="email"
            value={profileData.company.email}
            onChange={(e) => handleInputChange('company', 'email', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={profileData.company.website}
            onChange={(e) => handleInputChange('company', 'website', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );

  const renderAddressData = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Endereço</h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiEdit className="w-4 h-4 mr-2" />
            Editar
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiSave className="w-4 h-4 mr-2" />
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FiX className="w-4 h-4 mr-2" />
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
          <input
            type="text"
            value={profileData.address.street}
            onChange={(e) => handleInputChange('address', 'street', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
          <input
            type="text"
            value={profileData.address.number}
            onChange={(e) => handleInputChange('address', 'number', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
          <input
            type="text"
            value={profileData.address.complement}
            onChange={(e) => handleInputChange('address', 'complement', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
          <input
            type="text"
            value={profileData.address.neighborhood}
            onChange={(e) => handleInputChange('address', 'neighborhood', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
          <input
            type="text"
            value={profileData.address.city}
            onChange={(e) => handleInputChange('address', 'city', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <input
            type="text"
            value={profileData.address.state}
            onChange={(e) => handleInputChange('address', 'state', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
          <input
            type="text"
            value={profileData.address.zipCode}
            onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Preferências de Notificação</h3>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiSave className="w-4 h-4 mr-2" />
          Salvar
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(profileData.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                {key === 'smsNotifications' && 'Notificações por SMS'}
                {key === 'siteAppNotifications' && 'Notificações via Site/App'}
                {key === 'orderUpdates' && 'Atualizações de Ordens'}
                {key === 'paymentReminders' && 'Lembretes de Pagamento'}
              </h4>
              <p className="text-sm text-gray-500">
                {key === 'smsNotifications' && 'Receba notificações importantes por SMS no seu celular'}
                {key === 'siteAppNotifications' && 'Receba notificações quando acessar o site ou aplicativo'}
                {key === 'orderUpdates' && 'Seja notificado sobre o progresso das suas ordens de serviço'}
                {key === 'paymentReminders' && 'Receba lembretes sobre pagamentos pendentes'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <FiBell className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-900">Canais de Notificação Disponíveis</h4>
            <p className="text-sm text-blue-700 mt-1">
              Para garantir que você receba todas as informações importantes, oferecemos notificações por SMS e via site/aplicativo. 
              Essas são as únicas formas de comunicação disponíveis no momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Segurança</h3>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Alterar Senha</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua nova senha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirme sua nova senha"
              />
            </div>

            <div className="flex items-end">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Alterar Senha
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
            </div>
          </div>
        </div>

        {/* Avatar e Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-12 h-12 text-green-600" />
                )}
              </div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer"
                title="Alterar foto do perfil"
              >
                <FiCamera className="w-4 h-4" />
              </label>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{profileData.personal.name}</h2>
                {avatarImage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAvatarSave}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiSave className="w-3 h-3 mr-1" />
                      Salvar
                    </button>
                    <button
                      onClick={handleAvatarCancel}
                      className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FiX className="w-3 h-3 mr-1" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600">{profileData.personal.email}</p>
              <p className="text-gray-500">{profileData.company.name}</p>
              {avatarImage && (
                <p className="text-xs text-blue-600 mt-2">
                  Nova imagem selecionada: {avatarImage.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Navegação por Seções */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setActiveSection('dados-pessoais')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'dados-pessoais' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => setActiveSection('empresa')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'empresa' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Empresa
            </button>
            <button
              onClick={() => setActiveSection('endereco')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'endereco' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Endereço
            </button>
            <button
              onClick={() => setActiveSection('notificacoes')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'notificacoes' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Notificações
            </button>
            <button
              onClick={() => setActiveSection('seguranca')}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'seguranca' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Segurança
            </button>
          </div>
        </div>

        {/* Conteúdo das Seções */}
        {activeSection === 'dados-pessoais' && renderPersonalData()}
        {activeSection === 'empresa' && renderCompanyData()}
        {activeSection === 'endereco' && renderAddressData()}
        {activeSection === 'notificacoes' && renderNotifications()}
        {activeSection === 'seguranca' && renderSecurity()}
      </div>
    </div>
  );
};

export default ProfilePage;
