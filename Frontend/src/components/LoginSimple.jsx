import React, { useState } from 'react'
import { FaTree, FaEye, FaEyeSlash, FaLock, FaUser, FaSpinner } from 'react-icons/fa'

// Configuração simples inline
const config = {
  development: {
    enableLogging: true
  }
}

const LoginSimple = ({ onLogin }) => {
  const [formData, setFormData] = useState({ 
    email: config.development.enableLogging ? 'admin@brimu.com' : '', 
    password: config.development.enableLogging ? 'admin123' : '' 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      // Usar o onLogin fornecido pelo App.jsx (que usa useAuth)
      if (onLogin) {
        await onLogin(formData.email, formData.password)
        // O redirecionamento será feito automaticamente pelo App.jsx quando user mudar
      } else {
        // Fallback: fazer login direto via API (caso não tenha onLogin)
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        const data = await response.json()

        if (response.ok) {
          localStorage.setItem('brimu_token', data.token)
          localStorage.setItem('brimu_user', JSON.stringify(data.user))
          window.location.href = '/dashboard'
        } else {
          setError(data.message || 'Erro no login')
        }
      }
    } catch (err) {
      setError(err.message || 'Erro de conexão. Verifique se o backend está rodando.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (email, password) => {
    setFormData({ email, password })
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FaTree className="text-4xl text-green-600 animate-bounce" />
            <h1 className="text-3xl font-bold text-green-900">Brimu</h1>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Portal de Acesso</h2>
          <p className="text-green-600">Sistema funcional e direto</p>
        </div>

        {/* Card de Login */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-green-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 bg-white"
                  placeholder="Digite seu email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-2">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-green-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border-2 border-green-200 rounded-lg focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-300 bg-white"
                  placeholder="Digite sua senha"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-400 hover:text-green-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-lg text-sm">
                <span>{error}</span>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                isLoading 
                  ? 'bg-green-400 text-white cursor-not-allowed opacity-75' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-400 hover:to-green-500 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-green-300'
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
          <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
            <h3 className="text-sm font-medium text-green-700 mb-2">🚀 Credenciais de Demo:</h3>
            <div className="text-xs space-y-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@brimu.com', 'admin123')}
                className="block w-full text-left p-2 rounded hover:bg-green-50 transition-colors duration-200 border border-transparent hover:border-green-200"
                disabled={isLoading}
              >
                <strong>🔧 Admin:</strong> admin@brimu.com / admin123
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('teste@brimu.com', 'teste123')}
                className="block w-full text-left p-2 rounded hover:bg-blue-50 transition-colors duration-200 border border-transparent hover:border-blue-200"
                disabled={isLoading}
              >
                <strong>👤 Cliente:</strong> teste@brimu.com / teste123
              </button>
            </div>
            <p className="text-xs text-green-500 mt-2 italic">
              Clique em qualquer credencial para preencher automaticamente
            </p>
          </div>
        </div>

        {/* Support Information */}
        <div className="text-center mt-6">
          <p className="text-green-500 text-sm">
            Sistema Brimu - Login Simplificado
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginSimple