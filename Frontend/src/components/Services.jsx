import React from 'react'
import { FaTree, FaLeaf, FaCut, FaSeedling } from 'react-icons/fa'

const Services = () => {
  const services = [
    {
      icon: <FaTree className="text-4xl text-forest-600" />,
      title: 'Corte de Árvores',
      description: 'Remoção segura e profissional de árvores com equipamentos adequados.',
      features: ['Análise de risco', 'Trabalho seguro', 'Limpeza completa', 'Documentação']
    },
    {
      icon: <FaLeaf className="text-4xl text-forest-600" />,
      title: 'Poda e Manutenção',
      description: 'Poda técnica para saúde da árvore e segurança do local.',
      features: ['Poda técnica', 'Fertilização', 'Tratamento fitossanitário', 'Manutenção preventiva']
    },
    {
      icon: <FaCut className="text-4xl text-forest-600" />,
      title: 'Corte de Grama',
      description: 'Manutenção regular de gramados com acabamento profissional.',
      features: ['Corte regular', 'Aparagem de bordas', 'Fertilização', 'Controle de pragas']
    },
    {
      icon: <FaSeedling className="text-4xl text-forest-600" />,
      title: 'Paisagismo',
      description: 'Criação e reforma de jardins com design personalizado.',
      features: ['Projeto paisagístico', 'Plantio de espécies', 'Sistema de irrigação', 'Manutenção']
    }
  ]

  return (
    <section id="services" className="section-padding bg-gradient-to-b from-white to-forest-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-forest-900 mb-4">
            Nossos Serviços
          </h2>
          <p className="text-xl text-forest-700 max-w-3xl mx-auto">
            Soluções completas para todos os tipos de serviços arbóreos e paisagísticos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <div key={index} className="card p-6 animate-zoom-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-forest-800 mb-3 text-center">
                {service.title}
              </h3>
              <p className="text-forest-700 text-center text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Seção "Informações Adicionais" removida */}
      </div>
    </section>
  )
}

export default Services
