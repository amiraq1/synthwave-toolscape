import { defineConfig, loadEnv, type PluginOption } from "vite";
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
      {
        name: 'inject-csp',
        apply: 'build',
        transformIndexHtml(html: string) {
          const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https: data:; script-src 'self' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://*.heap-api.com https://*.heapanalytics.com https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://hcaptcha.com https://*.hcaptcha.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://static.cloudflareinsights.com https://*.heap-api.com https://*.heapanalytics.com https://hcaptcha.com https://*.hcaptcha.com; frame-src https://hcaptcha.com https://*.hcaptcha.com;">`;
          return html.replace('</head>', `  ${csp}\n</head>`);
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
      ...(isAnalyze ? [visualizer({
        open: true,
        gzipSize: true,
        filename: "stats.html"
      }) as unknown as PluginOption] : []),

      // 3. PWA Configuration
      VitePWA({
        registerType: 'prompt', // show update prompt instead of auto-refresh
        injectRegister: null, // Prevent render-blocking - we manually register SW after page load
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'Nabd AI',
          short_name: 'Nabd AI',
          description: 'Your complete guide to AI tools',
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
    ].filter(Boolean) as PluginOption[],

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
          manualChunks(id: string) {
            if (!id.includes("node_modules")) {
              return;
            }

            // Keep React/runtime in its own stable chunk so feature chunks
            // (like charts) don't become entry-time dependencies.
            if (
              id.includes("/react/") ||
              id.includes("/react-dom/") ||
              id.includes("/scheduler/")
            ) {
              return "vendor-react";
            }

            if (id.includes("/@tanstack/")) {
              return "vendor-query";
            }

            if (id.includes("/@supabase/")) {
              return "vendor-supabase";
            }

            if (id.includes("/i18next") || id.includes("/react-i18next")) {
              return "vendor-i18n";
            }

            if (id.includes("/dayjs/")) {
              return "vendor-dayjs";
            }

            if (id.includes("/react-router-dom/") || id.includes("/react-router/")) {
              return "vendor-router";
            }

            if (id.includes("/reactflow/")) {
              return "vendor-reactflow";
            }

            if (id.includes("/framer-motion/")) {
              return "vendor-motion";
            }

            if (id.includes("/cmdk/")) {
              return "vendor-cmdk";
            }

            // Let Rollup split the rest by import graph.
            return;
          }
        },
      },
    },
  };
});
