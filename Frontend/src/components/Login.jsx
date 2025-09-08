import React, { useState } from 'react'
import { FaTree, FaEye, FaEyeSlash, FaLock, FaUser, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa'
import config from '../config'

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ 
    email: config.development.enableLogging ? 'admin@brimu.com' : '', 
    password: config.development.enableLogging ? 'admin123' : '' 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await onLogin(formData.email, formData.password)
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('brimu_remembered_email', formData.email)
        localStorage.setItem('brimu_remember_me', 'true')
      } else {
        localStorage.removeItem('brimu_remembered_email')
        localStorage.removeItem('brimu_remember_me')
      }
      
    } catch (err) {
      setError(err.message || 'Erro de conexão. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (email, password) => {
    setFormData({ email, password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-forest-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FaTree className="text-4xl text-forest-600 animate-bounce" />
            <h1 className="text-3xl font-bold text-forest-900">Brimu</h1>
          </div>
          <h2 className="text-2xl font-bold text-forest-800 mb-2">Portal de Acesso Avançado</h2>
          <p className="text-forest-600">Sistema com recursos modernos e seguros</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-forest-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-forest-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-forest-200 rounded-lg focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-200 transition-all duration-300 bg-white"
                  placeholder="Digite seu email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-forest-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-forest-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border-2 border-forest-200 rounded-lg focus:border-forest-500 focus:outline-none focus:ring-4 focus:ring-forest-200 transition-all duration-300 bg-white"
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-forest-400 hover:text-forest-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-forest-600 border-forest-300 rounded focus:ring-forest-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-forest-700">Lembrar-me</span>
              </label>
              <a 
                href="#" 
                onClick={(e) => e.preventDefault()}
                className="text-sm text-forest-600 hover:text-forest-700 transition-colors duration-300"
              >
                Esqueceu a senha?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg text-sm flex items-center space-x-2">
                <FaTimes className="text-red-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                isLoading 
                  ? 'bg-forest-400 text-white cursor-not-allowed opacity-75' 
                  : 'bg-gradient-to-r from-forest-500 to-forest-600 text-white hover:from-forest-400 hover:to-forest-500 hover:scale-105 hover:shadow-2xl focus:ring-4 focus:ring-forest-300'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <FaLock />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-white border border-forest-200 rounded-lg">
            <h3 className="text-sm font-medium text-forest-700 mb-2">🚀 Credenciais de Demo:</h3>
            <div className="text-xs space-y-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@brimu.com', 'admin123')}
                className="block w-full text-left p-2 rounded hover:bg-forest-50 transition-colors duration-200 border border-transparent hover:border-forest-200"
                disabled={isLoading}
              >
                <strong>🔧 Admin:</strong> admin@brimu.com / admin123
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('joao@brimu.com', 'password123')}
                className="block w-full text-left p-2 rounded hover:bg-forest-50 transition-colors duration-200 border border-transparent hover:border-forest-200"
                disabled={isLoading}
              >
                <strong>👤 Usuário:</strong> joao@brimu.com / password123
              </button>
            </div>
            <p className="text-xs text-forest-500 mt-2 italic">
              Clique em qualquer credencial para preencher automaticamente
            </p>
          </div>
        </div>

        {/* Support Information */}
        <div className="text-center mt-6">
          <p className="text-forest-500 text-sm">
            Sistema Brimu v2.0 - Precisa de ajuda? 
            <br />
            <a 
              href="mailto:suporte@brimu.com.br" 
              className="text-forest-600 hover:text-forest-700 transition-colors"
            >
              suporte@brimu.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login