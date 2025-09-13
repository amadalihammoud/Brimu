import React from 'react';
import { Helmet } from 'react-helmet-async';

const MetaTags = ({ 
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author = 'Brimu - Arborização e Paisagismo',
  locale = 'pt_BR'
}) => {
  const baseUrl = 'https://brimu-arborizacao.vercel.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image ? `${baseUrl}${image}` : `${baseUrl}/images/brimu-og-image.jpg`;

  const defaultTitle = 'Brimu - Arborização e Paisagismo Profissional';
  const defaultDescription = 'Serviços profissionais de arborização, paisagismo, corte de árvores, poda e manutenção de áreas verdes. Transforme seu espaço com a Brimu - qualidade, segurança e sustentabilidade.';
  const defaultKeywords = 'arborização, paisagismo, corte de árvores, poda, grama, jardinagem, manutenção áreas verdes, serviços arbóreos, Brasil, sustentabilidade';

  const pageTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Brimu - Serviços de Arborização e Paisagismo" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="Brimu - Arborização e Paisagismo" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content="Brimu - Serviços de Arborização e Paisagismo" />
      <meta name="twitter:site" content="@brimu_oficial" />
      <meta name="twitter:creator" content="@brimu_oficial" />
      
      {/* Additional SEO */}
      <meta name="theme-color" content="#2d5a3d" />
      <meta name="msapplication-TileColor" content="#2d5a3d" />
      <meta name="application-name" content="Brimu" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Alternate languages */}
      <link rel="alternate" hrefLang="pt-BR" href={fullUrl} />
      <link rel="alternate" hrefLang="pt" href={fullUrl} />
      
      {/* Schema.org for Business */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": "${baseUrl}",
            "name": "Brimu - Arborização e Paisagismo",
            "description": "${pageDescription}",
            "url": "${baseUrl}",
            "logo": {
              "@type": "ImageObject",
              "url": "${baseUrl}/images/brimu-logo.png",
              "width": 300,
              "height": 120
            },
            "image": {
              "@type": "ImageObject",
              "url": "${fullImageUrl}",
              "width": 1200,
              "height": 630
            },
            "priceRange": "$$",
            "currenciesAccepted": "BRL",
            "paymentAccepted": "Cartão de Crédito, Cartão de Débito, Dinheiro, PIX, Transferência Bancária",
            "areaServed": {
              "@type": "Country",
              "name": "Brasil"
            },
            "serviceType": [
              "Arborização",
              "Paisagismo",
              "Corte de Árvores",
              "Poda de Árvores",
              "Manutenção de Jardins",
              "Corte de Grama",
              "Jardinagem"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Serviços de Arborização e Paisagismo",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Corte de Árvores",
                    "description": "Remoção segura e profissional de árvores com equipamentos adequados."
                  }
                },
                {
                  "@type": "Offer", 
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Poda e Manutenção",
                    "description": "Poda técnica para saúde da árvore e segurança do local."
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service", 
                    "name": "Paisagismo",
                    "description": "Criação e manutenção de jardins e áreas verdes."
                  }
                }
              ]
            },
            "telephone": "+55 11 99999-9999",
            "email": "contato@brimu.com.br",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "BR",
              "addressRegion": "SP"
            },
            "openingHours": [
              "Mo-Fr 08:00-18:00",
              "Sa 08:00-12:00"
            ],
            "sameAs": [
              "https://www.facebook.com/brimuarborizacao",
              "https://www.instagram.com/brimuarborizacao",
              "https://www.linkedin.com/company/brimu"
            ]
          }
        `}
      </script>
    </Helmet>
  );
};

export default MetaTags;