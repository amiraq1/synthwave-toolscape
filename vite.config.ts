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
        // Smart Manual Chunking - Optimized for Critical Path
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. React Core - absolute minimum for app to work
            if (id.includes('react-dom') || (id.includes('react') && !id.includes('react-router') && !id.includes('react-hook-form') && !id.includes('reactflow') && !id.includes('react-day-picker') && !id.includes('react-easy-crop') && !id.includes('react-markdown') && !id.includes('react-i18next') && !id.includes('react-helmet') && !id.includes('react-hot-toast') && !id.includes('react-resizable'))) {
              return 'vendor-react-core';
            }

            // 2. React Router - needed for navigation
            if (id.includes('react-router')) return 'vendor-router';

            // 3. Supabase - separate but essential
            if (id.includes('@supabase')) return 'vendor-supabase';

            // 4. Query - needed for data fetching
            if (id.includes('@tanstack')) return 'vendor-query';

            // === HEAVY LIBRARIES - LAZY LOADED ===

            // 5. Charts (recharts + d3) - ONLY for Admin page (~150KB)
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }

            // 6. ReactFlow - ONLY for WorkflowBuilder page (~200KB)
            if (id.includes('reactflow') || id.includes('@reactflow')) {
              return 'vendor-flow';
            }

            // 7. Icons - frequently used but tree-shakeable
            if (id.includes('lucide-react')) return 'vendor-icons';

            // 8. UI Core (Radix) - essential for UI
            if (id.includes('@radix-ui')) return 'vendor-radix';

            // 9. UI Utils (lightweight)
            if (id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui-utils';
            }

            // 10. Forms & Validation - for pages with forms
            if (id.includes('zod') || id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }

            // 11. i18n - can be slightly delayed
            if (id.includes('i18next') || id.includes('react-i18next')) return 'vendor-i18n';

            // 12. Date utilities
            if (id.includes('date-fns') || id.includes('dayjs')) return 'vendor-dates';

            // 13. Markdown - for blog pages only
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) {
              return 'vendor-markdown';
            }

            // 14. Image cropping - for profile/admin only
            if (id.includes('react-easy-crop')) return 'vendor-image-crop';

            // 15. Sentry - monitoring, load lazily
            if (id.includes('@sentry')) return 'vendor-sentry';

            // 16. Other heavy libs
            if (id.includes('embla-carousel')) return 'vendor-carousel';
            if (id.includes('sonner') || id.includes('react-hot-toast')) return 'vendor-toasts';
            if (id.includes('cmdk')) return 'vendor-cmdk';
          }
        },
      },
    },
  },
}));
