import React, { useState } from 'react'
import { FaWhatsapp, FaEnvelope, FaTree, FaExclamationTriangle } from 'react-icons/fa'

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitAttempts, setSubmitAttempts] = useState(0)
  const [lastSubmitTime, setLastSubmitTime] = useState(0)

  // Sanitização de input para prevenir XSS
  const sanitizeInput = (input) => {
    if (typeof input !== 'string') return ''
    return input.trim()
      .replace(/[<>]/g, '') // Remove < e >
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000) // Limita tamanho
  }

  // Validação de email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Validação de telefone brasileiro
  const validatePhone = (phone) => {
    const re = /^\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/
    return re.test(phone.replace(/\s/g, ''))
  }

  // Validação de nome
  const validateName = (name) => {
    return name.trim().length >= 2 && name.trim().length <= 100
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    const sanitizedValue = sanitizeInput(value)
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }))
    
    // Limpar erro quando usuário digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Rate limiting - máximo 3 tentativas por minuto
    const now = Date.now()
    if (now - lastSubmitTime < 60000) { // 1 minuto
      if (submitAttempts >= 3) {
        setErrors({ submit: 'Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.' })
        return
      }
    } else {
      setSubmitAttempts(0)
    }
    
    setSubmitAttempts(prev => prev + 1)
    setLastSubmitTime(now)

    // Validações
    const newErrors = {}
    
    if (!validateName(formData.name)) {
      newErrors.name = 'Nome deve ter entre 2 e 100 caracteres'
    }
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido (formato: (11) 99999-9999)'
    }
    
    if (!formData.service) {
      newErrors.service = 'Selecione um serviço'
    }
    
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Mensagem deve ter pelo menos 10 caracteres'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Simular envio (substituir por API real)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setSubmitAttempts(0)
      
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({ name: '', email: '', phone: '', service: '', message: '' })
      }, 2500)
    } catch (error) {
      setIsSubmitting(false)
      setErrors({ submit: 'Erro ao enviar mensagem. Tente novamente.' })
    }
  }

  const contactInfo = [
    { icon: <FaWhatsapp className="text-2xl text-forest-600" />, title: 'WhatsApp', info: '(11) 95033-6105', link: 'https://wa.me/5511950336105' },
    { icon: <FaEnvelope className="text-2xl text-forest-600" />, title: 'E-mail', info: 'contato@brimu.com.br', link: 'mailto:contato@brimu.com.br' }
  ]

  const services = ['Corte de Árvores', 'Poda e Manutenção', 'Corte de Grama', 'Paisagismo', 'Outro']

  return (
    <section id="contact" className="section-padding bg-gradient-to-b from-white to-forest-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-forest-900 mb-4">
            Entre em Contato
          </h2>
          {/* Subtítulo removido */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulário */}
          <div className="glassmorphism p-8 rounded-2xl">
            <div className="flex items-center space-x-3 mb-8">
              <FaTree className="text-3xl text-forest-600" />
              <h3 className="text-2xl font-bold text-forest-800">Solicite seu Orçamento</h3>
            </div>

            {submitSuccess ? (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTree className="text-3xl text-forest-600" />
                </div>
                <h4 className="text-xl font-bold text-forest-800 mb-2">Mensagem Enviada!</h4>
                <p className="text-forest-600">Entraremos em contato em até 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mensagem de erro geral */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {errors.submit}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-forest-700 mb-2">Nome Completo *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                      maxLength={100}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                        errors.name ? 'border-red-300 focus:border-red-500' : 'border-forest-200 focus:border-forest-500'
                      }`} 
                      placeholder="Seu nome completo" 
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-forest-700 mb-2">E-mail *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      required 
                      maxLength={100}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                        errors.email ? 'border-red-300 focus:border-red-500' : 'border-forest-200 focus:border-forest-500'
                      }`} 
                      placeholder="seu@email.com" 
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-forest-700 mb-2">Telefone *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      required 
                      maxLength={15}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                        errors.phone ? 'border-red-300 focus:border-red-500' : 'border-forest-200 focus:border-forest-500'
                      }`} 
                      placeholder="(11) 99999-9999" 
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-forest-700 mb-2">Serviço de Interesse *</label>
                    <select 
                      id="service" 
                      name="service" 
                      value={formData.service} 
                      onChange={handleInputChange} 
                      required 
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 ${
                        errors.service ? 'border-red-300 focus:border-red-500' : 'border-forest-200 focus:border-forest-500'
                      }`}
                    >
                      <option value="">Selecione um serviço</option>
                      {services.map((service, index) => (<option key={index} value={service}>{service}</option>))}
                    </select>
                    {errors.service && <p className="mt-1 text-sm text-red-600">{errors.service}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-forest-700 mb-2">Mensagem *</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    required 
                    rows="4" 
                    maxLength={1000}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 resize-none ${
                      errors.message ? 'border-red-300 focus:border-red-500' : 'border-forest-200 focus:border-forest-500'
                    }`} 
                    placeholder="Descreva seu projeto ou solicitação..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  <p className="mt-1 text-xs text-gray-500">{formData.message.length}/1000 caracteres</p>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    isSubmitting ? 'bg-forest-400 text-white cursor-not-allowed' : 'btn-action'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
                <p className="text-sm text-forest-500 text-center">* Campos obrigatórios. Entraremos em contato em até 24 horas.</p>
              </form>
            )}
          </div>

          {/* Informações de Contato */}
          <div className="space-y-6">
            <div className="space-y-4">
              {contactInfo.map((item, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 card hover:shadow-xl">
                  <div className="flex-shrink-0 mt-1">{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-forest-800 mb-1">{item.title}</h4>
                    {item.link ? (
                      <a href={item.link} className="text-forest-600 hover:text-forest-700 transition-colors duration-300">{item.info}</a>
                    ) : (
                      <p className="text-forest-600">{item.info}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cidades Atendidas */}
            <div className="bg-gradient-to-br from-forest-500 to-forest-600 text-white p-6 rounded-2xl">
              <h4 className="text-xl font-bold mb-4">Cidades Atendidas</h4>
              <p className="mb-4 text-forest-100">Atendemos toda a região da Baixada Santista com qualidade e pontualidade.</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• Santos</div>
                <div>• São Vicente</div>
                <div>• Guarujá</div>
                <div>• Cubatão</div>
                <div>• Praia Grande</div>
                <div>• Mongaguá</div>
                <div>• Itanhaém</div>
                <div>• Peruíbe</div>
                <div>• Bertioga</div>
              </div>
            </div>

            {/* Seção "Por que escolher a Brimu" - REMOVIDA */}
          </div>
        </div>
      </div>

      {/* CTAs Flutuantes */}
      <button 
        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
        className="badge-floating"
      >
        Orçamento
      </button>
      <a href="https://wa.me/5511950336105" target="_blank" rel="noreferrer" className="whatsapp-fixed" aria-label="WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="26" height="26" fill="currentColor">
          <path d="M19.11 17.22c-.27-.13-1.6-.8-1.85-.9-.25-.09-.43-.13-.62.14-.18.26-.71.9-.88 1.08-.16.18-.32.2-.59.07-.27-.13-1.13-.41-2.16-1.31-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.11-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.13-.62-1.48-.85-2.03-.22-.53-.45-.46-.62-.47-.16-.01-.34-.01-.52-.01-.18 0-.48.07-.74.34-.25.26-.98.96-.98 2.34 0 1.38 1.01 2.71 1.15 2.9.14.18 1.98 3.02 4.8 4.24.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.31z"/>
          <path d="M16.02 3.2c-7.08 0-12.82 5.74-12.82 12.82 0 2.26.59 4.45 1.71 6.38L3.2 28.8l6.57-1.69c1.87 1.02 3.98 1.56 6.25 1.56 7.08 0 12.82-5.74 12.82-12.82S23.1 3.2 16.02 3.2zm7.52 20.34c-.32.9-1.86 1.72-2.59 1.83-.66.1-1.51.14-2.44-.15-3.53-1.14-5.81-3.96-6-4.14-.18-.18-1.43-1.9-1.43-3.64 0-1.74 1.09-2.59 1.48-2.95.34-.31.9-.44 1.43-.44.17 0 .33 0 .47.01.41.02.62.04.89.68.32.77 1.1 2.66 1.2 2.85.09.18.15.41.03.66-.12.25-.19.41-.38.62-.18.22-.29.49-.42.63-.2.32-.41.51-.18.84.23.32 1.01 1.66 2.39 2.69 1.65 1.22 2.84 1.61 3.17 1.79.33.18.52.16.71-.1.2-.26.82-.96 1.04-1.3.22-.34.45-.28.75-.16.31.11 1.99.94 2.33 1.11.34.17.56.26.64.41.1.16.1.92-.22 1.82z"/>
        </svg>
      </a>
    </section>
  )
}

export default Contact
