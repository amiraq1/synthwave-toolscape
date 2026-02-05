import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === "analyze";
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      {
        name: 'defer-css',
        apply: 'build',
        transformIndexHtml(html: string) {
          return html.replace(
            /<link\s+rel="stylesheet"([^>]*?)>/g,
            (match: string, attrs: string) => {
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

      // HTML Plugin - inject env variables
      createHtmlPlugin({
        minify: true,
        inject: {
          data: {
            VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || '',
            VITE_SUPABASE_PUBLISHABLE_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
          },
        },
      }),

      // 1. Brotli Compression
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),

      // 2. Bundle Visualizer (only when mode=analyze)
      isAnalyze && visualizer({
        open: true,
        gzipSize: true,
        filename: "stats.html"
      }) as any,

      // 3. PWA Configuration
      VitePWA({
        registerType: 'prompt', // يظهر زر التحديث للمستخدم بدلاً من التحديث التلقائي
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
          manualChunks: undefined
        },
      },
    },
  };
});
