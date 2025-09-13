import React from 'react';
import { Helmet } from 'react-helmet-async';

const SchemaMarkup = ({ type = 'organization', data = {} }) => {
  const baseUrl = 'https://brimu-arborizacao.vercel.app';
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}#organization`,
    "name": "Brimu - Arborização e Paisagismo",
    "legalName": "Brimu Arborização e Paisagismo Ltda",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/images/brimu-logo.png`,
      "width": 300,
      "height": 120
    },
    "description": "Empresa especializada em serviços profissionais de arborização, paisagismo, corte de árvores, poda e manutenção de áreas verdes, atuando com qualidade, segurança e sustentabilidade.",
    "foundingDate": "2020",
    "numberOfEmployees": "10-50",
    "slogan": "Transforme seu espaço verde com profissionalismo",
    "keywords": "arborização, paisagismo, corte de árvores, poda, jardinagem, manutenção áreas verdes",
    "industry": "Paisagismo e Arborização",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-11-99999-9999",
      "contactType": "customer service",
      "areaServed": "BR",
      "availableLanguage": ["Portuguese"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "SP"
    },
    "sameAs": [
      "https://www.facebook.com/brimuarborizacao",
      "https://www.instagram.com/brimuarborizacao",
      "https://www.linkedin.com/company/brimu"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "LandscapingBusiness"],
    "@id": `${baseUrl}#business`,
    "name": "Brimu - Arborização e Paisagismo",
    "image": `${baseUrl}/images/brimu-og-image.jpg`,
    "url": baseUrl,
    "telephone": "+55-11-99999-9999",
    "email": "contato@brimu.com.br",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BR",
      "addressRegion": "SP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -23.5505,
      "longitude": -46.6333
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "08:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification", 
        "dayOfWeek": "Saturday",
        "opens": "08:00",
        "closes": "12:00"
      }
    ],
    "priceRange": "$$",
    "currenciesAccepted": "BRL",
    "paymentAccepted": [
      "Cartão de Crédito",
      "Cartão de Débito", 
      "Dinheiro",
      "PIX",
      "Transferência Bancária"
    ],
    "areaServed": {
      "@type": "AdministrativeArea",
      "name": "São Paulo",
      "containedIn": {
        "@type": "Country",
        "name": "Brasil"
      }
    },
    "serviceType": [
      "Arborização",
      "Paisagismo",
      "Corte de Árvores",
      "Poda de Árvores",
      "Manutenção de Jardins",
      "Corte de Grama"
    ]
  };

  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${baseUrl}#services`,
    "name": "Serviços de Arborização e Paisagismo",
    "description": "Serviços completos de arborização, paisagismo, corte e poda de árvores, manutenção de jardins e áreas verdes.",
    "provider": {
      "@id": `${baseUrl}#organization`
    },
    "areaServed": {
      "@type": "Country",
      "name": "Brasil"
    },
    "serviceType": "Paisagismo e Arborização",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Serviços Brimu",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Corte de Árvores",
            "description": "Remoção segura e profissional de árvores com equipamentos adequados e técnicas especializadas.",
            "category": "Arborização"
          },
          "priceRange": "$$"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Poda e Manutenção",
            "description": "Poda técnica para saúde da árvore, fertilização e tratamento fitossanitário.",
            "category": "Manutenção"
          },
          "priceRange": "$$"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Paisagismo",
            "description": "Criação e execução de projetos paisagísticos personalizados.",
            "category": "Paisagismo"
          },
          "priceRange": "$$"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Corte de Grama",
            "description": "Manutenção profissional de gramados e áreas verdes.",
            "category": "Jardinagem"
          },
          "priceRange": "$"
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}#website`,
    "name": "Brimu - Arborização e Paisagismo",
    "url": baseUrl,
    "description": "Site oficial da Brimu, empresa especializada em arborização e paisagismo.",
    "publisher": {
      "@id": `${baseUrl}#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}?s={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "pt-BR"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Serviços",
        "item": `${baseUrl}#services`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Sobre",
        "item": `${baseUrl}#about`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Contato",
        "item": `${baseUrl}#contact`
      }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org", 
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quais serviços a Brimu oferece?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A Brimu oferece serviços completos de arborização, incluindo corte e poda de árvores, paisagismo, manutenção de jardins, corte de grama e tratamentos fitossanitários."
        }
      },
      {
        "@type": "Question",
        "name": "Como solicitar um orçamento?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Você pode solicitar um orçamento através do nosso formulário online, WhatsApp ou telefone. Nossa equipe fará uma avaliação gratuita do seu projeto."
        }
      },
      {
        "@type": "Question",
        "name": "A Brimu possui licenças e seguros?",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "Sim, somos uma empresa licenciada e possuímos todos os seguros necessários para realizar os serviços com total segurança e tranquilidade."
        }
      },
      {
        "@type": "Question",
        "name": "Em quais regiões a Brimu atende?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Atendemos em São Paulo e região metropolitana. Consulte-nos sobre atendimento em outras localidades."
        }
      }
    ]
  };

  const getSchema = () => {
    switch (type) {
      case 'organization':
        return organizationSchema;
      case 'localBusiness':
        return { ...localBusinessSchema, ...data };
      case 'services':
        return servicesSchema;
      case 'website':
        return websiteSchema;
      case 'breadcrumb':
        return breadcrumbSchema;
      case 'faq':
        return faqSchema;
      default:
        return organizationSchema;
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(getSchema(), null, 2)}
      </script>
    </Helmet>
  );
};

export default SchemaMarkup;