import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configurações otimizadas para React
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          // Otimizações de desenvolvimento
          ...(process.env.NODE_ENV === 'development' ? [
            ['@babel/plugin-transform-react-jsx-development', {}]
          ] : [])
        ]
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    cors: true
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk para dependências React
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          
          // Router chunk
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // Icons chunk
          if (id.includes('react-icons') || id.includes('lucide-react')) {
            return 'icons';
          }
          
          // SEO chunk
          if (id.includes('react-helmet-async')) {
            return 'seo';
          }
          
          // Performance monitoring chunk
          if (id.includes('web-vitals')) {
            return 'analytics';
          }
          
          // Outras dependências node_modules em chunk vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        chunkFileNames: (chunkInfo) => {
          return chunkInfo.name === 'index' 
            ? 'assets/main-[hash].js'
            : 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.')[1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return 'assets/images/[name]-[hash].[ext]';
          }
          
          if (/css/i.test(extType)) {
            return 'assets/styles/[name]-[hash].[ext]';
          }
          
          if (/woff2?|eot|ttf|otf/i.test(extType)) {
            return 'assets/fonts/[name]-[hash].[ext]';
          }
          
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    // Configurações de compressão
    assetsInlineLimit: 4096, // 4kb
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'react-helmet-async',
      'web-vitals',
      'react-icons/fa'
    ]
  },
  // Alias para imports mais limpos
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@styles': '/src/styles',
      '@assets': '/src/assets'
    }
  },
  // Configurações de CSS
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  // Preview settings para produção
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
})
