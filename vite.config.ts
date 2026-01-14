import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    {
      name: 'defer-css',
      apply: 'build',
      transformIndexHtml(html) {
        return html.replace(
          /<link\s+rel="stylesheet"([^>]*?)>/g,
          (match, attrs) => {
            const hrefMatch = attrs.match(/href="([^"]+)"/);
            if (!hrefMatch) return match;

            const href = hrefMatch[1];
            const crossoriginMatch = attrs.match(/\scrossorigin(?:="[^"]*")?/);
            const crossorigin = crossoriginMatch ? crossoriginMatch[0] : '';
            const preloadTag = `<link rel="preload" as="style" href="${href}"${crossorigin} onload="this.onload=null;this.rel='stylesheet'">`;
            const noscriptTag = `<noscript><link rel="stylesheet" href="${href}"${crossorigin}></noscript>`;

            return `${preloadTag}\n${noscriptTag}`;
          },
        );
      },
    },
    react(),
    mode === 'development' && componentTagger(),

    // 1. Brotli Compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),

    // 2. Bundle Visualizer
    visualizer({
      open: true,
      gzipSize: true,
      filename: "stats.html"
    }) as any,

    // 3. PWA Configuration
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // Prevent render-blocking - we manually register SW after page load
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'نبض AI',
        short_name: 'Nabdh AI',
        description: 'دليلك الشامل لأدوات الذكاء الاصطناعي',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-images',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      }
    })
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        // Smart Manual Chunking
        manualChunks(id) {
          // Simplified chunking to avoid initialization order issues
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('@sentry')) return 'vendor-sentry';

            // React core - keep together to avoid initialization issues
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor-react';
            }

            // React Router
            if (id.includes('react-router')) return 'vendor-router';
          }

          // 3. UI Libraries (Radix, Shadcn dependencies)
          if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
            return 'vendor-ui-core';
          }

          // 4. Icons - split into separate chunk for better caching
          if (id.includes('lucide-react')) return 'vendor-icons';

          // 5. Animation
          if (id.includes('framer-motion')) return 'vendor-animation';

          // 6. Data Visualization - lazy loaded
          if (id.includes('recharts') || id.includes('chart.js') || id.includes('d3')) {
            return 'vendor-charts';
          }

          // 7. Forms & Validation
          if (id.includes('zod') || id.includes('react-hook-form')) {
            return 'vendor-forms';
          }

          // 8. Date Manipulation
          if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
            return 'vendor-dates';
          }

          // 9. i18n
          if (id.includes('i18next')) return 'vendor-i18n';

          // 10. Query
          if (id.includes('@tanstack')) return 'vendor-query';
        },
      },
    },
  },
}));
