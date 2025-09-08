import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBars, FaTimes, FaLeaf } from 'react-icons/fa'

const Header = ({ user, onLogout, onShowStorage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handlePortalClick = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/auth')
    }
  }

  const menuItems = [
    { href: '#hero', label: 'Início' },
    { href: '#services', label: 'Serviços' },
    { href: '#about', label: 'Sobre' },
    { href: '#contact', label: 'Contato' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-forest-200 shadow-lg">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <FaLeaf className="text-2xl text-forest-600" />
            <span className="text-xl font-bold text-forest-800">Brimu</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-forest-700 hover:text-forest-600 transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* User Menu */}
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Redirecionando para o sistema...
              </span>
            </div>
          ) : (
            <div className="hidden md:block">
              <button
                onClick={handlePortalClick}
                className="btn-primary"
              >
                Portal de Acesso
              </button>
            </div>
          )}

          {/* Mobile Menu Button and Portal Button */}
          <div className="md:hidden flex items-center space-x-3">
            {user ? (
              <span className="text-sm text-gray-600">
                Redirecionando...
              </span>
            ) : (
              <button
                onClick={handlePortalClick}
                className="btn-secondary text-sm px-4 py-2"
              >
                Portal
              </button>
            )}
            <button
              onClick={toggleMenu}
              className="p-2 text-forest-700 hover:text-forest-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-forest-200">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-forest-700 hover:text-forest-600 hover:bg-forest-50 rounded-md transition-colors duration-300"
                  onClick={closeMenu}
                >
                  {item.label}
                </a>
              ))}
              {!user && (
                <div className="pt-4">
                  <button
                    onClick={() => {
                      closeMenu();
                      handlePortalClick();
                    }}
                    className="block w-full text-center btn-primary"
                  >
                    Portal de Acesso
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
