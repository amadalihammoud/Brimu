import React from 'react'
import { FaQuoteLeft, FaStar } from 'react-icons/fa'

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "A Brimu transformou completamente meu jardim! O corte de árvores foi feito com total segurança e profissionalismo. Recomendo a todos!",
      author: "Ana Paula Silva",
      title: "Cliente Residencial",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: 2,
      quote: "Serviço de paisagismo impecável! Minha empresa agora tem uma área verde que impressiona. A equipe é muito atenciosa e criativa.",
      author: "Carlos Eduardo Mendes",
      title: "Empresário",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/44.jpg"
    },
    {
      id: 3,
      quote: "Precisava de uma poda urgente e a Brimu atendeu prontamente. Trabalho rápido, limpo e com um preço justo. Virei cliente!",
      author: "Mariana Costa",
      title: "Síndica de Condomínio",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/79.jpg"
    },
    {
      id: 4,
      quote: "O corte de grama é sempre perfeito. Meu jardim está sempre bem cuidado e bonito. Profissionais de confiança.",
      author: "João Pedro Almeida",
      title: "Cliente Residencial",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ]

  return (
    <section id="testimonials" className="section-padding bg-gradient-to-b from-forest-50 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-forest-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-xl text-forest-700 max-w-3xl mx-auto">
            A satisfação dos nossos clientes é a nossa maior recompensa.
            Veja alguns depoimentos sobre a qualidade dos nossos serviços.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="card p-6 relative animate-zoom-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <FaQuoteLeft className="absolute top-4 left-4 text-forest-200 text-3xl opacity-70" />
              <p className="text-forest-700 mb-4 italic relative z-10 text-sm leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center mt-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-10 h-10 rounded-full mr-3 border-2 border-forest-300 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-forest-800 text-sm">{testimonial.author}</h4>
                  <p className="text-xs text-forest-600">{testimonial.title}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3 h-3 ${i < testimonial.rating ? 'text-gold-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="glassmorphism p-8 rounded-2xl max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-forest-800 mb-4">
              Seja o próximo cliente satisfeito!
            </h3>
            <p className="text-forest-700 mb-6">
              Entre em contato hoje mesmo e descubra como podemos transformar seu espaço.
            </p>
            <a href="#contact" className="btn-action">
              Solicitar Orçamento Grátis
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
