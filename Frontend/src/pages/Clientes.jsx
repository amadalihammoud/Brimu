import React, { useState } from 'react';
import { 
  FiUsers, 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiPhone, 
  FiMail, 
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiFilter
} from 'react-icons/fi';

const Clientes = ({ theme }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    cpfCnpj: ''
  });
  
  const [clientes, setClientes] = useState([
    {
      id: 1,
      nome: 'Condomínio Jardins',
      tipo: 'Condomínio',
      email: 'contato@jardins.com.br',
      telefone: '(11) 99999-9999',
      endereco: 'Rua das Flores, 123 - Jardins',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      cnpj: '12.345.678/0001-90',
      dataCadastro: '2025-01-15',
      ultimoServico: '2025-08-20',
      totalServicos: 5,
      valorTotal: 15000,
      status: 'ativo'
    },
    {
      id: 2,
      nome: 'Shopping Verde Plaza',
      tipo: 'Shopping',
      email: 'gerencia@verdeplaza.com.br',
      telefone: '(11) 88888-8888',
      endereco: 'Av. Comercial, 456 - Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      cnpj: '98.765.432/0001-10',
      dataCadastro: '2025-02-10',
      ultimoServico: '2025-08-25',
      totalServicos: 3,
      valorTotal: 8500,
      status: 'ativo'
    },
    {
      id: 3,
      nome: 'Parque Municipal',
      tipo: 'Órgão Público',
      email: 'parque@municipio.gov.br',
      telefone: '(11) 77777-7777',
      endereco: 'Parque Central',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      cnpj: '11.222.333/0001-44',
      dataCadastro: '2025-03-05',
      ultimoServico: '2025-07-15',
      totalServicos: 2,
      valorTotal: 3200,
      status: 'inativo'
    },
    {
      id: 4,
      nome: 'João Silva',
      tipo: 'Pessoa Física',
      email: 'joao.silva@email.com',
      telefone: '(11) 66666-6666',
      endereco: 'Rua Residencial, 789',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      cpf: '123.456.789-00',
      dataCadastro: '2025-04-20',
      ultimoServico: '2025-08-10',
      totalServicos: 1,
      valorTotal: 800,
      status: 'ativo'
    }
  ]);

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);

  const tiposCliente = ['todos', 'Pessoa Física', 'Condomínio', 'Shopping', 'Órgão Público', 'Empresa'];
  const statusCliente = ['todos', 'ativo', 'inativo'];

  const clientesFiltrados = clientes.filter(cliente => {
    const matchTipo = filtroTipo === 'todos' || cliente.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus;
    const matchBusca = busca === '' || 
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.telefone.includes(busca);
    
    return matchTipo && matchStatus && matchBusca;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    return status === 'ativo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditarCliente = (cliente) => {
    setClienteEditando(cliente);
    setFormData({
      nome: cliente.nome,
      tipo: cliente.tipo,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco || '',
      cidade: cliente.cidade || '',
      estado: cliente.estado || '',
      cep: cliente.cep || '',
      cpfCnpj: cliente.cnpj || cliente.cpf || ''
    });
    setMostrarFormulario(true);
  };

  const handleDeletarCliente = (clienteId) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClientes(prev => prev.filter(cliente => cliente.id !== clienteId));
      alert('Cliente excluído com sucesso!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Operação de cliente iniciada
    
    try {
      if (clienteEditando) {
        // EDITAR CLIENTE EXISTENTE
        const clienteAtualizado = {
          ...clienteEditando,
          ...formData,
          cnpj: formData.cpfCnpj,
          cpf: formData.cpfCnpj
        };

        setClientes(prev => prev.map(cliente => 
          cliente.id === clienteEditando.id ? clienteAtualizado : cliente
        ));
        
        alert('Cliente atualizado com sucesso!');
      } else {
        // CRIAR NOVO CLIENTE
        const novoCliente = {
          id: Date.now(),
          ...formData,
          dataCadastro: new Date().toISOString().split('T')[0],
          ultimoServico: null,
          totalServicos: 0,
          valorTotal: 0,
          status: 'ativo',
          cnpj: formData.cpfCnpj,
          cpf: formData.cpfCnpj
        };

        // Criar usuário automaticamente
        const novoUsuario = {
          name: formData.nome,
          email: formData.email,
          password: formData.telefone.replace(/\D/g, ''), // Remove caracteres não numéricos
          role: 'client',
          clientId: novoCliente.id
        };

        // Criar usuário no backend
        // Criando usuário no backend
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(novoUsuario)
        });

        // Resposta do backend recebida
        
        if (response.ok) {
          const userData = await response.json();
          // Usuário criado com sucesso
          
          // Adicionar cliente à lista
          setClientes(prev => [...prev, novoCliente]);
          
          // Mostrar alerta com credenciais
          alert(`Cliente cadastrado com sucesso!\n\nLogin criado automaticamente:\nEmail: ${formData.email}\nSenha: ${formData.telefone.replace(/\D/g, '')}`);
        } else {
          const errorData = await response.json();
          // Erro do backend
          throw new Error(errorData.message || 'Erro ao criar usuário');
        }
      }
      
      // Limpar formulário e fechar modal
      setFormData({
        nome: '',
        tipo: '',
        email: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        cpfCnpj: ''
      });
      setClienteEditando(null);
      setMostrarFormulario(false);
      
    } catch (error) {
      console.error('Erro ao processar cliente:', error);
      alert('Erro ao processar cliente: ' + error.message);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FiUsers className="w-6 h-6 text-green-600" />
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Clientes</h1>
              <span className={`${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} px-2 py-1 rounded-full text-sm`}>
                {clientesFiltrados.length} cliente(s)
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Busca */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg text-sm ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
              
              {/* Filtros */}
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {tiposCliente.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo === 'todos' ? 'Todos os Tipos' : tipo}
                  </option>
                ))}
              </select>
              
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={`border rounded-lg px-3 py-2 text-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {statusCliente.map(status => (
                  <option key={status} value={status}>
                    {status === 'todos' ? 'Todos os Status' : status}
                  </option>
                ))}
              </select>
              
              {/* Botão Novo Cliente */}
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {cliente.nome}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{cliente.tipo}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cliente.status)}`}>
                  {cliente.status}
                </span>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <FiMail className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{cliente.email}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiPhone className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{cliente.telefone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiMapPin className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {cliente.endereco}, {cliente.cidade}/{cliente.estado}
                  </span>
                </div>
              </div>

              {/* Informações de Negócio */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <div className="flex items-center justify-center mb-1">
                    <FiCalendar className="w-4 h-4 text-blue-600 mr-1" />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Serviços</span>
                  </div>
                  <p className="text-lg font-bold text-blue-600">{cliente.totalServicos}</p>
                </div>
                
                <div className={`text-center p-3 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                  <div className="flex items-center justify-center mb-1">
                    <FiDollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Valor Total</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(cliente.valorTotal)}
                  </p>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} space-y-1 mb-4`}>
                <p>Cadastrado em: {formatDate(cliente.dataCadastro)}</p>
                <p>Último serviço: {formatDate(cliente.ultimoServico)}</p>
                {cliente.cnpj && <p>CNPJ: {cliente.cnpj}</p>}
                {cliente.cpf && <p>CPF: {cliente.cpf}</p>}
              </div>

              {/* Ações */}
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => handleEditarCliente(cliente)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Editar cliente"
                >
                  <FiEdit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeletarCliente(cliente.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Excluir cliente"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há clientes */}
        {clientesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cliente encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
                ? 'Nenhum cliente corresponde aos filtros aplicados.'
                : 'Não há clientes cadastrados ainda.'
              }
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Cadastrar Primeiro Cliente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Novo Cliente */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              {clienteEditando ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Nome/Razão Social *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Tipo *
                  </label>
                  <select 
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Pessoa Física">Pessoa Física</option>
                    <option value="Condomínio">Condomínio</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Órgão Público">Órgão Público</option>
                    <option value="Empresa">Empresa</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Telefone * (será a senha inicial)
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    required
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                                      className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="Endereço completo"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Cidade"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Estado
                  </label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="SP"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="01234-567"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  name="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={handleInputChange}
                                      className={`w-full border rounded-lg px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  placeholder="123.456.789-00 ou 12.345.678/0001-90"
                />
              </div>
              
              {!clienteEditando && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Login automático será criado:</strong><br/>
                    Email: {formData.email || 'email@exemplo.com'}<br/>
                    Senha inicial: {formData.telefone || 'telefone cadastrado'}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  {clienteEditando ? 'Atualizar Cliente' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
