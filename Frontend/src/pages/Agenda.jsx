import React, { useState } from 'react';
import { 
  FiCalendar, 
  FiPlus, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiPhone,
  FiEdit,
  FiTrash2,
  FiFilter
} from 'react-icons/fi';

const Agenda = () => {
  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      titulo: 'Poda de Árvores',
      cliente: 'Condomínio Jardins',
      data: '2025-09-05',
      hora: '08:00',
      endereco: 'Rua das Flores, 123',
      telefone: '(11) 99999-9999',
      status: 'agendado',
      observacoes: 'Poda de 5 árvores no jardim central'
    },
    {
      id: 2,
      titulo: 'Remoção de Árvore',
      cliente: 'Shopping Verde Plaza',
      data: '2025-09-06',
      hora: '14:00',
      endereco: 'Av. Comercial, 456',
      telefone: '(11) 88888-8888',
      status: 'confirmado',
      observacoes: 'Remoção de árvore seca no estacionamento'
    },
    {
      id: 3,
      titulo: 'Plantio de Mudas',
      cliente: 'Parque Municipal',
      data: '2025-09-07',
      hora: '09:30',
      endereco: 'Parque Central',
      telefone: '(11) 77777-7777',
      status: 'pendente',
      observacoes: 'Plantio de 20 mudas nativas'
    }
  ]);

  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const statusColors = {
    agendado: 'bg-blue-100 text-blue-800',
    confirmado: 'bg-green-100 text-green-800',
    pendente: 'bg-yellow-100 text-yellow-800',
    cancelado: 'bg-red-100 text-red-800',
    concluido: 'bg-gray-100 text-gray-800'
  };

  const agendamentosFiltrados = filtroStatus === 'todos' 
    ? agendamentos 
    : agendamentos.filter(ag => ag.status === filtroStatus);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <FiCalendar className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Filtros */}
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="todos">Todos os Status</option>
                <option value="agendado">Agendado</option>
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
                <option value="concluido">Concluído</option>
              </select>
              
              {/* Botão Novo Agendamento */}
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Novo Agendamento</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Agendamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agendamentosFiltrados.map((agendamento) => (
            <div key={agendamento.id} className="bg-white rounded-lg shadow p-6">
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {agendamento.titulo}
                  </h3>
                  <p className="text-sm text-gray-600">{agendamento.cliente}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[agendamento.status]}`}>
                  {agendamento.status}
                </span>
              </div>

              {/* Informações do Agendamento */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDate(agendamento.data)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{agendamento.hora}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{agendamento.endereco}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{agendamento.telefone}</span>
                </div>
              </div>

              {/* Observações */}
              {agendamento.observacoes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{agendamento.observacoes}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex justify-end space-x-2 mt-4">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <FiEdit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há agendamentos */}
        {agendamentosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum agendamento encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              {filtroStatus === 'todos' 
                ? 'Não há agendamentos cadastrados ainda.'
                : `Não há agendamentos com status "${filtroStatus}".`
              }
            </p>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Criar Primeiro Agendamento
            </button>
          </div>
        )}
      </div>

      {/* Modal de Novo Agendamento */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Novo Agendamento
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Serviço
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Ex: Poda de Árvores"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Endereço completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Observações adicionais..."
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Salvar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;
