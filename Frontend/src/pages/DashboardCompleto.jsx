import React, { useState } from 'react'
import { 
  FaTree, FaUser, FaSignOutAlt, FaHome, FaUsers, FaClipboardList, 
  FaFileInvoiceDollar, FaCalendarAlt, FaTools, FaCog, FaBars, 
  FaTimes, FaPlus, FaEye, FaEdit, FaTrash, FaDownload, FaUpload, FaSave,
  FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFile, FaCloud
} from 'react-icons/fa'

const DashboardCompleto = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  
  // Estados para modais e formulários
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'create', 'edit', 'delete', 'view'
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({})
  
  // Estados para dados dinâmicos
  const [clientes, setClientes] = useState([
    { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-1111', ultimoServico: '05/09/2025', status: 'Ativo', documentos: [] },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-2222', ultimoServico: '01/09/2025', status: 'Ativo', documentos: [] }
  ])
  
  // Estado para arquivos
  const [uploadedFiles, setUploadedFiles] = useState({})
  
  const [ordens, setOrdens] = useState([
    { id: 1, cliente: 'João Silva', servico: 'Poda de Árvores', status: 'Em andamento', valor: 850.00, data: '10/09/2025' },
    { id: 2, cliente: 'Maria Santos', servico: 'Remoção de Toco', status: 'Agendado', valor: 1200.00, data: '12/09/2025' },
    { id: 3, cliente: 'Pedro Costa', servico: 'Plantio de Mudas', status: 'Concluído', valor: 600.00, data: '08/09/2025' }
  ])
  
  const [equipamentos, setEquipamentos] = useState([
    { id: 1, nome: 'Motosserra Stihl MS-260', tipo: 'Motosserra', status: 'Disponível', ultimaManutencao: '15/08/2025', proximaManutencao: '15/10/2025' },
    { id: 2, nome: 'Caminhão Munck', tipo: 'Veículo', status: 'Em Uso', ultimaManutencao: '01/08/2025', proximaManutencao: '01/11/2025' }
  ])
  
  const [agendamentos, setAgendamentos] = useState([
    { id: 1, dataHora: '10/09/2025 08:00', cliente: 'João Silva', servico: 'Poda de Árvores', equipe: 'Equipe A', status: 'Agendado' },
    { id: 2, dataHora: '10/09/2025 14:00', cliente: 'Maria Santos', servico: 'Remoção de Toco', equipe: 'Equipe B', status: 'Em andamento' }
  ])

  const [orcamentos, setOrcamentos] = useState([
    { 
      id: 1, 
      numero: 'ORC-2025-001',
      cliente: 'João Silva', 
      servico: 'Poda de Árvores Grandes', 
      dataSolicitacao: '01/09/2025',
      dataValidade: '01/10/2025',
      status: 'Aprovado', 
      valorSubtotal: 1500.00,
      desconto: { tipo: 'percentual', valor: 0, motivo: '' },
      valorTotal: 1500.00,
      itens: [
        { descricao: 'Poda de árvores (altura > 10m)', quantidade: 3, valorUnitario: 400.00, valorTotal: 1200.00 },
        { descricao: 'Remoção de galhos', quantidade: 1, valorUnitario: 300.00, valorTotal: 300.00 }
      ],
      observacoes: 'Serviço inclui limpeza do local',
      condicoesPagamento: '50% entrada + 50% na conclusão',
      prazoExecucao: '3 dias úteis',
      responsavel: 'Carlos Silva',
      anexos: [],
      pagamento: {
        status: 'Pendente',
        metodo: '',
        valorPago: 0,
        dataPagamento: null,
        comprovante: null
      },
      ordemServico: null // ID da ordem de serviço quando convertido
    },
    { 
      id: 2, 
      numero: 'ORC-2025-002',
      cliente: 'Maria Santos', 
      servico: 'Remoção de Toco', 
      dataSolicitacao: '28/08/2025',
      dataValidade: '28/09/2025',
      status: 'Aguardando', 
      valorSubtotal: 800.00,
      desconto: { tipo: 'percentual', valor: 10, motivo: 'Pagamento à vista' },
      valorTotal: 720.00,
      itens: [
        { descricao: 'Remoção de toco até 50cm diâmetro', quantidade: 2, valorUnitario: 350.00, valorTotal: 700.00 },
        { descricao: 'Nivelamento do terreno', quantidade: 1, valorUnitario: 100.00, valorTotal: 100.00 }
      ],
      observacoes: 'Cliente solicitou urgência',
      condicoesPagamento: 'À vista com 10% desconto',
      prazoExecucao: '2 dias úteis',
      responsavel: 'Ana Costa',
      anexos: [],
      pagamento: {
        status: 'Pendente',
        metodo: '',
        valorPago: 0,
        dataPagamento: null,
        comprovante: null
      },
      ordemServico: null
    },
    { 
      id: 3, 
      numero: 'ORC-2025-003',
      cliente: 'Pedro Costa', 
      servico: 'Plantio de Mudas', 
      dataSolicitacao: '15/09/2025',
      dataValidade: '15/10/2025',
      status: 'Em Análise', 
      valorSubtotal: 1200.00,
      desconto: { tipo: 'valor', valor: 50, motivo: 'Cliente fidelidade' },
      valorTotal: 1150.00,
      itens: [
        { descricao: 'Plantio de mudas nativas', quantidade: 20, valorUnitario: 45.00, valorTotal: 900.00 },
        { descricao: 'Preparo do solo', quantidade: 1, valorUnitario: 200.00, valorTotal: 200.00 },
        { descricao: 'Irrigação inicial', quantidade: 1, valorUnitario: 100.00, valorTotal: 100.00 }
      ],
      observacoes: 'Mudas com garantia de 6 meses',
      condicoesPagamento: '30% entrada + 70% em 30 dias',
      prazoExecucao: '5 dias úteis',
      responsavel: 'José Santos',
      anexos: [],
      pagamento: {
        status: 'Pendente',
        metodo: '',
        valorPago: 0,
        dataPagamento: null,
        comprovante: null
      },
      ordemServico: null
    }
  ])

  // Dados mock para demonstração
  const mockData = {
    admin: {
      overview: {
        totalClientes: 156,
        ordemesAtivas: 23,
        faturamentoMes: 45780.50,
        servicosCompletos: 89
      },
      recentOrders: [
        { id: 1, cliente: 'João Silva', servico: 'Poda de Árvores', status: 'Em andamento', valor: 850.00 },
        { id: 2, cliente: 'Maria Santos', servico: 'Remoção de Toco', status: 'Agendado', valor: 1200.00 },
        { id: 3, cliente: 'Pedro Costa', servico: 'Plantio de Mudas', status: 'Concluído', valor: 600.00 }
      ]
    },
    client: {
      overview: {
        servicosSolicitados: 8,
        servicosCompletos: 6,
        proximoAgendamento: '15/09/2025',
        valorTotal: 4500.00
      },
      myOrders: [
        { id: 1, servico: 'Poda de Jacarandá', data: '10/09/2025', status: 'Concluído', valor: 750.00 },
        { id: 2, servico: 'Limpeza de Terreno', data: '15/09/2025', status: 'Agendado', valor: 1200.00 }
      ]
    }
  }

  const isAdmin = user?.role === 'admin'
  const currentData = isAdmin ? mockData.admin : mockData.client

  // Funções CRUD
  const handleCreate = (section) => {
    setModalType('create')
    setSelectedItem(null)
    setFormData({})
    setShowModal(true)
  }

  const handleEdit = (item, section) => {
    setModalType('edit')
    setSelectedItem(item)
    setFormData({...item})
    setShowModal(true)
  }

  const handleDelete = (item, section) => {
    if (window.confirm(`Tem certeza que deseja excluir este item?`)) {
      switch(section) {
        case 'clientes':
          setClientes(clientes.filter(c => c.id !== item.id))
          break
        case 'ordens':
          setOrdens(ordens.filter(o => o.id !== item.id))
          break
        case 'equipamentos':
          setEquipamentos(equipamentos.filter(e => e.id !== item.id))
          break
        case 'agendamentos':
          setAgendamentos(agendamentos.filter(a => a.id !== item.id))
          break
        case 'orcamentos':
          setOrcamentos(orcamentos.filter(o => o.id !== item.id))
          break
      }
      alert('Item excluído com sucesso!')
    }
  }

  const handleView = (item) => {
    setModalType('view')
    setSelectedItem(item)
    setShowModal(true)
  }

  // Garantir que todos os orçamentos tenham estrutura de pagamento
  React.useEffect(() => {
    const orcamentosComPagamento = orcamentos.map(orcamento => {
      if (!orcamento.pagamento) {
        return {
          ...orcamento,
          pagamento: {
            status: 'Pendente',
            metodo: '',
            valorPago: 0,
            dataPagamento: null,
            comprovante: null
          }
        }
      }
      return orcamento
    })
    
    // Só atualizar se algum orçamento foi modificado
    if (orcamentosComPagamento.some((orc, index) => !orcamentos[index].pagamento)) {
      setOrcamentos(orcamentosComPagamento)
    }
  }, []) // Executar apenas uma vez no mount

  const handleSave = () => {
    const newId = Date.now()
    
    if (modalType === 'create') {
      const newItem = {...formData, id: newId}
      
      switch(activeSection) {
        case 'clients':
          setClientes([...clientes, newItem])
          break
        case 'orders':
          setOrdens([...ordens, newItem])
          break
        case 'equipment':
          setEquipamentos([...equipamentos, newItem])
          break
        case 'calendar':
          setAgendamentos([...agendamentos, newItem])
          break
        case 'quotes':
          setOrcamentos([...orcamentos, newItem])
          break
      }
      alert('Item criado com sucesso!')
    } else if (modalType === 'edit') {
      switch(activeSection) {
        case 'clients':
          setClientes(clientes.map(c => c.id === selectedItem.id ? {...formData, id: selectedItem.id} : c))
          break
        case 'orders':
          setOrdens(ordens.map(o => o.id === selectedItem.id ? {...formData, id: selectedItem.id} : o))
          break
        case 'equipment':
          setEquipamentos(equipamentos.map(e => e.id === selectedItem.id ? {...formData, id: selectedItem.id} : e))
          break
        case 'calendar':
          setAgendamentos(agendamentos.map(a => a.id === selectedItem.id ? {...formData, id: selectedItem.id} : a))
          break
        case 'quotes':
          setOrcamentos(orcamentos.map(o => o.id === selectedItem.id ? {...formData, id: selectedItem.id} : o))
          break
      }
      alert('Item atualizado com sucesso!')
    } else if (modalType === 'payment') {
      // Processar pagamento do orçamento
      const valorPago = parseFloat(formData.valorPago || 0)
      const orcamento = selectedItem
      const valorTotal = orcamento.valorTotal || 0
      
      // Garantir que a estrutura de pagamento existe
      const pagamentoAtual = orcamento.pagamento || {
        status: 'Pendente',
        metodo: '',
        valorPago: 0,
        dataPagamento: null,
        comprovante: null
      }
      
      const valorJaPago = pagamentoAtual.valorPago || 0
      const novoTotalPago = valorJaPago + valorPago
      
      let statusPagamento = 'Pendente'
      const percentualPago = valorTotal > 0 ? (novoTotalPago / valorTotal) * 100 : 0
      
      if (novoTotalPago >= valorTotal) {
        statusPagamento = 'Pago'
      } else if (percentualPago >= 50) {
        statusPagamento = 'Parcial' // Suficiente para conversão (50%+)
      } else if (novoTotalPago > 0) {
        statusPagamento = 'Parcial' // Insuficiente para conversão
      }
      
      const dadosPagamento = {
        status: statusPagamento,
        metodo: formData.metodoPagamento || '',
        valorPago: novoTotalPago,
        dataPagamento: new Date().toLocaleDateString('pt-BR'),
        observacoes: formData.observacoesPagamento || ''
      }
      
      processarPagamento(selectedItem.id, dadosPagamento)
      
      console.log('Pagamento processado:', {
        orcamentoId: selectedItem.id,
        valorPago,
        novoTotalPago,
        percentualPago,
        statusPagamento,
        dadosPagamento
      })
      
      // Se pagamento completo, atualizar status do orçamento
      if (statusPagamento === 'Pago') {
        // Criar orçamento atualizado com novo status e pagamento
        const orcamentoAtualizado = { 
          ...selectedItem, 
          status: 'Aprovado',
          pagamento: { 
            ...pagamentoAtual, 
            ...dadosPagamento 
          }
        }
        
        // Atualizar o estado com o orçamento aprovado
        setOrcamentos(orcamentosAtual => 
          orcamentosAtual.map(orc => 
            orc.id === selectedItem.id 
              ? orcamentoAtualizado
              : orc
          )
        )
        
        // Perguntar se deseja converter automaticamente para ordem de serviço
        setTimeout(() => {
          if (window.confirm('Orçamento foi totalmente pago! Deseja converter automaticamente para Ordem de Serviço?')) {
            converterParaOrdemServico(orcamentoAtualizado)
          }
        }, 1000)
      } else if (statusPagamento === 'Parcial') {
        // Para pagamento parcial >= 50%, oferecer conversão
        if (percentualPago >= 50) {
          setTimeout(() => {
            if (window.confirm(`Orçamento atingiu ${percentualPago.toFixed(0)}% de pagamento! Deseja converter para Ordem de Serviço?`)) {
              const orcamentoAtualizado = { 
                ...selectedItem, 
                status: 'Em Análise',
                pagamento: { 
                  ...pagamentoAtual, 
                  ...dadosPagamento 
                }
              }
              converterParaOrdemServico(orcamentoAtualizado)
            }
          }, 1000)
        }
        // Para pagamento parcial, manter como "Em Análise" mas permitir conversão
        setOrcamentos(orcamentosAtual => 
          orcamentosAtual.map(orc => 
            orc.id === selectedItem.id 
              ? { ...orc, status: 'Em Análise' }
              : orc
          )
        )
      }
    }
    
    setShowModal(false)
    setFormData({})
    setSelectedItem(null)
  }

  // Funções para cálculos financeiros
  const calcularDesconto = (subtotal, desconto) => {
    if (!desconto || desconto.valor === 0) return 0
    
    if (desconto.tipo === 'percentual') {
      return (subtotal * desconto.valor) / 100
    } else {
      return desconto.valor
    }
  }

  // Função para verificar se pagamento é suficiente para conversão (50%)
  const podeConverterComPagamento = (orcamento) => {
    const valorTotal = orcamento.valorTotal || 0
    const valorPago = orcamento.pagamento?.valorPago || 0
    const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
    return percentualPago >= 50
  }

  const calcularValorTotal = (subtotal, desconto) => {
    const valorDesconto = calcularDesconto(subtotal, desconto)
    return subtotal - valorDesconto
  }

  const atualizarCalculosOrcamento = (formData) => {
    const subtotal = (formData.itens || []).reduce((sum, item) => 
      sum + ((item.quantidade || 1) * (item.valorUnitario || 0)), 0
    )
    
    const desconto = formData.desconto || { tipo: 'percentual', valor: 0, motivo: '' }
    const valorTotal = calcularValorTotal(subtotal, desconto)
    
    return {
      ...formData,
      valorSubtotal: subtotal,
      valorTotal: valorTotal
    }
  }

  // Função para processar pagamento
  const processarPagamento = (orcamentoId, dadosPagamento) => {
    console.log('processarPagamento chamado:', { orcamentoId, dadosPagamento })
    
    setOrcamentos(orcamentosAtual => {
      const novosOrcamentos = orcamentosAtual.map(orc => {
        if (orc.id === orcamentoId) {
          const orcamentoAtualizado = {
            ...orc,
            pagamento: {
              ...orc.pagamento,
              ...dadosPagamento,
              dataPagamento: new Date().toLocaleDateString('pt-BR')
            }
          }
          console.log('Orçamento atualizado:', orcamentoAtualizado)
          return orcamentoAtualizado
        }
        return orc
      })
      console.log('Novos orçamentos:', novosOrcamentos)
      return novosOrcamentos
    })
    
    alert('Pagamento processado com sucesso!')
  }

  // Função para converter orçamento em ordem de serviço
  const converterParaOrdemServico = (orcamento) => {
    // Verificar se já foi convertido
    if (orcamento.ordemServico) {
      alert('Este orçamento já foi convertido em ordem de serviço!')
      return
    }
    
    // Se o orçamento foi pago mas não aprovado, aprovar automaticamente
    if (orcamento.status !== 'Aprovado') {
      if (orcamento.pagamento?.status === 'Pago' || orcamento.pagamento?.status === 'Parcial') {
        // Auto-aprovar orçamentos com pagamento
        orcamento = { ...orcamento, status: 'Aprovado' }
      } else {
        alert('Orçamento deve ser aprovado ou ter pagamento para ser convertido!')
        return
      }
    }
    
    // Verificar se tem pelo menos 50% de pagamento
    if (!podeConverterComPagamento(orcamento)) {
      const valorTotal = orcamento.valorTotal || 0
      const valorPago = orcamento.pagamento?.valorPago || 0
      const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
      alert(`É necessário pelo menos 50% de pagamento para converter!\nPago: R$ ${valorPago.toFixed(2)} (${percentualPago.toFixed(0)}%) de R$ ${valorTotal.toFixed(2)}`)
      return
    }

    const novaOrdem = {
      id: Date.now(),
      numero: `OS-2025-${String(Date.now()).slice(-3)}`,
      cliente: orcamento.cliente,
      servico: orcamento.servico,
      status: 'Agendado',
      valor: orcamento.valorTotal,
      data: new Date().toLocaleDateString('pt-BR'),
      prazoExecucao: orcamento.prazoExecucao,
      responsavel: orcamento.responsavel,
      itens: orcamento.itens,
      orcamentoOrigem: orcamento.numero,
      observacoes: orcamento.observacoes
    }

    // Adicionar à lista de ordens
    setOrdens(ordensAtual => [...ordensAtual, novaOrdem])

    // Atualizar orçamento com referência à ordem
    setOrcamentos(orcamentosAtual => 
      orcamentosAtual.map(orc => 
        orc.id === orcamento.id 
          ? { ...orc, ordemServico: novaOrdem.id, status: 'Convertido' }
          : orc
      )
    )

    alert(`Ordem de Serviço ${novaOrdem.numero} criada com sucesso!`)
  }

  // Função para gerar PDF do orçamento
  const generateOrcamentoPDF = (orcamento) => {
    // Criar conteúdo HTML para o PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Orçamento ${orcamento.numero} - Brimu</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 15px; 
            color: #333; 
            line-height: 1.4; 
            font-size: 13px;
          }
          .container { max-width: 100%; }
          .header { 
            background: linear-gradient(135deg, #22c55e, #16a34a); 
            color: white; 
            text-align: center; 
            padding: 15px; 
            border-radius: 8px;
            margin-bottom: 15px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px; 
          }
          .company-info { font-size: 12px; margin-bottom: 2px; }
          .document-title { 
            font-size: 20px; 
            font-weight: bold; 
            margin: 15px 0 10px; 
            text-align: center; 
            color: #22c55e;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 15px; 
          }
          .info-grid-3 { 
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 15px; 
            margin-bottom: 15px; 
          }
          .info-box { 
            background: #f8f9fa;
            border: 1px solid #e2e8f0; 
            padding: 12px; 
            border-radius: 6px;
          }
          .info-title { 
            font-weight: bold; 
            color: #22c55e; 
            margin-bottom: 8px; 
            font-size: 14px;
            border-bottom: 1px solid #22c55e;
            padding-bottom: 4px;
          }
          .info-value { margin-bottom: 4px; font-size: 12px; }
          .info-label { font-weight: 600; color: #555; }
          .status { 
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 11px; 
            font-weight: bold; 
            display: inline-block;
          }
          .status-aprovado { background: #dcfce7; color: #166534; }
          .status-aguardando { background: #fef3c7; color: #92400e; }
          .status-em-análise { background: #dbeafe; color: #1e40af; }
          .status-rejeitado { background: #fecaca; color: #991b1b; }
          .status-vencido { background: #e5e7eb; color: #374151; }
          .items-section { margin: 15px 0; }
          .items-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #22c55e; 
            margin-bottom: 10px;
            text-align: center;
            background: #f0fdf4;
            padding: 8px;
            border-radius: 6px;
            border: 1px solid #22c55e;
          }
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 10px 0;
            font-size: 12px;
          }
          .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left;
          }
          .items-table th { 
            background: #22c55e; 
            font-weight: bold; 
            color: white;
            font-size: 11px;
          }
          .items-table tbody tr:nth-child(even) { background: #f9f9f9; }
          .items-table tfoot td { 
            font-weight: bold; 
            background: #f0fdf4; 
            font-size: 13px;
            color: #166534;
          }
          .total-value { font-size: 16px; color: #22c55e; font-weight: bold; }
          .compact-box { 
            background: #f8f9fa; 
            border: 1px solid #ddd; 
            padding: 10px; 
            border-radius: 6px; 
            margin: 10px 0;
            font-size: 12px;
          }
          .box-title { 
            font-weight: bold; 
            color: #22c55e; 
            margin-bottom: 6px; 
            font-size: 13px;
          }
          .footer { 
            margin-top: 20px; 
            border-top: 2px solid #22c55e; 
            padding-top: 10px; 
            text-align: center; 
            font-size: 10px; 
            color: #666;
          }
          .footer-grid {
            display: grid; 
            grid-template-columns: 1fr 1fr 1fr; 
            gap: 10px; 
            text-align: center; 
            margin-bottom: 10px;
            font-size: 11px;
          }
          .validity-warning { color: #dc2626; font-weight: bold; }
          @media print {
            body { margin: 10px !important; font-size: 12px !important; }
            .container { max-width: none !important; }
            .page-break { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Cabeçalho compacto -->
          <div class="header">
            <div class="company-name">🌳 BRIMU</div>
            <div class="company-info">Serviços de Arborização Profissional | 📧 contato@brimu.com | 📞 (11) 99999-0000</div>
          </div>

          <div class="document-title">ORÇAMENTO ${orcamento.numero}</div>

          <!-- Grid com 3 colunas para otimizar espaço -->
          <div class="info-grid-3">
            <div class="info-box">
              <div class="info-title">CLIENTE</div>
              <div class="info-value"><strong>${orcamento.cliente}</strong></div>
              <div class="info-value">${orcamento.servico}</div>
              <div class="info-value">${orcamento.dataSolicitacao}</div>
            </div>
            <div class="info-box">
              <div class="info-title">VALIDADE & STATUS</div>
              <div class="info-value">
                Válido até: <span class="${new Date(orcamento.dataValidade?.split('/').reverse().join('-')) < new Date() ? 'validity-warning' : ''}">${orcamento.dataValidade}</span>
              </div>
              <div class="info-value">
                Status: <span class="status status-${orcamento.status.toLowerCase().replace(' ', '-').replace('ã', 'a').replace('á', 'a')}">${orcamento.status}</span>
              </div>
            </div>
            <div class="info-box">
              <div class="info-title">EXECUÇÃO</div>
              <div class="info-value">Prazo: ${orcamento.prazoExecucao}</div>
              <div class="info-value">Técnico: ${orcamento.responsavel}</div>
              <div class="total-value">R$ ${orcamento.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
            </div>
          </div>

          <!-- Tabela de serviços -->
          <div class="items-section">
            <div class="items-title">DETALHAMENTO DOS SERVIÇOS</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 8%">#</th>
                  <th style="width: 52%">Descrição do Serviço</th>
                  <th style="width: 10%; text-align: center">Qtd</th>
                  <th style="width: 15%; text-align: right">Valor Unit.</th>
                  <th style="width: 15%; text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orcamento.itens.map((item, index) => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                    <td>${item.descricao}</td>
                    <td style="text-align: center;">${item.quantidade}</td>
                    <td style="text-align: right;">R$ ${item.valorUnitario.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    <td style="text-align: right; font-weight: bold;">R$ ${item.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="text-align: right; font-weight: normal;">SUBTOTAL:</td>
                  <td style="text-align: right; font-weight: bold;">
                    R$ ${(orcamento.valorSubtotal || orcamento.valorTotal).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </td>
                </tr>
                ${orcamento.desconto && orcamento.desconto.valor > 0 ? `
                <tr>
                  <td colspan="4" style="text-align: right; color: #dc2626;">
                    DESCONTO ${orcamento.desconto.tipo === 'percentual' ? `(${orcamento.desconto.valor}%)` : ''}:
                    ${orcamento.desconto.motivo ? `<br><small style="font-size: 10px;">${orcamento.desconto.motivo}</small>` : ''}
                  </td>
                  <td style="text-align: right; color: #dc2626; font-weight: bold;">
                    - R$ ${calcularDesconto(orcamento.valorSubtotal || orcamento.valorTotal, orcamento.desconto).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #22c55e;">
                  <td colspan="4" style="text-align: right; font-weight: bold; font-size: 14px;">VALOR TOTAL:</td>
                  <td style="text-align: right;" class="total-value">
                    R$ ${orcamento.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Seção de condições e observações em 2 colunas -->
          <div class="info-grid">
            <div class="compact-box">
              <div class="box-title">CONDIÇÕES DE PAGAMENTO</div>
              <p style="margin: 0;">${orcamento.condicoesPagamento}</p>
            </div>
            
            ${orcamento.observacoes ? `
            <div class="compact-box">
              <div class="box-title">OBSERVAÇÕES</div>
              <p style="margin: 0;">${orcamento.observacoes}</p>
            </div>
            ` : `
            <div class="compact-box">
              <div class="box-title">INFORMAÇÕES IMPORTANTES</div>
              <div style="font-size: 11px;">
                • Valores incluem mão de obra e materiais<br>
                • Serviços adicionais cobrados separadamente<br>
                • Execução sujeita às condições climáticas
              </div>
            </div>
            `}
          </div>

          <!-- Footer compacto -->
          <div class="footer">
            <div class="footer-grid">
              <div><strong>E-mail:</strong> contato@brimu.com</div>
              <div><strong>Telefone:</strong> (11) 99999-0000</div>
              <div><strong>CNPJ:</strong> 00.000.000/0001-00</div>
            </div>
            <div style="font-size: 10px; margin-top: 8px;">
              <strong>Brimu Serviços de Arborização Ltda.</strong> - Rua das Árvores, 123 - São Paulo/SP<br>
              Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    // Criar um elemento temporário para renderizar o HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    tempDiv.style.position = 'fixed'
    tempDiv.style.left = '-9999px'
    tempDiv.style.top = '-9999px'
    document.body.appendChild(tempDiv)

    // Usar a API de impressão do navegador para gerar PDF
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print()
      setTimeout(() => {
        printWindow.close()
        document.body.removeChild(tempDiv)
      }, 100)
    }
  }

  // Funções de Arquivos
  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop()
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="text-green-500" />
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" />
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-600" />
      default:
        return <FaFile className="text-gray-500" />
    }
  }

  const handleFileUpload = (files, itemId, section) => {
    const fileList = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadDate: new Date().toLocaleDateString('pt-BR')
    }))

    // Atualizar estado com arquivos
    const key = `${section}_${itemId}`
    setUploadedFiles(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), ...fileList]
    }))

    // Atualizar o item com referência aos arquivos
    switch(section) {
      case 'clientes':
        setClientes(clientes.map(c => 
          c.id === itemId ? {...c, documentos: [...(c.documentos || []), ...fileList]} : c
        ))
        break
      case 'ordens':
        setOrdens(ordens.map(o => 
          o.id === itemId ? {...o, anexos: [...(o.anexos || []), ...fileList]} : o
        ))
        break
      case 'equipamentos':
        setEquipamentos(equipamentos.map(e => 
          e.id === itemId ? {...e, manuais: [...(e.manuais || []), ...fileList]} : e
        ))
        break
    }

    alert(`${fileList.length} arquivo(s) enviado(s) com sucesso!`)
  }

  const handleFileDownload = (file) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.click()
  }

  const handleFileDelete = (fileId, itemId, section) => {
    const key = `${section}_${itemId}`
    const updatedFiles = uploadedFiles[key]?.filter(f => f.id !== fileId) || []
    
    setUploadedFiles(prev => ({
      ...prev,
      [key]: updatedFiles
    }))

    // Atualizar item
    switch(section) {
      case 'clientes':
        setClientes(clientes.map(c => 
          c.id === itemId ? {...c, documentos: updatedFiles} : c
        ))
        break
      case 'ordens':
        setOrdens(ordens.map(o => 
          o.id === itemId ? {...o, anexos: updatedFiles} : o
        ))
        break
      case 'equipamentos':
        setEquipamentos(equipamentos.map(e => 
          e.id === itemId ? {...e, manuais: updatedFiles} : e
        ))
        break
    }
  }

  // Funções de Export/Import
  const handleExport = (section) => {
    let data = []
    switch(section) {
      case 'clientes':
        data = clientes
        break
      case 'ordens':
        data = ordens
        break
      case 'equipamentos':
        data = equipamentos
        break
      case 'agendamentos':
        data = agendamentos
        break
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${section}_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const handleImport = (section) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      
      // Se for JSON, importar dados
      const jsonFiles = files.filter(f => f.name.endsWith('.json'))
      const otherFiles = files.filter(f => !f.name.endsWith('.json'))
      
      // Processar JSONs
      jsonFiles.forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const importedData = JSON.parse(e.target.result)
            
            switch(section) {
              case 'clientes':
                setClientes([...clientes, ...importedData])
                break
              case 'ordens':
                setOrdens([...ordens, ...importedData])
                break
              case 'equipamentos':
                setEquipamentos([...equipamentos, ...importedData])
                break
              case 'agendamentos':
                setAgendamentos([...agendamentos, ...importedData])
                break
            }
            alert('Dados JSON importados com sucesso!')
          } catch (error) {
            alert('Erro ao importar arquivo JSON: ' + error.message)
          }
        }
        reader.readAsText(file)
      })

      // Processar outros arquivos
      if (otherFiles.length > 0) {
        const fileList = otherFiles.map(file => ({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadDate: new Date().toLocaleDateString('pt-BR')
        }))

        // Adicionar aos arquivos gerais
        const key = `${section}_general`
        setUploadedFiles(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), ...fileList]
        }))

        alert(`${otherFiles.length} arquivo(s) importado(s) com sucesso!`)
      }
    }
    input.click()
  }

  // Componente Modal
  const Modal = () => {
    if (!showModal) return null

    const getModalTitle = () => {
      const actions = {
        create: 'Criar Novo',
        edit: 'Editar',
        view: 'Visualizar',
        delete: 'Excluir'
      }
      return actions[modalType] || 'Modal'
    }

    const renderFormFields = () => {
      switch(activeSection) {
        case 'clients':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input
                  type="tel"
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status || 'Ativo'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              
              {/* Upload de Documentos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentos do Cliente
                </label>
                {modalType !== 'view' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        if (e.target.files.length > 0 && selectedItem) {
                          handleFileUpload(e.target.files, selectedItem.id, 'clientes')
                        }
                      }}
                      className="hidden"
                      id="file-upload-client"
                    />
                    <label
                      htmlFor="file-upload-client"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCloud className="text-4xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Clique para enviar arquivos ou arraste aqui
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PDF, Imagens, Word, Excel
                      </span>
                    </label>
                  </div>
                )}
                
                {/* Lista de Arquivos */}
                {selectedItem?.documentos?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Arquivos anexados:</h4>
                    {selectedItem.documentos.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.name)}
                          <div>
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({(file.size / 1024).toFixed(1)} KB - {file.uploadDate})
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFileDownload(file)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Baixar"
                          >
                            <FaDownload />
                          </button>
                          {modalType !== 'view' && (
                            <button
                              onClick={() => handleFileDelete(file.id, selectedItem.id, 'clientes')}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        case 'orders':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <input
                  type="text"
                  value={formData.cliente || ''}
                  onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Serviço</label>
                <select
                  value={formData.servico || ''}
                  onChange={(e) => setFormData({...formData, servico: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                >
                  <option value="">Selecione um serviço</option>
                  <option value="Poda de Árvores">Poda de Árvores</option>
                  <option value="Remoção de Toco">Remoção de Toco</option>
                  <option value="Plantio de Mudas">Plantio de Mudas</option>
                  <option value="Limpeza de Terreno">Limpeza de Terreno</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor || ''}
                  onChange={(e) => setFormData({...formData, valor: parseFloat(e.target.value)})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={formData.data || ''}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                >
                  <option value="">Selecione o status</option>
                  <option value="Agendado">Agendado</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              
              {/* Upload de Anexos para Ordens */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexos da Ordem de Serviço
                </label>
                {modalType !== 'view' && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        if (e.target.files.length > 0 && selectedItem) {
                          handleFileUpload(e.target.files, selectedItem.id, 'ordens')
                        }
                      }}
                      className="hidden"
                      id="file-upload-order"
                    />
                    <label
                      htmlFor="file-upload-order"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCloud className="text-4xl text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Fotos do serviço, relatórios, orçamentos
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PDF, Imagens, Word, Excel
                      </span>
                    </label>
                  </div>
                )}
                
                {/* Lista de Anexos */}
                {selectedItem?.anexos?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Anexos:</h4>
                    {selectedItem.anexos.map((file) => (
                      <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(file.name)}
                          <div>
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500 ml-2">
                              ({(file.size / 1024).toFixed(1)} KB - {file.uploadDate})
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleFileDownload(file)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Baixar"
                          >
                            <FaDownload />
                          </button>
                          {modalType !== 'view' && (
                            <button
                              onClick={() => handleFileDelete(file.id, selectedItem.id, 'ordens')}
                              className="text-red-600 hover:text-red-800"
                              title="Excluir"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        case 'equipment':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Equipamento</label>
                <input
                  type="text"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                  value={formData.tipo || ''}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                >
                  <option value="">Selecione o tipo</option>
                  <option value="Motosserra">Motosserra</option>
                  <option value="Veículo">Veículo</option>
                  <option value="Ferramenta">Ferramenta</option>
                  <option value="Equipamento Pesado">Equipamento Pesado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  disabled={modalType === 'view'}
                >
                  <option value="">Selecione o status</option>
                  <option value="Disponível">Disponível</option>
                  <option value="Em Uso">Em Uso</option>
                  <option value="Manutenção">Manutenção</option>
                </select>
              </div>
            </div>
          )
        case 'quotes':
          return (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
              {/* Cabeçalho do Orçamento */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <FaFileInvoiceDollar className="mr-2" />
                  Informações Gerais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número do Orçamento *</label>
                    <input
                      type="text"
                      value={formData.numero || `ORC-2025-${String(Date.now()).slice(-3)}`}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                      disabled={modalType === 'view'}
                      placeholder="Ex: ORC-2025-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente *</label>
                    <select
                      value={formData.cliente || ''}
                      onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                      disabled={modalType === 'view'}
                    >
                      <option value="">Selecione o cliente</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.nome}>{cliente.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Detalhes do Serviço */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <FaTools className="mr-2" />
                  Detalhes do Serviço
                </h3>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Serviço *</label>
                  <select
                    value={formData.servico || ''}
                    onChange={(e) => setFormData({...formData, servico: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    disabled={modalType === 'view'}
                  >
                    <option value="">Selecione o serviço</option>
                    <option value="Poda de Árvores">🌳 Poda de Árvores</option>
                    <option value="Remoção de Toco">🪓 Remoção de Toco</option>
                    <option value="Plantio de Mudas">🌱 Plantio de Mudas</option>
                    <option value="Limpeza de Terreno">🧹 Limpeza de Terreno</option>
                    <option value="Consultoria Ambiental">📋 Consultoria Ambiental</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data de Validade *</label>
                    <input
                      type="date"
                      value={formData.dataValidade || ''}
                      onChange={(e) => setFormData({...formData, dataValidade: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      disabled={modalType === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo de Execução</label>
                    <input
                      type="text"
                      value={formData.prazoExecucao || ''}
                      onChange={(e) => setFormData({...formData, prazoExecucao: e.target.value})}
                      placeholder="Ex: 5 dias úteis"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      disabled={modalType === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Responsável Técnico</label>
                    <input
                      type="text"
                      value={formData.responsavel || ''}
                      onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      disabled={modalType === 'view'}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>
              </div>

              {/* Itens do Orçamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Itens do Orçamento</label>
                {(formData.itens || [{descricao: '', quantidade: 1, valorUnitario: 0}]).map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Descrição do serviço"
                        value={item.descricao || ''}
                        onChange={(e) => {
                          const newItens = [...(formData.itens || [])]
                          newItens[index] = {...item, descricao: e.target.value}
                          setFormData({...formData, itens: newItens})
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                        disabled={modalType === 'view'}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="Qtd"
                        value={item.quantidade || 1}
                        onChange={(e) => {
                          const newItens = [...(formData.itens || [])]
                          const quantidade = parseFloat(e.target.value) || 1
                          const valorTotal = quantidade * (item.valorUnitario || 0)
                          newItens[index] = {...item, quantidade, valorTotal}
                          setFormData({...formData, itens: newItens})
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                        disabled={modalType === 'view'}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor Unit."
                        value={item.valorUnitario || 0}
                        onChange={(e) => {
                          const newItens = [...(formData.itens || [])]
                          const valorUnitario = parseFloat(e.target.value) || 0
                          const valorTotal = (item.quantidade || 1) * valorUnitario
                          newItens[index] = {...item, valorUnitario, valorTotal}
                          setFormData({...formData, itens: newItens})
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                        disabled={modalType === 'view'}
                      />
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium">
                        R$ {((item.quantidade || 1) * (item.valorUnitario || 0)).toFixed(2)}
                      </span>
                      {modalType !== 'view' && index > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newItens = formData.itens.filter((_, i) => i !== index)
                            setFormData({...formData, itens: newItens})
                          }}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <FaTrash size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {modalType !== 'view' && (
                  <button
                    type="button"
                    onClick={() => {
                      const newItens = [...(formData.itens || []), {descricao: '', quantidade: 1, valorUnitario: 0, valorTotal: 0}]
                      setFormData({...formData, itens: newItens})
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Adicionar Item
                  </button>
                )}

                {/* Seção de Descontos */}
                <div className="mt-4 p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
                  <h4 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                    💸 Sistema de Desconto
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Desconto</label>
                      <select
                        value={formData.desconto?.tipo || 'percentual'}
                        onChange={(e) => {
                          const newDesconto = { ...(formData.desconto || {}), tipo: e.target.value }
                          const updatedData = atualizarCalculosOrcamento({...formData, desconto: newDesconto})
                          setFormData(updatedData)
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        disabled={modalType === 'view'}
                      >
                        <option value="percentual">Percentual (%)</option>
                        <option value="valor">Valor Fixo (R$)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valor do Desconto {formData.desconto?.tipo === 'percentual' ? '(%)' : '(R$)'}
                      </label>
                      <input
                        type="number"
                        step={formData.desconto?.tipo === 'percentual' ? '0.1' : '0.01'}
                        value={formData.desconto?.valor || 0}
                        onChange={(e) => {
                          const newDesconto = { ...(formData.desconto || {}), valor: parseFloat(e.target.value) || 0 }
                          const updatedData = atualizarCalculosOrcamento({...formData, desconto: newDesconto})
                          setFormData(updatedData)
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        disabled={modalType === 'view'}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo do Desconto</label>
                      <input
                        type="text"
                        value={formData.desconto?.motivo || ''}
                        onChange={(e) => {
                          const newDesconto = { ...(formData.desconto || {}), motivo: e.target.value }
                          setFormData({...formData, desconto: newDesconto})
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                        disabled={modalType === 'view'}
                        placeholder="Ex: Cliente fidelidade"
                      />
                    </div>
                  </div>

                  {/* Resumo Financeiro */}
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border-2 border-green-300">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-md font-medium text-gray-700">Subtotal:</span>
                        <span className="text-lg font-bold text-gray-800">
                          R$ {((formData.itens || []).reduce((sum, item) => sum + ((item.quantidade || 1) * (item.valorUnitario || 0)), 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </span>
                      </div>
                      
                      {formData.desconto && formData.desconto.valor > 0 && (
                        <div className="flex items-center justify-between text-red-600">
                          <span className="text-md font-medium">
                            Desconto {formData.desconto.tipo === 'percentual' ? `(${formData.desconto.valor}%)` : ''}:
                            {formData.desconto.motivo && (
                              <div className="text-xs text-red-500">{formData.desconto.motivo}</div>
                            )}
                          </span>
                          <span className="text-lg font-bold">
                            - R$ {calcularDesconto(
                              (formData.itens || []).reduce((sum, item) => sum + ((item.quantidade || 1) * (item.valorUnitario || 0)), 0),
                              formData.desconto
                            ).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      )}
                      
                      <div className="border-t-2 border-green-400 pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-700">VALOR TOTAL:</span>
                          <span className="text-2xl font-bold text-green-600">
                            R$ {calcularValorTotal(
                              (formData.itens || []).reduce((sum, item) => sum + ((item.quantidade || 1) * (item.valorUnitario || 0)), 0),
                              formData.desconto
                            ).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Condições e Observações */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                  <FaFileInvoiceDollar className="mr-2" />
                  Condições e Observações
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Condições de Pagamento *</label>
                    <input
                      type="text"
                      value={formData.condicoesPagamento || ''}
                      onChange={(e) => setFormData({...formData, condicoesPagamento: e.target.value})}
                      placeholder="Ex: 50% entrada + 50% na conclusão"
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all"
                      disabled={modalType === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observações</label>
                    <textarea
                      value={formData.observacoes || ''}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      rows={4}
                      placeholder="Observações adicionais sobre o orçamento, garantias, condições especiais, etc..."
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all resize-none"
                      disabled={modalType === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status do Orçamento</label>
                    <select
                      value={formData.status || 'Em Análise'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all"
                      disabled={modalType === 'view'}
                    >
                      <option value="Em Análise">🔍 Em Análise</option>
                      <option value="Aguardando">⏳ Aguardando Cliente</option>
                      <option value="Aprovado">✅ Aprovado</option>
                      <option value="Rejeitado">❌ Rejeitado</option>
                      <option value="Vencido">⏰ Vencido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload de Anexos para Orçamentos */}
              {modalType !== 'view' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anexos do Orçamento
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => {
                        if (e.target.files.length > 0 && selectedItem) {
                          handleFileUpload(e.target.files, selectedItem.id, 'orcamentos')
                        }
                      }}
                      className="hidden"
                      id="file-upload-quote"
                    />
                    <label
                      htmlFor="file-upload-quote"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaCloud className="text-2xl text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Plantas, fotos, especificações técnicas</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )
        
        case 'payment':
          return (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
              {/* Cabeçalho do Pagamento */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                  <FaFileInvoiceDollar className="mr-2" />
                  Gerenciar Pagamento - Orçamento {selectedItem?.numero}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Cliente:</span> {selectedItem?.cliente}
                  </div>
                  <div>
                    <span className="font-semibold">Serviço:</span> {selectedItem?.servico}
                  </div>
                  <div>
                    <span className="font-semibold">Valor Total:</span> 
                    <span className="text-lg font-bold text-green-600 ml-2">
                      R$ {selectedItem?.valorTotal?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Atual do Pagamento */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="text-md font-semibold text-blue-800 mb-3">Status Atual do Pagamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Status:</span>
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                      selectedItem?.pagamento?.status === 'Pago' ? 'bg-green-100 text-green-800' :
                      selectedItem?.pagamento?.status === 'Parcial' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedItem?.pagamento?.status || 'Pendente'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Valor Pago:</span>
                    <span className="ml-2 font-semibold">
                      R$ {(selectedItem?.pagamento?.valorPago || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
                {selectedItem?.pagamento?.dataPagamento && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Data do Pagamento:</span>
                    <span className="ml-2">{selectedItem?.pagamento?.dataPagamento}</span>
                  </div>
                )}
              </div>

              {/* Formulário de Pagamento */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="text-md font-semibold text-green-800 mb-3">Registrar Novo Pagamento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Método de Pagamento *</label>
                    <select
                      value={formData.metodo || ''}
                      onChange={(e) => setFormData({...formData, metodo: e.target.value})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                    >
                      <option value="">Selecione o método</option>
                      <option value="Dinheiro">💵 Dinheiro</option>
                      <option value="PIX">📱 PIX</option>
                      <option value="Cartão Débito">💳 Cartão de Débito</option>
                      <option value="Cartão Crédito">💳 Cartão de Crédito</option>
                      <option value="Transferência">🏦 Transferência Bancária</option>
                      <option value="Cheque">📄 Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor a Pagar *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valorPago || ''}
                      onChange={(e) => setFormData({...formData, valorPago: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                      placeholder="0,00"
                      max={selectedItem?.valorTotal || 0}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Observações do Pagamento</label>
                  <textarea
                    value={formData.observacoesPagamento || ''}
                    onChange={(e) => setFormData({...formData, observacoesPagamento: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="Observações sobre o pagamento (opcional)"
                  />
                </div>

                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor restante após este pagamento:</span>
                    <span className="font-bold text-red-600">
                      R$ {Math.max(0, (selectedItem?.valorTotal || 0) - (selectedItem?.pagamento?.valorPago || 0) - (formData.valorPago || 0)).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        
        default:
          return <div>Formulário não disponível para esta seção</div>
      }
    }

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className={`relative top-10 mx-auto p-5 border shadow-lg rounded-md bg-white ${
          activeSection === 'quotes' ? 'w-4/5 max-w-4xl' : 'w-96'
        }`}>
          <div className="mt-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{getModalTitle()}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            {modalType !== 'view' ? renderFormFields() : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {selectedItem && activeSection === 'quotes' ? (
                  // Visualização especial para orçamentos
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Número:</span>
                        <p className="text-lg font-bold text-blue-600">{selectedItem.numero}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedItem.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                          selectedItem.status === 'Aguardando' ? 'bg-yellow-100 text-yellow-800' :
                          selectedItem.status === 'Em Análise' ? 'bg-blue-100 text-blue-800' :
                          selectedItem.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedItem.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Cliente:</span>
                        <p>{selectedItem.cliente}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Serviço:</span>
                        <p>{selectedItem.servico}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Data Solicitação:</span>
                        <p>{selectedItem.dataSolicitacao}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Data Validade:</span>
                        <p className={new Date(selectedItem.dataValidade?.split('/').reverse().join('-')) < new Date() ? 'text-red-600 font-medium' : ''}>
                          {selectedItem.dataValidade}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-700">Prazo Execução:</span>
                        <p>{selectedItem.prazoExecucao}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Responsável:</span>
                        <p>{selectedItem.responsavel}</p>
                      </div>
                    </div>

                    {/* Itens do Orçamento */}
                    <div>
                      <span className="font-medium text-gray-700">Itens do Orçamento:</span>
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Descrição</th>
                              <th className="px-3 py-2 text-center font-medium text-gray-500">Qtd</th>
                              <th className="px-3 py-2 text-right font-medium text-gray-500">Valor Unit.</th>
                              <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedItem.itens?.map((item, index) => (
                              <tr key={index} className="bg-white">
                                <td className="px-3 py-2">{item.descricao}</td>
                                <td className="px-3 py-2 text-center">{item.quantidade}</td>
                                <td className="px-3 py-2 text-right">R$ {item.valorUnitario?.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-medium">R$ {item.valorTotal?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan="3" className="px-3 py-2 text-right font-bold">TOTAL:</td>
                              <td className="px-3 py-2 text-right font-bold text-lg text-green-600">
                                R$ {selectedItem.valorTotal?.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Condições de Pagamento:</span>
                      <p className="mt-1 p-2 bg-blue-50 rounded text-sm">{selectedItem.condicoesPagamento}</p>
                    </div>

                    {selectedItem.observacoes && (
                      <div>
                        <span className="font-medium text-gray-700">Observações:</span>
                        <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{selectedItem.observacoes}</p>
                      </div>
                    )}

                    {/* Arquivos anexados */}
                    {selectedItem.anexos?.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Anexos:</span>
                        <div className="mt-2 space-y-2">
                          {selectedItem.anexos.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(file.name)}
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <button
                                onClick={() => handleFileDownload(file)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <FaDownload />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Visualização padrão para outros itens
                  <div className="space-y-2">
                    {selectedItem && Object.entries(selectedItem).map(([key, value]) => (
                      key !== 'id' && key !== 'itens' && key !== 'anexos' && key !== 'documentos' && key !== 'manuais' && (
                        <div key={key}>
                          <span className="font-medium capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}:</span> 
                          <span className="ml-2">
                            {Array.isArray(value) ? `${value.length} item(s)` : String(value)}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              {modalType !== 'view' && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
                >
                  <FaSave />
                  <span>Salvar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const menuItems = isAdmin ? [
    { id: 'overview', label: 'Visão Geral', icon: FaHome },
    { id: 'clients', label: 'Clientes', icon: FaUsers },
    { id: 'orders', label: 'Ordens de Serviço', icon: FaClipboardList },
    { id: 'quotes', label: 'Orçamentos', icon: FaFileInvoiceDollar },
    { id: 'calendar', label: 'Calendário', icon: FaCalendarAlt },
    { id: 'equipment', label: 'Equipamentos', icon: FaTools },
    { id: 'settings', label: 'Configurações', icon: FaCog }
  ] : [
    { id: 'overview', label: 'Meu Dashboard', icon: FaHome },
    { id: 'myorders', label: 'Meus Serviços', icon: FaClipboardList },
    { id: 'quotes', label: 'Orçamentos', icon: FaFileInvoiceDollar },
    { id: 'profile', label: 'Meu Perfil', icon: FaUser }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaUsers className="text-3xl text-blue-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentData.overview.totalClientes}</h3>
                  <p className="text-gray-600">Total de Clientes</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaClipboardList className="text-3xl text-green-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentData.overview.ordemesAtivas}</h3>
                  <p className="text-gray-600">Ordens Ativas</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaFileInvoiceDollar className="text-3xl text-yellow-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">R$ {currentData.overview.faturamentoMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  <p className="text-gray-600">Faturamento Mensal</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaTree className="text-3xl text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentData.overview.servicosCompletos}</h3>
                  <p className="text-gray-600">Serviços Completos</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaClipboardList className="text-3xl text-blue-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentData.overview.servicosSolicitados}</h3>
                  <p className="text-gray-600">Serviços Solicitados</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaTree className="text-3xl text-green-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentData.overview.servicosCompletos}</h3>
                  <p className="text-gray-600">Serviços Completos</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaCalendarAlt className="text-3xl text-yellow-500 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{currentData.overview.proximoAgendamento}</h3>
                  <p className="text-gray-600">Próximo Agendamento</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FaFileInvoiceDollar className="text-3xl text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">R$ {currentData.overview.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                  <p className="text-gray-600">Valor Total Investido</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabela de Ordens Recentes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isAdmin ? 'Ordens Recentes' : 'Meus Serviços'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isAdmin ? 'Cliente' : 'Serviço'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isAdmin ? 'Serviço' : 'Data'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(isAdmin ? currentData.recentOrders : currentData.myOrders).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {isAdmin ? item.cliente : item.servico}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isAdmin ? item.servico : item.data}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      item.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {item.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FaEye />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FaEdit />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Meus Serviços (Cliente)
  const renderMyOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Meus Serviços</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <FaPlus />
          <span>Solicitar Serviço</span>
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.myOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.servico}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.data}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      order.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {order.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900"><FaEye /></button>
                    <button className="text-green-600 hover:text-green-900"><FaEdit /></button>
                    <button className="text-gray-600 hover:text-gray-900"><FaDownload /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Orçamentos (Para Admin e Cliente)
  const renderQuotes = () => {
    // Filtrar orçamentos baseado no usuário
    const filteredOrcamentos = isAdmin ? orcamentos : orcamentos.filter(o => o.cliente === user?.name)
    
    // Calcular estatísticas
    const totalOrcamentos = filteredOrcamentos.length
    const aprovados = filteredOrcamentos.filter(o => o.status === 'Aprovado').length
    const aguardando = filteredOrcamentos.filter(o => o.status === 'Aguardando').length
    const emAnalise = filteredOrcamentos.filter(o => o.status === 'Em Análise').length
    const valorTotal = filteredOrcamentos.reduce((sum, o) => sum + o.valorTotal, 0)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {isAdmin ? 'Gestão de Orçamentos' : 'Meus Orçamentos'}
          </h2>
          <button 
            onClick={() => handleCreate('quotes')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center space-x-2 shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <FaPlus />
            <span>{isAdmin ? 'Novo Orçamento' : 'Solicitar Orçamento'}</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaFileInvoiceDollar className="text-3xl text-blue-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{totalOrcamentos}</h3>
                <p className="text-gray-600">{isAdmin ? 'Total de Orçamentos' : 'Orçamentos Solicitados'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaFileInvoiceDollar className="text-3xl text-green-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{aprovados}</h3>
                <p className="text-gray-600">Aprovados</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaFileInvoiceDollar className="text-3xl text-yellow-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{aguardando}</h3>
                <p className="text-gray-600">Aguardando Resposta</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FaFileInvoiceDollar className="text-3xl text-purple-500 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">R$ {valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h3>
                <p className="text-gray-600">Valor Total</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {isAdmin ? 'Lista de Orçamentos' : 'Histórico de Orçamentos'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                  {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Solicitação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrcamentos.map((orcamento) => (
                  <tr key={orcamento.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-900">
                      {orcamento.numero}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orcamento.cliente}</td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orcamento.servico}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{orcamento.dataSolicitacao}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`${new Date(orcamento.dataValidade.split('/').reverse().join('-')) < new Date() ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                        {orcamento.dataValidade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          orcamento.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                          orcamento.status === 'Aguardando' ? 'bg-yellow-100 text-yellow-800' :
                          orcamento.status === 'Em Análise' ? 'bg-blue-100 text-blue-800' :
                          orcamento.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
                          orcamento.status === 'Pago' ? 'bg-green-100 text-green-800' :
                          orcamento.status === 'Convertido' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {orcamento.status}
                        </span>
                        {orcamento.pagamento && orcamento.pagamento.status !== 'Pendente' && (() => {
                          const valorTotal = orcamento.valorTotal || 0
                          const valorPago = orcamento.pagamento?.valorPago || 0
                          const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
                          const podeConverter = percentualPago >= 50
                          
                          return (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              orcamento.pagamento.status === 'Pago' ? 'bg-green-100 text-green-700' :
                              podeConverter ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              💳 {orcamento.pagamento.status}
                              {orcamento.pagamento.status === 'Parcial' && (
                                ` (${percentualPago.toFixed(0)}%)`
                              )}
                            </span>
                          )
                        })()}
                        {orcamento.ordemServico && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-700">
                            📋 OS Criada
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {orcamento.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button 
                        onClick={() => handleView(orcamento)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Visualizar Orçamento Completo"
                      >
                        <FaEye />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleEdit(orcamento, 'orcamentos')}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                      )}
                      <button 
                        onClick={() => generateOrcamentoPDF(orcamento)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Download Orçamento em PDF"
                      >
                        <FaFilePdf />
                      </button>

                      {/* Botão de Pagamento */}
                      {isAdmin && !orcamento.ordemServico && (!orcamento.pagamento || orcamento.pagamento.status !== 'Pago') && (
                        <button 
                          onClick={() => {
                            // Garantir que o orçamento tenha estrutura de pagamento
                            const orcamentoComPagamento = {
                              ...orcamento,
                              pagamento: orcamento.pagamento || {
                                status: 'Pendente',
                                metodo: '',
                                valorPago: 0,
                                dataPagamento: null,
                                comprovante: null
                              }
                            }
                            setSelectedItem(orcamentoComPagamento)
                            setModalType('payment')
                            setShowModal(true)
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Gerenciar Pagamento"
                        >
                          <FaFileInvoiceDollar />
                        </button>
                      )}

                      {/* Botão de Converter para Ordem */}
                      {(() => {
                        const valorTotal = orcamento.valorTotal || 0
                        const valorPago = orcamento.pagamento?.valorPago || 0
                        const percentualPago = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0
                        const temPagamentoSuficiente = percentualPago >= 50
                        
                        console.log(`Botão conversão - Orçamento ${orcamento.numero}:`, {
                          isAdmin,
                          status: orcamento.status,
                          valorTotal,
                          valorPago,
                          percentualPago,
                          temPagamentoSuficiente,
                          ordemServico: orcamento.ordemServico,
                          podeConverter: (orcamento.status === 'Aprovado' || temPagamentoSuficiente) && !orcamento.ordemServico
                        })
                        
                        return isAdmin && 
                               (orcamento.status === 'Aprovado' || temPagamentoSuficiente) && 
                               !orcamento.ordemServico
                      })() && (
                        <button 
                          onClick={() => converterParaOrdemServico(orcamento)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Converter para Ordem de Serviço"
                        >
                          <FaClipboardList />
                        </button>
                      )}

                      {/* Mostrar se já foi convertido */}
                      {orcamento.ordemServico && (
                        <span 
                          className="text-green-600"
                          title="Já convertido para Ordem de Serviço"
                        >
                          ✅
                        </span>
                      )}

                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(orcamento, 'orcamentos')}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // Renderizar seção de Perfil (Cliente)
  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Meu Perfil</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Pessoais</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input type="text" value={user?.name || ''} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={user?.email || ''} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone</label>
                <input type="tel" value="(11) 99999-9999" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <input type="text" value="01310-100" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Endereço</label>
                <input type="text" value="Av. Paulista, 1000" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade</label>
                  <input type="text" value="São Paulo" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <input type="text" value="SP" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Gestão de Clientes (Admin)
  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Gestão de Clientes</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleImport('clientes')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaUpload />
            <span>Importar</span>
          </button>
          <button 
            onClick={() => handleExport('clientes')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
          >
            <FaDownload />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => handleCreate('clients')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-3xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{clientes.length}</h3>
              <p className="text-gray-600">Total de Clientes</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-3xl text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">23</h3>
              <p className="text-gray-600">Clientes Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-3xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">8</h3>
              <p className="text-gray-600">Novos este Mês</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaUsers className="text-3xl text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">89%</h3>
              <p className="text-gray-600">Taxa de Retenção</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lista de Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.telefone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.ultimoServico}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {cliente.documentos?.length > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cliente.documentos.length} arquivo(s)
                      </span>
                    ) : (
                      <span className="text-gray-400">Nenhum</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cliente.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cliente.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleView(cliente)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleEdit(cliente, 'clientes')}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(cliente, 'clientes')}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Ordens de Serviço (Admin)
  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Ordens de Serviço</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleImport('ordens')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaUpload />
            <span>Importar</span>
          </button>
          <button 
            onClick={() => handleExport('ordens')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
          >
            <FaDownload />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => handleCreate('orders')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Nova Ordem</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaClipboardList className="text-3xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">23</h3>
              <p className="text-gray-600">Ordens Ativas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaClipboardList className="text-3xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">12</h3>
              <p className="text-gray-600">Em Andamento</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaClipboardList className="text-3xl text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">89</h3>
              <p className="text-gray-600">Concluídas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaClipboardList className="text-3xl text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">2</h3>
              <p className="text-gray-600">Atrasadas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ordens Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordens.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.cliente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.servico}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.data}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Concluído' ? 'bg-green-100 text-green-800' :
                      order.status === 'Em andamento' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {order.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleView(order)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleEdit(order, 'ordens')}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(order, 'ordens')}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Equipamentos (Admin)
  const renderEquipment = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Controle de Equipamentos</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => handleImport('equipamentos')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <FaUpload />
            <span>Importar</span>
          </button>
          <button 
            onClick={() => handleExport('equipamentos')}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
          >
            <FaDownload />
            <span>Exportar</span>
          </button>
          <button 
            onClick={() => handleCreate('equipment')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <FaPlus />
            <span>Novo Equipamento</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaTools className="text-3xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">45</h3>
              <p className="text-gray-600">Total de Equipamentos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaTools className="text-3xl text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">38</h3>
              <p className="text-gray-600">Disponíveis</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaTools className="text-3xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">7</h3>
              <p className="text-gray-600">Em Uso</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaTools className="text-3xl text-red-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">3</h3>
              <p className="text-gray-600">Manutenção</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lista de Equipamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Manutenção</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Próxima Manutenção</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipamentos.map((equipamento) => (
                <tr key={equipamento.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{equipamento.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipamento.tipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      equipamento.status === 'Disponível' ? 'bg-green-100 text-green-800' :
                      equipamento.status === 'Em Uso' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {equipamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipamento.ultimaManutencao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipamento.proximaManutencao}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleView(equipamento)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Visualizar"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleEdit(equipamento, 'equipamentos')}
                      className="text-green-600 hover:text-green-900"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(equipamento, 'equipamentos')}
                      className="text-red-600 hover:text-red-900"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Calendário (Admin)
  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Calendário de Serviços</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
          <FaPlus />
          <span>Novo Agendamento</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaCalendarAlt className="text-3xl text-blue-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">12</h3>
              <p className="text-gray-600">Agendamentos Hoje</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaCalendarAlt className="text-3xl text-green-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">45</h3>
              <p className="text-gray-600">Esta Semana</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaCalendarAlt className="text-3xl text-yellow-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">156</h3>
              <p className="text-gray-600">Este Mês</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <FaCalendarAlt className="text-3xl text-purple-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">98%</h3>
              <p className="text-gray-600">Taxa de Ocupação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Próximos Agendamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10/09/2025 08:00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">João Silva</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Poda de Árvores</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Equipe A</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Agendado</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900"><FaEye /></button>
                  <button className="text-green-600 hover:text-green-900"><FaEdit /></button>
                  <button className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">10/09/2025 14:00</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Maria Santos</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Remoção de Toco</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Equipe B</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Em andamento</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900"><FaEye /></button>
                  <button className="text-green-600 hover:text-green-900"><FaEdit /></button>
                  <button className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Renderizar seção de Configurações (Admin)
  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Configurações do Sistema</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações Gerais</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input type="text" value="Brimu - Serviços de Arborização" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email de Contato</label>
              <input type="email" value="contato@brimu.com" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="tel" value="(11) 99999-0000" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Notificações por Email</span>
              <input type="checkbox" checked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Backup Automático</span>
              <input type="checkbox" checked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Modo de Manutenção</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup e Segurança</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Fazer Backup Agora
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Exportar Dados
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            Logs do Sistema
          </button>
        </div>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview()
      case 'myorders':
        return renderMyOrders()
      case 'clients':
        return renderClients()
      case 'orders':
        return renderOrders()
      case 'quotes':
        return renderQuotes()
      case 'calendar':
        return renderCalendar()
      case 'equipment':
        return renderEquipment()
      case 'profile':
        return renderProfile()
      case 'settings':
        return renderSettings()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <FaTree className="text-2xl text-green-600" />
            {sidebarOpen && <span className="ml-2 text-xl font-bold text-gray-800">Brimu</span>}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                  activeSection === item.id ? 'bg-green-50 border-r-4 border-green-600 text-green-700' : 'text-gray-600'
                }`}
              >
                <Icon className="text-lg" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">
                {isAdmin ? 'Painel Administrativo' : 'Área do Cliente'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-gray-600" />
                <span className="text-gray-700">
                  {user?.name}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                Sair
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {renderSection()}
          </div>
        </main>
      </div>
      
      {/* Modal */}
      <Modal />
    </div>
  )
}

export default DashboardCompleto