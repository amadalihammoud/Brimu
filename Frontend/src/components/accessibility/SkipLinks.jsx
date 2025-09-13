import React from 'react';

const SkipLinks = () => {
  const links = [
    { href: '#main-content', label: 'Pular para conteúdo principal' },
    { href: '#services', label: 'Pular para serviços' },
    { href: '#about', label: 'Pular para sobre nós' },
    { href: '#contact', label: 'Pular para contato' },
    { href: '#footer', label: 'Pular para rodapé' }
  ];

  return (
    <nav className="skip-links" aria-label="Links de navegação rápida">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.focus();
              target.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default SkipLinks;