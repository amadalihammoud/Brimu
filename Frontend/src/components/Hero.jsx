import React from 'react'
import { FaWhatsapp, FaArrowDown } from 'react-icons/fa'

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background com gradiente profissional */}
      <div className="absolute inset-0 hero-gradient opacity-95"></div>
      
      {/* Padrão sutil de fundo */}
      <div className="absolute inset-0 bg-hero-pattern opacity-20"></div>
      
      {/* Conteúdo principal */}
      <div className="relative z-10 container-custom text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up">
            Transforme seu
            <span className="block text-gold-300">espaço verde</span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-xl md:text-2xl text-forest-100 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Serviços de arborização, paisagismo e manutenção de jardins. 
            Transformamos sonhos em realidade com qualidade e responsabilidade ambiental.
          </p>
          
          {/* CTA principal - Botão único para WhatsApp */}
          <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.4s' }}>
            <a href="https://wa.me/5511950336105" target="_blank" rel="noreferrer" className="btn-primary text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto flex items-center justify-center space-x-3">
              <FaWhatsapp className="text-xl sm:text-2xl" />
              <span>Entre em Contato</span>
            </a>
          </div>
        </div>
      </div>
      
      {/* Indicador de scroll */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-scroll-indicator">
        <FaArrowDown className="text-white text-2xl" />
      </div>
    </section>
  )
}

export default Hero
