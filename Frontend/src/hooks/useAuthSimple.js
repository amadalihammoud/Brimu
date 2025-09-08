import { useState, useEffect, useCallback } from 'react'

export const useAuthSimple = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Verificar se há usuário logado no localStorage
  const checkAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('brimu_token')
      const userData = localStorage.getItem('brimu_user')
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err)
      localStorage.removeItem('brimu_token')
      localStorage.removeItem('brimu_user')
    } finally {
      setLoading(false)
    }
  }, [])

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Salvar dados no localStorage
        localStorage.setItem('brimu_token', data.token)
        localStorage.setItem('brimu_user', JSON.stringify(data.user))
        
        setUser(data.user)
        return data
      } else {
        throw new Error(data.message || 'Erro no login')
      }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    localStorage.removeItem('brimu_token')
    localStorage.removeItem('brimu_user')
    setUser(null)
    setError(null)
  }, [])

  // Verificar se é admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin'
  }, [user])

  // Verificar se é cliente
  const isClient = useCallback(() => {
    return user?.role === 'client' || user?.role === 'user'
  }, [user])

  // Inicializar autenticação
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isClient,
    checkAuth,
    clearError: () => setError(null)
  }
}