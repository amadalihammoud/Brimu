import React from 'react'
import { FaAward, FaUsers, FaLeaf, FaShieldAlt, FaClock, FaCheckCircle } from 'react-icons/fa'

const About = () => {
  const values = [
    { icon: <FaLeaf className="text-2xl text-forest-500" />, title: 'Sustentabilidade', description: 'Compromisso com o meio ambiente e práticas eco-friendly' },
    { icon: <FaShieldAlt className="text-2xl text-forest-500" />, title: 'Segurança', description: 'Protocolos rigorosos de segurança em todos os serviços' },
    { icon: <FaUsers className="text-2xl text-forest-500" />, title: 'Equipe Qualificada', description: 'Profissionais certificados e experientes' },
    { icon: <FaClock className="text-2xl text-forest-500" />, title: 'Pontualidade', description: 'Respeito ao tempo dos nossos clientes' }
  ]

  const differentiators = [
    { icon: <FaAward className="text-3xl text-gold-500" />, title: 'Profissionalismo', description: 'Serviços de qualidade com padrões elevados' },
    { icon: <FaCheckCircle className="text-3xl text-forest-500" />, title: 'Qualidade Garantida', description: 'Compromisso com a excelência em todos os projetos' },
    { icon: <FaShieldAlt className="text-3xl text-action-500" />, title: 'Contato Personalizado', description: 'Soluções personalizadas para cada projeto' },
    { icon: <FaUsers className="text-3xl text-earth-500" />, title: 'Transparência Total', description: 'Orçamentos claros e sem surpresas' }
  ]

  return (
    <section id="about" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Coluna da Esquerda */}
          <div className="animate-slide-in-left">
            <h2 className="text-4xl md:text-5xl font-bold text-forest-900 mb-6">
              Sobre a Brimu
            </h2>
            <p className="text-lg text-forest-700 mb-6 leading-relaxed">
              Somos uma empresa especializada em serviços arbóreos e paisagísticos, 
              comprometida com a excelência e sustentabilidade ambiental. 
              Transformamos espaços verdes em ambientes harmoniosos e seguros.
            </p>
            <p className="text-lg text-forest-700 mb-6">
              Nossa missão é proporcionar soluções sustentáveis e de qualidade, 
              transformando espaços verdes em ambientes harmoniosos e funcionais.
            </p>
          </div>

          {/* Coluna da Direita */}
          <div className="animate-slide-in-right">
            <div className="glassmorphism p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-forest-800 mb-6 text-center">
                Nossos Valores
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">{value.icon}</div>
                    <div>
                      <h4 className="font-semibold text-forest-800 mb-1">{value.title}</h4>
                      <p className="text-sm text-forest-600">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Seção "Por que escolher a Brimu" - REMOVIDA */}
      </div>
    </section>
  )
}

export default About
