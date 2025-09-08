import React from 'react'
import { FaTree, FaUser, FaSignOutAlt } from 'react-icons/fa'

const DashboardSimple = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FaTree className="text-2xl text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Brimu Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FaUser className="text-gray-600 mr-2" />
                <span className="text-gray-700">
                  {user?.name} ({user?.role})
                </span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt className="mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <FaTree className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-2 text-lg font-medium text-gray-900">
                ✅ Login Realizado com Sucesso!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Bem-vindo ao sistema Brimu, {user?.name}!
              </p>
              
              <div className="mt-6 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações do Usuário
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Nome</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user?.role === 'admin' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user?.role}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ID</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user?.id}</dd>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  🎉 Sistema Funcionando Perfeitamente!
                </h3>
                <p className="text-xs text-green-700">
                  O login foi realizado com sucesso e você foi redirecionado para o dashboard. 
                  A autenticação está funcionando corretamente!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardSimple