import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Clock, CheckCircle, XCircle, AlertTriangle, CreditCard, DollarSign, TrendingUp, Trash2, Download, FileText } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';
import FileAttachment from '../../components/FileAttachment';
import FileUpload from '../../components/FileUpload';
import jsPDF from 'jspdf';

const PaymentsPage = ({ theme = 'light' }) => {
  // Estados
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    orderId: '',
    amount: 0,
    status: 'pendente',
    paymentMethod: 'PIX',
    dueDate: '',
    paidDate: '',
    attachments: []
  });
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: null
  });

  // Buscar pagamentos ao montar componente
  useEffect(() => {
    fetchPayments();
    // Mock de OS disponíveis para seleção no formulário
    setOrders([
      { id: 'ORD2024001', title: 'Poda de árvore - Jardim Paulista' },
      { id: 'ORD2024002', title: 'Remoção de árvore - Moema' },
      { id: 'ORD2024003', title: 'Plantio de mudas - Vila Mariana' },
      { id: 'ORD2024004', title: 'Manutenção - Pinheiros' }
    ]);
    // Mock de clientes existentes
    setClients([
      { id: 'CLI001', name: 'João Silva', email: 'joao@email.com' },
      { id: 'CLI002', name: 'Maria Santos', email: 'maria@email.com' },
      { id: 'CLI003', name: 'Pedro Oliveira', email: 'pedro@email.com' },
      { id: 'CLI004', name: 'Ana Costa', email: 'ana@email.com' }
    ]);
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Por enquanto, usar dados mockados
      setTimeout(() => {
        setPayments([
          {
            id: 'PAY2024001',
            client: { name: 'João Silva', email: 'joao@email.com' },
            orderId: 'ORD2024001',
            amount: 500,
            status: 'pago',
            paymentMethod: 'PIX',
            dueDate: '2024-03-15',
            paidDate: '2024-03-14',
            daysOverdue: 0,
            attachments: [
              {
                id: 1,
                name: 'comprovante_pix.pdf',
                size: 245760,
                type: 'application/pdf'
              },
              {
                id: 2,
                name: 'foto_servico.jpg',
                size: 1024000,
                type: 'image/jpeg'
              }
            ]
          },
          {
            id: 'PAY2024002',
            client: { name: 'Maria Santos', email: 'maria@email.com' },
            orderId: 'ORD2024002',
            amount: 1200,
            status: 'pendente',
            paymentMethod: 'Boleto',
            dueDate: '2024-03-18',
            paidDate: null,
            daysOverdue: 0,
            attachments: [
              {
                id: 3,
                name: 'boleto_bancario.pdf',
                size: 512000,
                type: 'application/pdf'
              }
            ]
          },
          {
            id: 'PAY2024003',
            client: { name: 'Pedro Oliveira', email: 'pedro@email.com' },
            orderId: 'ORD2024003',
            amount: 350,
            status: 'vencido',
            paymentMethod: 'Cartão',
            dueDate: '2024-03-10',
            paidDate: null,
            daysOverdue: 5
          },
          {
            id: 'PAY2024004',
            client: { name: 'Ana Costa', email: 'ana@email.com' },
            orderId: 'ORD2024004',
            amount: 800,
            status: 'pago',
            paymentMethod: 'Transferência',
            dueDate: '2024-03-20',
            paidDate: '2024-03-19',
            daysOverdue: 0
          }
        ]);
        setLoading(false);
      }, 1000);
      
      // Quando a API estiver pronta:
      // const data = await paymentAPI.getAll();
      // setPayments(data);
      
    } catch (err) {
      setError('Erro ao carregar pagamentos');
      console.error(err);
      setLoading(false);
    }
  };

  // Filtrar pagamentos
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || payment.status === filterStatus;
    
    // Filtro de período simplificado para mock
    const matchesPeriod = filterPeriod === 'all'; // Por enquanto, mostrar todos
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Estatísticas
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'pago').length,
    pending: payments.filter(p => p.status === 'pendente').length,
    overdue: payments.filter(p => p.status === 'vencido').length,
    totalPaid: payments
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + p.amount, 0),
    totalPending: payments
      .filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + p.amount, 0)
  };

  // Função para obter cor e ícone do status
  const getStatusConfig = (status) => {
    switch(status) {
      case 'pendente':
        return { color: 'yellow', icon: Clock, label: 'Pendente' };
      case 'pago':
        return { color: 'green', icon: CheckCircle, label: 'Pago' };
      case 'vencido':
        return { color: 'red', icon: AlertTriangle, label: 'Vencido' };
      case 'cancelado':
        return { color: 'gray', icon: XCircle, label: 'Cancelado' };
      default:
        return { color: 'gray', icon: CreditCard, label: 'Desconhecido' };
    }
  };

  // Função para obter ícone do método de pagamento
  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'PIX':
        return '💳';
      case 'Boleto':
        return '📄';
      case 'Cartão':
        return '💳';
      case 'Transferência':
        return '🏦';
      default:
        return '💰';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-4`}>Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
          <button onClick={fetchPayments} className="ml-4 underline">Tentar novamente</button>
        </div>
      </div>
    );
  }

  const openView = (payment) => { setSelectedPayment(payment); setShowViewModal(true); };
  const openEdit = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      id: payment.id,
      clientId: (clients.find(c => c.email === payment.client.email || c.name === payment.client.name)?.id) || '',
      clientName: payment.client.name,
      clientEmail: payment.client.email,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      dueDate: payment.dueDate,
      paidDate: payment.paidDate || '',
      attachments: payment.attachments || []
    });
    setAttachments(payment.attachments || []);
    setShowEditModal(true);
  };
  const openCreate = () => {
    setFormData({ 
      id: '', 
      clientId: '', 
      clientName: '', 
      clientEmail: '', 
      orderId: '', 
      amount: 0, 
      status: 'pendente', 
      paymentMethod: 'PIX', 
      dueDate: '', 
      paidDate: '',
      attachments: []
    });
    setShowCreateModal(true);
  };
  const closeModals = () => { setShowCreateModal(false); setShowEditModal(false); setShowViewModal(false); setSelectedPayment(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (showEditModal && selectedPayment) {
      setPayments(payments.map(p => p.id === selectedPayment.id ? {
        ...p,
        client: (() => {
          const found = clients.find(c => c.id === formData.clientId);
          return found ? { name: found.name, email: found.email } : { name: formData.clientName, email: formData.clientEmail };
        })(),
        orderId: formData.orderId,
        amount: Number(formData.amount),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        dueDate: formData.dueDate,
        paidDate: formData.paidDate || null,
        attachments: attachments
      } : p));
    } else if (showCreateModal) {
      const newPayment = {
        id: `PAY${new Date().getFullYear()}${String(Date.now()).slice(-3)}`,
        client: (() => {
          const found = clients.find(c => c.id === formData.clientId);
          return found ? { name: found.name, email: found.email } : { name: formData.clientName, email: formData.clientEmail };
        })(),
        orderId: formData.orderId,
        amount: Number(formData.amount),
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        dueDate: formData.dueDate,
        paidDate: formData.paidDate || null,
        daysOverdue: 0,
        attachments: attachments
      };
      setPayments([newPayment, ...payments]);
    }
    closeModals();
  };

  // Função para exportar pagamento individual em PDF
  const exportToPDF = (payment) => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Comprovante de Pagamento', 20, 20);
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Informações do pagamento
    doc.setFontSize(12);
    doc.text(`ID do Pagamento: ${payment.id}`, 20, 35);
    doc.text(`Cliente: ${payment.client.name}`, 20, 45);
    doc.text(`Email: ${payment.client.email}`, 20, 55);
    doc.text(`Ordem de Serviço: ${payment.orderId}`, 20, 65);
    doc.text(`Valor: R$ ${payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 75);
    doc.text(`Status: ${payment.status}`, 20, 85);
    doc.text(`Método de Pagamento: ${payment.paymentMethod}`, 20, 95);
    
    if (payment.dueDate) {
      doc.text(`Data de Vencimento: ${new Date(payment.dueDate).toLocaleDateString('pt-BR')}`, 20, 105);
    }
    
    if (payment.paidDate) {
      doc.text(`Data de Pagamento: ${new Date(payment.paidDate).toLocaleDateString('pt-BR')}`, 20, 115);
    }
    
    // Data de geração
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 130);
    
    // Salvar arquivo
    doc.save(`comprovante_pagamento_${payment.id}.pdf`);
  };

  // Função para exportar relatório de todos os pagamentos em PDF
  const exportAllToPDF = () => {
    if (filteredPayments.length === 0) {
      alert('Nenhum pagamento encontrado para exportar.');
      return;
    }

    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório de Pagamentos', 20, 20);
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Informações do relatório
    doc.setFontSize(10);
    doc.text(`Período: ${new Date().toLocaleDateString('pt-BR')}`, 20, 35);
    doc.text(`Total de pagamentos: ${filteredPayments.length}`, 20, 45);
    
    // Cabeçalho da tabela
    let yPosition = 60;
    doc.setFontSize(8);
    doc.text('ID', 20, yPosition);
    doc.text('Cliente', 40, yPosition);
    doc.text('OS', 80, yPosition);
    doc.text('Valor', 100, yPosition);
    doc.text('Status', 130, yPosition);
    doc.text('Método', 150, yPosition);
    doc.text('Data', 170, yPosition);
    
    // Linha separadora da tabela
    doc.line(20, yPosition + 2, 190, yPosition + 2);
    yPosition += 10;
    
    // Dados dos pagamentos
    filteredPayments.forEach((payment, index) => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(payment.id, 20, yPosition);
      doc.text(payment.client.name.substring(0, 15), 40, yPosition);
      doc.text(payment.orderId, 80, yPosition);
      doc.text(`R$ ${payment.amount.toLocaleString('pt-BR')}`, 100, yPosition);
      doc.text(payment.status, 130, yPosition);
      doc.text(payment.paymentMethod, 150, yPosition);
      doc.text(payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('pt-BR') : '-', 170, yPosition);
      
      yPosition += 8;
    });
    
    // Rodapé
    doc.setFontSize(8);
    doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, 290);
    
    // Salvar arquivo
    doc.save(`relatorio_pagamentos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Funções para gerenciar anexos
  const handleFileUpload = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const removeAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  const confirmAction = (opts) => setConfirmation({ isOpen: true, ...opts });
  const markAsPaid = (payment) => confirmAction({
    title: 'Marcar como pago',
    message: `Confirmar recebimento do pagamento ${payment.id}?`,
    type: 'success',
    confirmText: 'Confirmar',
    onConfirm: () => {
      setPayments(payments.map(p => p.id === payment.id ? { ...p, status: 'pago', paidDate: new Date().toISOString().split('T')[0] } : p));
      setConfirmation({ ...confirmation, isOpen: false });
    }
  });
  const cancelPayment = (payment) => confirmAction({
    title: 'Cancelar pagamento',
    message: `Tem certeza que deseja cancelar o pagamento ${payment.id}?`,
    type: 'danger',
    confirmText: 'Cancelar',
    onConfirm: () => {
      setPayments(payments.map(p => p.id === payment.id ? { ...p, status: 'cancelado' } : p));
      setConfirmation({ ...confirmation, isOpen: false });
    }
  });

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} mb-2`}>Gestão de Pagamentos</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Gerencie todos os pagamentos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.total}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pagos</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.paid}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Pendentes</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Vencidos</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Recebido</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>R$ {stats.totalPaid.toLocaleString('pt-BR')}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>A Receber</p>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>R$ {stats.totalPending.toLocaleString('pt-BR')}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 mb-6`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por número, cliente ou ordem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Todos Status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
            
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className={`px-4 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Todos os Períodos</option>
              <option value="overdue">Vencidos</option>
              <option value="due_today">Vence Hoje</option>
              <option value="this_month">Este Mês</option>
            </select>
            
            <button onClick={exportAllToPDF} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar PDF
            </button>
            
            <button onClick={openCreate} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden overflow-x-auto`}>
        <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
          <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Número</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Cliente</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Ordem</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Valor</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Método</th>
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
              
              <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} w-40`}>Ações</th>
            </tr>
          </thead>
          <tbody className={`${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
            {filteredPayments.map((payment) => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <tr key={payment.id} className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payment.client.name}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{payment.client.email}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {payment.orderId}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    R$ {payment.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payment.paymentMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 text-${statusConfig.color}-500`} />
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${statusConfig.color}-100 text-${statusConfig.color}-800`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-3 items-center">
                      <button onClick={() => openView(payment)} className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`} title="Visualizar">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button onClick={() => exportToPDF(payment)} className={`${theme === 'dark' ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-900'}`} title="Exportar PDF">
                        <Download className="h-5 w-5" />
                      </button>
                      <button onClick={() => openEdit(payment)} className={`${theme === 'dark' ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-900'}`} title="Editar">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      {payment.status === 'pendente' && (
                        <button onClick={() => markAsPaid(payment)} className={`${theme === 'dark' ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900'}`} title="Marcar como Pago">
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                      {payment.status !== 'cancelado' && (
                        <button onClick={() => cancelPayment(payment)} className={`${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`} title="Cancelar">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredPayments.length === 0 && (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Nenhum pagamento encontrado
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-xl w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xl font-bold`}>
                {showEditModal ? 'Editar Pagamento' : 'Novo Pagamento'}
              </h2>
              <button onClick={closeModals} className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cliente</label>
                  <select value={formData.clientId} onChange={(e)=>{
                    const id = e.target.value; 
                    const c = clients.find(x=>x.id===id); 
                    setFormData({...formData, clientId: id, clientName: c?.name || '', clientEmail: c?.email || ''});
                  }} className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="" disabled>Selecione um cliente</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} — {c.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Selecionar OS</label>
                  <select value={formData.orderId} onChange={(e)=>setFormData({...formData, orderId: e.target.value})} className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required>
                    <option value="" disabled>Escolha uma OS</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.id} - {o.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Valor</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={(e)=>setFormData({...formData, amount: e.target.value})} className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} required />
                </div>
                <div>
                  <label className={`block text-sm mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Método</label>
                  <select value={formData.paymentMethod} onChange={(e)=>setFormData({...formData, paymentMethod: e.target.value})} className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                    <option>PIX</option>
                    <option>Boleto</option>
                    <option>Cartão</option>
                    <option>Transferência</option>
                  </select>
                </div>
                
              </div>
              
              {/* Seção de Anexos */}
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Anexos
                </label>
                <FileUpload
                  files={attachments}
                  onFilesChange={setAttachments}
                  maxFiles={10}
                  maxSize={5 * 1024 * 1024}
                  acceptedTypes={['image/*', '.pdf', '.doc', '.docx', '.txt']}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModals} className={`px-4 py-2 rounded border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visualização */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-lg w-full p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-xl font-bold`}>Pagamento {selectedPayment.id}</h2>
              <button onClick={closeModals} className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>✕</button>
            </div>
            <div className="space-y-2">
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Cliente: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.client.name}</span></div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.client.email}</span></div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Ordem: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.orderId}</span></div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Valor: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>R$ {selectedPayment.amount.toLocaleString('pt-BR')}</span></div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Método: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.paymentMethod}</span></div>
              <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.status}</span></div>
              {selectedPayment.paidDate && (
                <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Pago em: <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.paidDate}</span></div>
              )}
            </div>
            
            {/* Seção de Anexos */}
            {selectedPayment.attachments && selectedPayment.attachments.length > 0 && (
              <div className="mt-4">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Documentos e Fotos Anexados
                </h3>
                <div className="space-y-2">
                  {selectedPayment.attachments.map((attachment) => (
                    <div key={attachment.id} className={`flex items-center justify-between p-2 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <FileText className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {attachment.name}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      {attachment.type.startsWith('image/') && (
                        <div className="text-xs text-blue-500 cursor-pointer hover:underline">
                          Visualizar
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeModals} className={`px-4 py-2 rounded border ${theme === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        type={confirmation.type}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        theme={theme}
      />
    </div>
  );
};

export default PaymentsPage;