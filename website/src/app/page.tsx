import Link from 'next/link';
import { 
  TreePine, 
  Shield, 
  Users, 
  Award, 
  Phone, 
  Mail, 
  MapPin,
  ArrowRight 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-800 text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TreePine className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Brimu Arborização</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#servicos" className="hover:text-green-200">Serviços</a>
            <a href="#sobre" className="hover:text-green-200">Sobre</a>
            <a href="#contato" className="hover:text-green-200">Contato</a>
            <Link 
              href="/login" 
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              Área do Cliente
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-6">
            Especialistas em Serviços Arbóreos
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Oferecemos soluções completas em arborização urbana, poda técnica, 
            remoção segura de árvores e consultoria especializada para empresas e órgãos públicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="#contato" 
              className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 flex items-center justify-center"
            >
              Solicitar Orçamento
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 flex items-center justify-center"
            >
              Área do Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Nossos Serviços
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <TreePine className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Poda Técnica</h4>
              <p className="text-gray-600">
                Poda especializada seguindo normas técnicas para manutenção e saúde das árvores.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Shield className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Remoção Segura</h4>
              <p className="text-gray-600">
                Remoção de árvores com total segurança e equipamentos especializados.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Award className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="text-xl font-bold mb-2">Consultoria</h4>
              <p className="text-gray-600">
                Análise e consultoria técnica para projetos de arborização urbana.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-800 mb-6">
                Sobre a Brimu
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Somos uma empresa especializada em serviços arbóreos com anos de experiência 
                no mercado. Nossa equipe é formada por profissionais qualificados que utilizam 
                equipamentos modernos e seguem todas as normas de segurança.
              </p>
              <div className="flex items-start space-x-4 mb-4">
                <Users className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Equipe Especializada</h4>
                  <p className="text-gray-600">Profissionais certificados e experientes</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 mb-4">
                <Shield className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Segurança Total</h4>
                  <p className="text-gray-600">Procedimentos seguros e equipamentos modernos</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-8 rounded-lg">
              <h4 className="text-2xl font-bold text-green-800 mb-4">
                Sistema de Gestão Integrado
              </h4>
              <p className="text-gray-700 mb-4">
                Nossos clientes têm acesso a um sistema completo para acompanhar:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Status dos serviços em tempo real</li>
                <li>• Histórico completo de atendimentos</li>
                <li>• Orçamentos e pagamentos online</li>
                <li>• Relatórios técnicos detalhados</li>
              </ul>
              <Link 
                href="/login" 
                className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                Acessar Sistema
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-green-800 text-white">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">
            Entre em Contato
          </h3>
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h4 className="text-2xl font-bold mb-6">Fale Conosco</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <span>(XX) XXXXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <span>contato@brimu.com.br</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <span>Sua cidade, Estado</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 p-6 rounded-lg">
              <h4 className="text-xl font-bold mb-4">Solicite um Orçamento</h4>
              <form className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Nome" 
                  className="w-full p-3 rounded bg-white/20 placeholder-white/80 text-white"
                />
                <input 
                  type="email" 
                  placeholder="E-mail" 
                  className="w-full p-3 rounded bg-white/20 placeholder-white/80 text-white"
                />
                <textarea 
                  placeholder="Descreva o serviço necessário" 
                  rows={4}
                  className="w-full p-3 rounded bg-white/20 placeholder-white/80 text-white"
                ></textarea>
                <button 
                  type="submit" 
                  className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700"
                >
                  Enviar Solicitação
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TreePine className="w-6 h-6" />
            <span className="text-xl font-bold">Brimu Arborização</span>
          </div>
          <p className="text-gray-400">
            © 2024 Brimu Arborização. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
