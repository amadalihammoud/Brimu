import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Eye, Edit2, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Calendar, DollarSign, TrendingUp, Trash2, X, Download, User } from 'lucide-react';
import { quoteAPI } from '../../services/api';
import jsPDF from 'jspdf';
import {
  ModernPageHeader,
  ModernStatsCards,
  ModernSearchFilterBar,
  ModernDataTable,
  ModernStatusBadge,
  ModernEmptyState
} from '../../components/common/ModernComponents';
import {
  STANDARD_ICONS,
  STANDARD_COLORS,
  StandardActionButton,
  StandardEntityIcon,
  StandardStatusIcon
} from '../../components/common/IconStandards';

const QuotesPage = ({ theme }) => {
  // Estados
  const [quotes, setQuotes] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    service: '',
    description: '',
    totalValue: 0,
    validUntil: '',
    status: 'enviado',
    date: new Date().toISOString().split('T')[0],
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ],
    discountType: 'percentual',
    discountValue: 0,
    appliedDiscount: 0,
    subtotal: 0,
    attachments: []
  });

  // Buscar orçamentos e clientes ao montar componente
  useEffect(() => {
    fetchQuotes();
    fetchClients();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Por enquanto, usar dados mockados
      setTimeout(() => {
        setQuotes([
          {
            id: 'COT2024001',
            client: { name: 'João Silva', email: 'joao@email.com' },
            service: 'Poda de Árvore',
            status: 'enviado',
            totalValue: 500,
            validUntil: '2024-03-25',
            createdAt: '2024-03-10',
            daysToExpire: 5
          },
          {
            id: 'COT2024002',
            client: { name: 'Maria Santos', email: 'maria@email.com' },
            service: 'Remoção de Árvore',
            status: 'aprovado',
            totalValue: 1200,
            validUntil: '2024-03-30',
            createdAt: '2024-03-08',
            daysToExpire: 10
          },
          {
            id: 'COT2024003',
            client: { name: 'Pedro Oliveira', email: 'pedro@email.com' },
            service: 'Manutenção de Jardim',
            status: 'rejeitado',
            totalValue: 350,
            validUntil: '2024-03-20',
            createdAt: '2024-03-05',
            daysToExpire: 0
          },
          {
            id: 'COT2024004',
            client: { name: 'Ana Costa', email: 'ana@email.com' },
            service: 'Plantio de Árvores',
            status: 'rascunho',
            totalValue: 800,
            validUntil: '2024-04-01',
            createdAt: '2024-03-12',
            daysToExpire: 15
          }
        ]);
        setLoading(false);
      }, 1000);
      
      // Quando a API estiver pronta:
      // const data = await quoteAPI.getAll();
      // setQuotes(data);
      
    } catch (err) {
      setError('Erro ao carregar orçamentos');
      console.error(err);
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      // Dados mockados dos clientes (mesmo da página Clientes)
      const mockClients = [
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
          status: 'ativo'
        },
        {
          id: 2,
          nome: 'Shopping Verde Plaza',
          tipo: 'Shopping',
          email: 'gerencia@verdeplaza.com.br',
          telefone: '(11) 88888-8888',
          endereco: 'Av. Verde, 456 - Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567',
          cnpj: '98.765.432/0001-10',
          status: 'ativo'
        },
        {
          id: 3,
          nome: 'João Silva',
          tipo: 'Pessoa Física',
          email: 'joao.silva@email.com',
          telefone: '(11) 77777-7777',
          endereco: 'Rua das Palmeiras, 789 - Vila Nova',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567',
          cpf: '123.456.789-00',
          status: 'ativo'
        }
      ];
      setClients(mockClients);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  // Funções de exportação
  const exportToPDF = (quote) => {
    const doc = new jsPDF();
    
    // Configurações do PDF
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BRIMU - SERVIÇOS DE ARBORIZAÇÃO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    doc.setFontSize(16);
    doc.text('ORÇAMENTO DE SERVIÇOS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;
    
    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 15;
    
    // Informações do orçamento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Número do Orçamento: ${quote.id}`, margin, yPosition);
    yPosition += 10;
    
    doc.text(`Data de Criação: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 10;
    
    doc.text(`Status: ${getStatusConfig(quote.status).label}`, margin, yPosition);
    yPosition += 15;
    
    // Informações do cliente
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', margin, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${quote.client.name}`, margin, yPosition);
    yPosition += 8;
    
    doc.text(`Email: ${quote.client.email}`, margin, yPosition);
    yPosition += 15;
    
    // Informações do serviço
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO SERVIÇO', margin, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Serviço: ${quote.service}`, margin, yPosition);
    yPosition += 8;
    
    if (quote.description) {
      const descriptionLines = doc.splitTextToSize(`Descrição: ${quote.description}`, pageWidth - 2 * margin);
      doc.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 6;
    }
    yPosition += 10;
    
    // Informações financeiras
    doc.setFont('helvetica', 'bold');
    doc.text('VALORES', margin, yPosition);
    yPosition += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Valor Total: R$ ${quote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
    yPosition += 8;
    
    doc.text(`Válido até: ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}`, margin, yPosition);
    yPosition += 15;
    
    // Rodapé
    yPosition = doc.internal.pageSize.getHeight() - 40;
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Este orçamento é válido por 30 dias a partir da data de emissão.', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
    
    doc.text('Para mais informações, entre em contato conosco.', pageWidth / 2, yPosition, { align: 'center' });
    
    // Salvar o PDF
    doc.save(`orcamento_${quote.id}.pdf`);
  };

  const exportAllToExcel = () => {
    // Simulação de exportação para Excel (CSV)
    const headers = ['ID', 'Cliente', 'Email', 'Serviço', 'Valor', 'Status', 'Vencimento', 'Criação'];
    const csvContent = [
      headers.join(','),
      ...filteredQuotes.map(quote => [
        quote.id,
        `"${quote.client.name}"`,
        quote.client.email,
        `"${quote.service}"`,
        quote.totalValue,
        quote.status,
        quote.validUntil,
        quote.createdAt
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orcamentos_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportAllToPDF = () => {
    if (filteredQuotes.length === 0) {
      alert('Nenhum orçamento para exportar.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    let isFirstPage = true;

    filteredQuotes.forEach((quote, index) => {
      // Adicionar nova página se não for a primeira
      if (!isFirstPage) {
        doc.addPage();
        yPosition = margin;
      }
      isFirstPage = false;

      // Cabeçalho
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RELATÓRIO DE ORÇAMENTOS', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Linha separadora
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 15;

      // Informações do orçamento
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Orçamento ${index + 1} de ${filteredQuotes.length}`, margin, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${quote.id}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Cliente: ${quote.client.name}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Email: ${quote.client.email}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Serviço: ${quote.service}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Valor: R$ ${quote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Status: ${getStatusConfig(quote.status).label}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Válido até: ${new Date(quote.validUntil).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 8;

      doc.text(`Criado em: ${new Date(quote.createdAt).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;

      // Verificar se precisa de nova página
      if (yPosition > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPosition = margin;
      }
    });

    // Salvar o PDF
    doc.save(`relatorio_orcamentos_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Filtrar orçamentos
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || quote.status === filterStatus;
    
    // Filtro de período simplificado para mock
    const matchesPeriod = filterPeriod === 'all'; // Por enquanto, mostrar todos
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  // Estatísticas
  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'enviado').length,
    approved: quotes.filter(q => q.status === 'aprovado').length,
    expired: quotes.filter(q => q.daysToExpire <= 0 && q.status === 'enviado').length,
    totalValue: quotes
      .filter(q => q.status === 'aprovado')
      .reduce((sum, q) => sum + q.totalValue, 0)
  };

  // Função para obter cor e ícone do status
  const getStatusConfig = (status) => {
    switch(status) {
      case 'rascunho':
        return { color: 'gray', icon: FileText, label: 'Rascunho' };
      case 'enviado':
        return { color: 'yellow', icon: Clock, label: 'Enviado' };
      case 'aprovado':
        return { color: 'green', icon: CheckCircle, label: 'Aprovado' };
      case 'rejeitado':
        return { color: 'red', icon: XCircle, label: 'Rejeitado' };
      default:
        return { color: 'gray', icon: FileText, label: 'Desconhecido' };
    }
  };

  // Função para verificar se está próximo do vencimento
  const isExpiringSoon = (daysToExpire) => {
    return daysToExpire <= 3 && daysToExpire > 0;
  };

  // Funções para manipular orçamentos
  const handleCreateQuote = () => {
    setFormData({
      clientId: '',
      clientName: '',
      clientEmail: '',
      service: '',
      description: '',
      totalValue: 0,
      validUntil: '',
      status: 'enviado',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          id: 1,
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ],
      discountType: 'percentual',
      discountValue: 0,
      appliedDiscount: 0,
      subtotal: 0,
      attachments: []
    });
    setShowCreateModal(true);
  };

  const handleEditQuote = (quote) => {
    setSelectedQuote(quote);
    setFormData({
      clientId: quote.clientId || '',
      clientName: quote.client.name,
      clientEmail: quote.client.email,
      service: quote.service,
      description: quote.description || '',
      totalValue: quote.totalValue.toString(),
      validUntil: quote.validUntil,
      status: quote.status
    });
    setShowEditModal(true);
  };

  const handleClientSelect = (clientId) => {
    const selectedClient = clients.find(client => client.id === parseInt(clientId));
    if (selectedClient) {
      setFormData({
        ...formData,
        clientId: selectedClient.id,
        clientName: selectedClient.nome,
        clientEmail: selectedClient.email
      });
    }
  };

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote);
    setShowViewModal(true);
  };

  const handleDeleteQuote = (quoteId) => {
    if (window.confirm('Tem certeza que deseja deletar este orçamento?')) {
      setQuotes(quotes.filter(quote => quote.id !== quoteId));
    }
  };

  const handleApproveQuote = (quoteId) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: 'aprovado' }
        : quote
    ));
  };

  const handleRejectQuote = (quoteId) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: 'rejeitado' }
        : quote
    ));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    
    if (showEditModal && selectedQuote) {
      // Editar orçamento existente
      setQuotes(quotes.map(quote => 
        quote.id === selectedQuote.id 
          ? {
              ...quote,
              clientId: formData.clientId,
              client: { name: formData.clientName, email: formData.clientEmail },
              service: formData.service,
              description: formData.description,
              totalValue: parseFloat(formData.totalValue),
              validUntil: formData.validUntil,
              status: formData.status
            }
          : quote
      ));
      setShowEditModal(false);
    } else {
      // Criar novo orçamento
      const newQuote = {
        id: `COT${new Date().getFullYear()}${String(Date.now()).slice(-3)}`,
        clientId: formData.clientId,
        client: { name: formData.clientName, email: formData.clientEmail },
        service: formData.service,
        description: formData.description,
        status: formData.status,
        totalValue: parseFloat(formData.totalValue),
        validUntil: formData.validUntil,
        createdAt: new Date().toISOString().split('T')[0],
        daysToExpire: Math.ceil((new Date(formData.validUntil) - new Date()) / (1000 * 60 * 60 * 24))
      };
      setQuotes([...quotes, newQuote]);
      setShowCreateModal(false);
    }
    
    setFormData({
      clientName: '',
      clientEmail: '',
      service: '',
      description: '',
      totalValue: '',
      validUntil: '',
      status: 'rascunho'
    });
    setSelectedQuote(null);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setSelectedQuote(null);
    setFormData({
      clientId: '',
      clientName: '',
      clientEmail: '',
      service: '',
      description: '',
      totalValue: 0,
      validUntil: '',
      status: 'enviado',
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          id: 1,
          description: '',
          quantity: 1,
          unitPrice: 0,
          total: 0
        }
      ],
      discountType: 'percentual',
      discountValue: 0,
      appliedDiscount: 0,
      subtotal: 0,
      attachments: []
    });
  };

  // Funções para gerenciar itens do orçamento
  const addBudgetItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeBudgetItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    calculateTotals();
  };

  const updateBudgetItem = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              [field]: value,
              total: field === 'quantity' || field === 'unitPrice' 
                ? (field === 'quantity' ? value * item.unitPrice : item.quantity * value)
                : item.total
            }
          : item
      )
    }));
    calculateTotals();
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    let appliedDiscount = 0;
    
    if (formData.discountType === 'percentual') {
      appliedDiscount = (subtotal * formData.discountValue) / 100;
    } else {
      appliedDiscount = formData.discountValue;
    }
    
    const total = subtotal - appliedDiscount;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      appliedDiscount,
      totalValue: total
    }));
  };

  const handleDiscountChange = (type, value) => {
    setFormData(prev => ({
      ...prev,
      discountType: type,
      discountValue: parseFloat(value) || 0
    }));
    calculateTotals();
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
          <button onClick={fetchQuotes} className="ml-4 underline">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-700">
      {/* Header */}
      <ModernPageHeader
        title="Gestão de Orçamentos"
        subtitle="Gerencie todos os orçamentos enviados"
        icon={<StandardEntityIcon entity="QUOTES" size="xl" color="primary" />}
        primaryAction={{
          label: "Novo Orçamento",
          onClick: handleCreateQuote,
          icon: Plus
        }}
        theme={theme}
      />

      {/* Stats Cards */}
      <ModernStatsCards 
        stats={[
          {
            title: 'Total de Orçamentos',
            value: stats.total,
            icon: <StandardEntityIcon entity="QUOTES" size="lg" color="primary" />,
            change: '+12%',
            changeType: 'positive'
          },
          {
            title: 'Pendentes',
            value: stats.pending,
            icon: <StandardStatusIcon status="pending" size="lg" withBackground={false} />,
            change: '+5%',
            changeType: 'positive'
          },
          {
            title: 'Aprovados',
            value: stats.approved,
            icon: <StandardStatusIcon status="completed" size="lg" withBackground={false} />,
            change: '+18%',
            changeType: 'positive'
          },
          {
            title: 'Vencidos',
            value: stats.expired,
            icon: <StandardStatusIcon status="in_progress" size="lg" withBackground={false} />,
            change: '-8%',
            changeType: 'negative'
          },
          {
            title: 'Valor Aprovado',
            value: `R$ ${stats.totalValue.toLocaleString('pt-BR')}`,
            icon: <StandardEntityIcon entity="PAYMENTS" size="lg" color="success" />,
            change: '+25%',
            changeType: 'positive'
          }
        ]}
        theme={theme}
      />

      {/* Filters and Actions */}
      <ModernSearchFilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar por número, cliente ou serviço..."
        filters={[
          {
            type: 'select',
            label: 'Status',
            value: filterStatus,
            onChange: setFilterStatus,
            options: [
              { value: 'all', label: 'Todos Status' },
              { value: 'rascunho', label: 'Rascunho' },
              { value: 'enviado', label: 'Enviado' },
              { value: 'aprovado', label: 'Aprovado' },
              { value: 'rejeitado', label: 'Rejeitado' }
            ]
          },
          {
            type: 'select',
            label: 'Período',
            value: filterPeriod,
            onChange: setFilterPeriod,
            options: [
              { value: 'all', label: 'Todos os Períodos' },
              { value: 'expiring', label: 'Vencendo em 3 dias' },
              { value: 'expired', label: 'Vencidos' },
              { value: 'this_month', label: 'Este Mês' }
            ]
          }
        ]}
        actions={[
          {
            label: 'Exportar Excel',
            onClick: exportAllToExcel,
            variant: 'secondary',
            icon: Download
          },
          {
            label: 'Exportar PDF',
            onClick: exportAllToPDF,
            variant: 'danger',
            icon: Download
          },
          {
            label: 'Novo Orçamento',
            onClick: handleCreateQuote,
            variant: 'primary',
            icon: Plus
          }
        ]}
        theme={theme}
      />

      {/* Table */}
      <ModernDataTable
        headers={[
          { key: 'id', label: 'Número', icon: <StandardEntityIcon entity="QUOTES" size="sm" /> },
          { key: 'client', label: 'Cliente', icon: <StandardEntityIcon entity="CLIENTS" size="sm" /> },
          { key: 'service', label: 'Serviço' },
          { key: 'status', label: 'Status' },
          { key: 'value', label: 'Valor', icon: <StandardEntityIcon entity="PAYMENTS" size="sm" /> },
          { key: 'validity', label: 'Validade', icon: <StandardEntityIcon entity="CALENDAR" size="sm" /> },
          { key: 'actions', label: 'Ações' }
        ]}
        data={filteredQuotes.map((quote) => ({
          id: quote.id,
          client: (
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{quote.client.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{quote.client.email}</div>
            </div>
          ),
          service: quote.service,
          status: (
            <ModernStatusBadge 
              status={quote.status}
              statusConfig={{
                rascunho: { color: 'gray', label: 'Rascunho' },
                enviado: { color: 'yellow', label: 'Enviado' },
                aprovado: { color: 'green', label: 'Aprovado' },
                rejeitado: { color: 'red', label: 'Rejeitado' }
              }}
              theme={theme}
            />
          ),
          value: `R$ ${quote.totalValue.toLocaleString('pt-BR')}`,
          validity: (
            <div>
              <div className="text-sm text-gray-900 dark:text-white">{quote.validUntil}</div>
              <div className={`text-xs ${
                quote.daysToExpire <= 0 
                  ? 'text-red-500 font-semibold' 
                  : isExpiringSoon(quote.daysToExpire)
                  ? 'text-yellow-500 font-medium'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {quote.daysToExpire > 0 ? `${quote.daysToExpire} dias restantes` : 'Vencido'}
              </div>
            </div>
          ),
          actions: (
            <div className="flex items-center gap-1">
              <StandardActionButton 
                action="view" 
                onClick={() => handleViewQuote(quote)}
                tooltip="Visualizar"
                size="sm"
              />
              <StandardActionButton 
                action="edit" 
                onClick={() => handleEditQuote(quote)}
                tooltip="Editar"
                size="sm"
              />
              {quote.status === 'enviado' && (
                <>
                  <button 
                    onClick={() => handleApproveQuote(quote.id)}
                    className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 transition-all duration-200 hover:scale-110"
                    title="Aprovar"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleRejectQuote(quote.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 transition-all duration-200 hover:scale-110"
                    title="Rejeitar"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </>
              )}
              <button 
                onClick={() => exportToPDF(quote)}
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 transition-all duration-200 hover:scale-110"
                title="Exportar PDF"
              >
                <Download className="w-3 h-3" />
              </button>
              <StandardActionButton 
                action="delete" 
                onClick={() => handleDeleteQuote(quote.id)}
                tooltip="Deletar"
                size="sm"
              />
            </div>
          )
        }))}
        theme={theme}
        emptyState={
          <ModernEmptyState 
            icon={<StandardEntityIcon entity="QUOTES" size="xl" color="secondary" />}
            title="Nenhum orçamento encontrado"
            description="Crie um novo orçamento ou ajuste os filtros de busca"
            action={{
              label: "Criar Primeiro Orçamento",
              onClick: handleCreateQuote
            }}
            theme={theme}
          />
        }
      />

      {/* Modal de Criar/Editar Orçamento */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {showEditModal ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h2>
              <button
                onClick={closeModals}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Selecionar Cliente *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nome} ({client.tipo}) - {client.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Email do Cliente *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Valor *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.totalValue}
                    onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="enviado">Enviado</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    theme === 'dark' 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {showEditModal ? 'Salvar Alterações' : 'Criar Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Visualizar Orçamento */}
      {showViewModal && selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Detalhes do Orçamento
              </h2>
              <button
                onClick={closeModals}
                className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número do Orçamento
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQuote.id}
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {getStatusConfig(selectedQuote.status).label}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cliente
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQuote.client.name}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedQuote.client.email}
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Serviço
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQuote.service}
                  </p>
                </div>
              </div>
              
              {selectedQuote.description && (
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Descrição
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQuote.description}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Valor
                  </label>
                  <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    R$ {selectedQuote.totalValue.toLocaleString('pt-BR')}
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data de Criação
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQuote.createdAt}
                  </p>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data de Vencimento
                  </label>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQuote.validUntil}
                  </p>
                  <p className={`text-xs ${
                    selectedQuote.daysToExpire <= 0 
                      ? 'text-red-500' 
                      : isExpiringSoon(selectedQuote.daysToExpire)
                      ? 'text-yellow-500'
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {selectedQuote.daysToExpire > 0 ? `${selectedQuote.daysToExpire} dias restantes` : 'Vencido'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;