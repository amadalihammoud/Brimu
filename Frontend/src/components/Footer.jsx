import React from 'react'
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaArrowUp, FaTree } from 'react-icons/fa'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer id="footer" className="bg-gradient-to-b from-forest-800 to-forest-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Logo e Sobre */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <FaTree className="text-3xl text-forest-400" />
              <h3 className="text-2xl font-bold text-white">Brimu</h3>
            </div>
            <p className="text-forest-200 mb-4 leading-relaxed">
              Especialistas em serviços arbóreos e paisagísticos, comprometidos com a 
              sustentabilidade e qualidade. Transformamos espaços verdes em ambientes 
              harmoniosos e seguros.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/brimu" target="_blank" rel="noopener noreferrer" className="text-forest-300 hover:text-white transition-colors">
                <FaFacebook className="text-2xl" />
              </a>
              <a href="https://instagram.com/brimu" target="_blank" rel="noopener noreferrer" className="text-forest-300 hover:text-white transition-colors">
                <FaInstagram className="text-2xl" />
              </a>
              <a href="https://linkedin.com/company/brimu" target="_blank" rel="noopener noreferrer" className="text-forest-300 hover:text-white transition-colors">
                <FaLinkedin className="text-2xl" />
              </a>
              <a href="https://wa.me/5511950336105" target="_blank" rel="noopener noreferrer" className="text-forest-300 hover:text-white transition-colors">
                <FaWhatsapp className="text-2xl" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xl font-semibold mb-4 text-forest-100">
              Receba nossas novidades
            </h4>
            <p className="text-forest-300 mb-6">
              Fique por dentro das últimas tendências em paisagismo e cuidados com árvores
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-lg bg-forest-700 border border-forest-600 text-white placeholder-forest-300 focus:outline-none focus:border-forest-400"
              />
              <button className="btn-action px-6 py-3">
                Inscrever
              </button>
            </div>
          </div>
        </div>

        {/* Informações de Contato - REMOVIDA */}

        {/* Copyright */}
        <div className="border-t border-forest-700 pt-8 text-center">
          <p className="text-forest-300 text-sm">
            © 2024 Brimu - Serviços de Arborização e Paisagismo. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Botão Voltar ao Topo */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 bg-forest-600 hover:bg-forest-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110"
        aria-label="Voltar ao topo"
      >
        <FaArrowUp className="text-xl" />
      </button>
    </footer>
  )
}

export default Footer
