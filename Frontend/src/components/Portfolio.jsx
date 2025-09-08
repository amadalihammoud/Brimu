import React, { useState } from 'react'
import { FaSearch, FaMapMarkerAlt, FaTimes, FaExternalLinkAlt } from 'react-icons/fa'

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [selectedProject, setSelectedProject] = useState(null)

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'corte', name: 'Corte de Árvores' },
    { id: 'poda', name: 'Poda e Manutenção' },
    { id: 'paisagismo', name: 'Paisagismo' },
    { id: 'grama', name: 'Corte de Grama' }
  ]

  const projects = [
    {
      id: 1,
      title: 'Remoção de Palmeiras',
      category: 'corte',
      description: 'Remoção segura de palmeiras de grande porte em condomínio residencial.',
      location: 'São Paulo, SP',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Poda de Árvores Urbanas',
      category: 'poda',
      description: 'Poda técnica de árvores em vias públicas para segurança e saúde.',
      location: 'Campinas, SP',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Jardim Corporativo',
      category: 'paisagismo',
      description: 'Criação de jardim corporativo com espécies nativas e sistema de irrigação.',
      location: 'Santos, SP',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Manutenção de Gramado',
      category: 'grama',
      description: 'Manutenção regular de gramado com corte, fertilização e controle de pragas.',
      location: 'Ribeirão Preto, SP',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'Corte de Eucaliptos',
      category: 'corte',
      description: 'Remoção de eucaliptos em área rural com equipamentos especializados.',
      location: 'Piracicaba, SP',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Paisagismo Residencial',
      category: 'paisagismo',
      description: 'Transformação completa de jardim residencial com design personalizado.',
      location: 'Sorocaba, SP',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      beforeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    }
  ]

  const filteredProjects = selectedCategory === 'todos' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory)

  return (
    <section id="portfolio" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-forest-900 mb-4">
            Nossos Trabalhos
          </h2>
          <p className="text-xl text-forest-700 max-w-3xl mx-auto">
            Conheça alguns dos projetos que realizamos com excelência e qualidade
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-forest-600 text-white shadow-lg'
                  : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Grid de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredProjects.map((project, index) => (
            <div key={project.id} className="card overflow-hidden animate-zoom-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="relative group">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="opacity-0 group-hover:opacity-100 bg-white text-forest-800 p-3 rounded-full shadow-lg transition-all duration-300 transform scale-90 group-hover:scale-100"
                  >
                    <FaSearch className="text-xl" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-forest-800 mb-2">{project.title}</h3>
                <p className="text-forest-600 mb-4 text-sm leading-relaxed">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-forest-500 text-sm">
                    <FaMapMarkerAlt className="mr-2" />
                    {project.location}
                  </div>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-forest-600 hover:text-forest-700 transition-colors"
                  >
                    <FaExternalLinkAlt />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="glassmorphism p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-forest-800 mb-4">
              Quer ver mais projetos?
            </h3>
            <p className="text-forest-700 mb-6">
              Entre em contato e solicite um portfólio completo dos nossos trabalhos.
            </p>
            <a href="#contact" className="btn-action">
              Solicitar Portfólio Completo
            </a>
          </div>
        </div>
      </div>

      {/* Modal do Projeto */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-forest-800">{selectedProject.title}</h3>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-forest-500 hover:text-forest-700 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-forest-800 mb-2">Antes</h4>
                  <img
                    src={selectedProject.beforeImage}
                    alt="Antes"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-forest-800 mb-2">Depois</h4>
                  <img
                    src={selectedProject.afterImage}
                    alt="Depois"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>
              
              <p className="text-forest-700 mb-4">{selectedProject.description}</p>
              <div className="flex items-center text-forest-500 text-sm">
                <FaMapMarkerAlt className="mr-2" />
                {selectedProject.location}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Portfolio
