import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaCalendarAlt,
  FaPlus,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaTools,
  FaFilter,
  FaSearch,
  FaEye,
  FaEdit,
  FaTimes,
  FaCheck,
  FaBan,
  FaWrench,
  FaGraduationCap,
  FaCog,
  FaCalendarWeek,
  FaCalendarDay,
  FaTh
} from 'react-icons/fa';
import { calendarAPI } from '../../services/api';

// Configurações dos tipos de eventos
const EVENT_TYPES = {
  ordem_servico: {
    label: 'Ordem de Serviço',
    icon: FaTools,
    color: '#3B82F6',
    shortLabel: 'OS'
  },
  manutencao: {
    label: 'Manutenção',
    icon: FaWrench,
    color: '#F59E0B',
    shortLabel: 'MAN'
  },
  manutencao_preventiva: {
    label: 'Manutenção Preventiva',
    icon: FaWrench,
    color: '#EF4444',
    shortLabel: 'PREV'
  },
  treinamento: {
    label: 'Treinamento',
    icon: FaGraduationCap,
    color: '#8B5CF6',
    shortLabel: 'TREI'
  },
  instalacao: {
    label: 'Instalação',
    icon: FaCog,
    color: '#10B981',
    shortLabel: 'INST'
  },
  inspecao: {
    label: 'Inspeção',
    icon: FaSearch,
    color: '#F97316',
    shortLabel: 'INSP'
  },
  evento_personalizado: {
    label: 'Evento Personalizado',
    icon: FaCalendarAlt,
    color: '#6B7280',
    shortLabel: 'EVT'
  }
};

const EVENT_STATUS = {
  agendado: { label: 'Agendado', color: '#6B7280' },
  confirmado: { label: 'Confirmado', color: '#10B981' },
  em_andamento: { label: 'Em Andamento', color: '#F59E0B' },
  concluido: { label: 'Concluído', color: '#6B7280' },
  cancelado: { label: 'Cancelado', color: '#EF4444' }
};

const PRIORITY_CONFIG = {
  critica: { label: 'Crítica', color: '#DC2626', ring: 'ring-red-500' },
  alta: { label: 'Alta', color: '#EA580C', ring: 'ring-orange-500' },
  media: { label: 'Média', color: '#CA8A04', ring: 'ring-yellow-500' },
  baixa: { label: 'Baixa', color: '#059669', ring: 'ring-green-500' }
};

// Componente do Card de Evento Otimizado
const EventCard = ({ event, onClick }) => {
  const eventType = EVENT_TYPES[event.type] || EVENT_TYPES.evento_personalizado;
  const Icon = eventType.icon;
  
  const startTime = new Date(event.startDate).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div
      onClick={() => onClick(event)}
      className="group relative p-2.5 mb-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm bg-white hover:bg-gray-50 border-l-4 animate-fade-in"
      style={{ borderLeftColor: eventType.color }}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="p-1 rounded-md" style={{ backgroundColor: `${eventType.color}15` }}>
              <Icon className="flex-shrink-0 w-3 h-3" style={{ color: eventType.color }} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{eventType.shortLabel}</span>
            <span className="text-xs text-gray-500 ml-auto">{startTime}</span>
          </div>
          <h3 className="text-xs font-semibold text-gray-900 truncate leading-tight" title={event.title}>
            {event.title}
          </h3>
          {event.location?.address && (
            <div className="flex items-center gap-1 mt-1">
              <FaMapMarkerAlt className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate" title={event.location.address}>
                {event.location.address.length > 20 ? 
                  `${event.location.address.substring(0, 20)}...` : 
                  event.location.address
                }
              </span>
            </div>
          )}
        </div>
        
        {/* Indicador de prioridade */}
        {event.priority && PRIORITY_CONFIG[event.priority] && (
          <div 
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: PRIORITY_CONFIG[event.priority].color }}
            title={`Prioridade: ${PRIORITY_CONFIG[event.priority].label}`}
          />
        )}
      </div>
    </div>
  );
};

// Componente da Célula do Dia
const DayCell = ({ date, events, isCurrentMonth, isToday, onClick, onEventClick }) => {
  const dayEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === date.toDateString();
  });

  return (
    <div 
      className={`relative min-h-[130px] border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 ${
        !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
      } ${isToday ? 'ring-2 ring-green-500 bg-green-50/30 border-green-300' : ''} ${dayEvents.length > 0 ? 'hover:shadow-sm' : ''}`}
    >
      <div className="p-2">
        <div className="flex items-center justify-between mb-3">
          <div className={`flex items-center justify-center w-7 h-7 rounded-full font-semibold text-sm transition-colors ${
            isToday 
              ? 'bg-green-600 text-white shadow-sm' 
              : isCurrentMonth 
                ? 'text-gray-900 hover:bg-gray-100' 
                : 'text-gray-400'
          }`}>
            {date.getDate()}
          </div>
          {dayEvents.length > 0 && (
            <span className="badge badge-primary animate-bounce-in">
              {dayEvents.length}
            </span>
          )}
        </div>
        
        <div className="space-y-1.5 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {dayEvents.slice(0, 3).map((event, index) => (
            <EventCard
              key={event._id || index}
              event={event}
              onClick={onEventClick}
            />
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500 text-center py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-md border border-gray-200">
              +{dayEvents.length - 3} mais eventos
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Principal do Calendário
const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [view, setView] = useState('month');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: ''
  });

  // Gerar calendário do mês atual
  const generateCalendar = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Domingo da primeira semana
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // Sábado da última semana
    
    const calendar = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  }, [currentDate]);

  // Carregar eventos
  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const params = {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        ...filters
      };

      const response = await calendarAPI.getAll(params);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, filters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Navegação do calendário
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Modal de evento
  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  const calendar = generateCalendar();
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-fixed section-padding">
        {/* Header */}
        <div className="card mb-6 animate-fade-in">
          <div className="card-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Título e navegação */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                    <FaCalendarAlt className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="page-title">Calendário</h1>
                    <p className="text-sm text-gray-600">Gerencie eventos e agendamentos</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="btn-nav"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-800 min-w-[160px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="btn-nav"
                  >
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="btn-secondary btn-sm"
                  >
                    Hoje
                  </button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="btn-filter"
                >
                  <option value="">Todos os tipos</option>
                  {Object.entries(EVENT_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>{type.label}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="btn-filter"
                >
                  <option value="">Todos os status</option>
                  {Object.entries(EVENT_STATUS).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="card animate-slide-up">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
            {dayNames.map((day, index) => (
              <div key={day} className="p-4 text-center" style={{animationDelay: `${index * 50}ms`}}>
                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{day}</span>
              </div>
            ))}
          </div>

          {/* Grid do calendário */}
          <div className="grid grid-cols-7">
            {calendar.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <DayCell
                  key={index}
                  date={date}
                  events={events}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                  onClick={() => {}}
                  onEventClick={showEventDetails}
                />
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Carregando eventos...</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="card-header">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${EVENT_TYPES[selectedEvent.type]?.color}15` }}>
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: EVENT_TYPES[selectedEvent.type]?.color || '#6B7280' }}
                    >
                      {React.createElement(EVENT_TYPES[selectedEvent.type]?.icon || FaCalendarAlt, { className: "w-3 h-3 text-white" })}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-sm text-gray-600 font-medium">{EVENT_TYPES[selectedEvent.type]?.label}</p>
                  </div>
                </div>
                <button
                  onClick={closeEventModal}
                  className="btn-icon-secondary"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

            </div>
            <div className="card-body">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaClock className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-900">Horário</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium ml-11">
                    {new Date(selectedEvent.startDate).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600 ml-11">
                    {new Date(selectedEvent.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedEvent.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {selectedEvent.location?.address && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FaMapMarkerAlt className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Local</span>
                    </div>
                    <p className="text-sm text-gray-700 ml-11 font-medium">{selectedEvent.location.address}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FaEdit className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Descrição</span>
                    </div>
                    <p className="text-sm text-gray-900 ml-6">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.assignedTo && selectedEvent.assignedTo.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FaUsers className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Equipe Atribuída</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {selectedEvent.assignedTo.map((assignment, index) => (
                        <div key={index} className="text-sm text-gray-900">
                          {assignment.user?.name || assignment.user} ({assignment.role})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${EVENT_STATUS[selectedEvent.status]?.color}20`,
                      color: EVENT_STATUS[selectedEvent.status]?.color
                    }}
                  >
                    {EVENT_STATUS[selectedEvent.status]?.label}
                  </span>
                  
                  {selectedEvent.priority && (
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        backgroundColor: `${PRIORITY_CONFIG[selectedEvent.priority]?.color}20`,
                        color: PRIORITY_CONFIG[selectedEvent.priority]?.color
                      }}
                    >
                      {PRIORITY_CONFIG[selectedEvent.priority]?.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;