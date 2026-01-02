// vite.config.ts
import { defineConfig } from "file:///E:/synthwave-toolscape/node_modules/vite/dist/node/index.js";
import react from "file:///E:/synthwave-toolscape/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///E:/synthwave-toolscape/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///E:/synthwave-toolscape/node_modules/vite-plugin-pwa/dist/index.js";
import { visualizer } from "file:///E:/synthwave-toolscape/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { ViteImageOptimizer } from "file:///E:/synthwave-toolscape/node_modules/vite-plugin-image-optimizer/dist/index.js";
var __vite_injected_original_dirname = "E:\\synthwave-toolscape";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Image optimization for better performance
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      includePublic: true,
      logStats: true,
      png: { quality: 80 },
      jpeg: { quality: 75 },
      jpg: { quality: 75 },
      webp: { lossless: true },
      avif: { lossless: true }
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "\u0646\u0628\u0636 - \u062F\u0644\u064A\u0644 \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
        short_name: "\u0646\u0628\u0636 AI",
        description: "\u062F\u0644\u064A\u0644\u0643 \u0627\u0644\u0634\u0627\u0645\u0644 \u0644\u0623\u0641\u0636\u0644 \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
        theme_color: "#7c3aed",
        background_color: "#0f0a1a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        dir: "rtl",
        lang: "ar",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        // Include all static assets in precache
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,webp,avif}"],
        // Increase max file size for precaching large bundles
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // 5MB
        runtimeCaching: [
          // Cache Google Fonts (styles)
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache Google Fonts (font files)
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache Supabase API (dynamic data)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5
                // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 5
            }
          },
          // Cache Supabase Storage (images)
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "supabase-storage-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache external images
          {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "external-images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
                // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    }),
    mode === "production" && visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: "treemap"
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    chunkSizeWarningLimit: 1e3,
    // Optimized chunking for better FCP and load time
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/") || id.includes("node_modules/scheduler/")) {
            return "react-core";
          }
          if (id.includes("node_modules/react-router")) {
            return "router";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "tanstack";
          }
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          if (id.includes("node_modules/@radix-ui")) {
            return "ui-primitives";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          if (id.includes("node_modules/date-fns")) {
            return "date-utils";
          }
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform") || id.includes("node_modules/zod")) {
            return "forms";
          }
        }
      }
    },
    // Use esbuild for faster minification (default in Vite)
    target: "esnext",
    sourcemap: false
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9zeW50aHdhdmUtdG9vbHNjYXBlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcbmltcG9ydCB7IFZpdGVJbWFnZU9wdGltaXplciB9IGZyb20gXCJ2aXRlLXBsdWdpbi1pbWFnZS1vcHRpbWl6ZXJcIjtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gICAgLy8gSW1hZ2Ugb3B0aW1pemF0aW9uIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2VcclxuICAgIFZpdGVJbWFnZU9wdGltaXplcih7XHJcbiAgICAgIHRlc3Q6IC9cXC4oanBlP2d8cG5nfGdpZnx0aWZmfHdlYnB8c3ZnfGF2aWYpJC9pLFxyXG4gICAgICBpbmNsdWRlUHVibGljOiB0cnVlLFxyXG4gICAgICBsb2dTdGF0czogdHJ1ZSxcclxuICAgICAgcG5nOiB7IHF1YWxpdHk6IDgwIH0sXHJcbiAgICAgIGpwZWc6IHsgcXVhbGl0eTogNzUgfSxcclxuICAgICAganBnOiB7IHF1YWxpdHk6IDc1IH0sXHJcbiAgICAgIHdlYnA6IHsgbG9zc2xlc3M6IHRydWUgfSxcclxuICAgICAgYXZpZjogeyBsb3NzbGVzczogdHJ1ZSB9LFxyXG4gICAgfSksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcclxuICAgICAgaW5jbHVkZUFzc2V0czogW1wiZmF2aWNvbi5pY29cIiwgXCJyb2JvdHMudHh0XCIsIFwicHdhLTE5MngxOTIucG5nXCIsIFwicHdhLTUxMng1MTIucG5nXCJdLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6IFwiXHUwNjQ2XHUwNjI4XHUwNjM2IC0gXHUwNjJGXHUwNjQ0XHUwNjRBXHUwNjQ0IFx1MDYyM1x1MDYyRlx1MDY0OFx1MDYyN1x1MDYyQSBcdTA2MjdcdTA2NDRcdTA2MzBcdTA2NDNcdTA2MjdcdTA2MjEgXHUwNjI3XHUwNjQ0XHUwNjI3XHUwNjM1XHUwNjM3XHUwNjQ2XHUwNjI3XHUwNjM5XHUwNjRBXCIsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogXCJcdTA2NDZcdTA2MjhcdTA2MzYgQUlcIixcclxuICAgICAgICBkZXNjcmlwdGlvbjogXCJcdTA2MkZcdTA2NDRcdTA2NEFcdTA2NDRcdTA2NDMgXHUwNjI3XHUwNjQ0XHUwNjM0XHUwNjI3XHUwNjQ1XHUwNjQ0IFx1MDY0NFx1MDYyM1x1MDY0MVx1MDYzNlx1MDY0NCBcdTA2MjNcdTA2MkZcdTA2NDhcdTA2MjdcdTA2MkEgXHUwNjI3XHUwNjQ0XHUwNjMwXHUwNjQzXHUwNjI3XHUwNjIxIFx1MDYyN1x1MDY0NFx1MDYyN1x1MDYzNVx1MDYzN1x1MDY0Nlx1MDYyN1x1MDYzOVx1MDY0QVwiLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiM3YzNhZWRcIixcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiBcIiMwZjBhMWFcIixcclxuICAgICAgICBkaXNwbGF5OiBcInN0YW5kYWxvbmVcIixcclxuICAgICAgICBvcmllbnRhdGlvbjogXCJwb3J0cmFpdFwiLFxyXG4gICAgICAgIHNjb3BlOiBcIi9cIixcclxuICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxyXG4gICAgICAgIGRpcjogXCJydGxcIixcclxuICAgICAgICBsYW5nOiBcImFyXCIsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcIi9wd2EtMTkyeDE5Mi5wbmdcIixcclxuICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiBcImFueSBtYXNrYWJsZVwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6IFwiL3B3YS01MTJ4NTEyLnBuZ1wiLFxyXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXHJcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6IFwiYW55IG1hc2thYmxlXCJcclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICAvLyBJbmNsdWRlIGFsbCBzdGF0aWMgYXNzZXRzIGluIHByZWNhY2hlXHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbXCIqKi8qLntqcyxjc3MsaHRtbCxpY28scG5nLHN2Zyx3b2ZmLHdvZmYyLHdlYnAsYXZpZn1cIl0sXHJcbiAgICAgICAgLy8gSW5jcmVhc2UgbWF4IGZpbGUgc2l6ZSBmb3IgcHJlY2FjaGluZyBsYXJnZSBidW5kbGVzXHJcbiAgICAgICAgbWF4aW11bUZpbGVTaXplVG9DYWNoZUluQnl0ZXM6IDUgKiAxMDI0ICogMTAyNCwgLy8gNU1CXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIC8vIENhY2hlIEdvb2dsZSBGb250cyAoc3R5bGVzKVxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcImdvb2dsZS1mb250cy1jYWNoZVwiLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIC8vIENhY2hlIEdvb2dsZSBGb250cyAoZm9udCBmaWxlcylcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiBcIkNhY2hlRmlyc3RcIixcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogXCJnc3RhdGljLWZvbnRzLWNhY2hlXCIsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gMSB5ZWFyXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgLy8gQ2FjaGUgU3VwYWJhc2UgQVBJIChkeW5hbWljIGRhdGEpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvcmVzdFxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiTmV0d29ya0ZpcnN0XCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwic3VwYWJhc2UtYXBpLWNhY2hlXCIsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA1IC8vIDUgbWludXRlc1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgbmV0d29ya1RpbWVvdXRTZWNvbmRzOiA1XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICAvLyBDYWNoZSBTdXBhYmFzZSBTdG9yYWdlIChpbWFnZXMpXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvc3RvcmFnZVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6IFwiQ2FjaGVGaXJzdFwiLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiBcInN1cGFiYXNlLXN0b3JhZ2UtY2FjaGVcIixcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMDAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCAvLyAzMCBkYXlzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgLy8gQ2FjaGUgZXh0ZXJuYWwgaW1hZ2VzXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC4ocG5nfGpwZ3xqcGVnfHN2Z3xnaWZ8d2VicHxhdmlmKSQvaSxcclxuICAgICAgICAgICAgaGFuZGxlcjogXCJDYWNoZUZpcnN0XCIsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6IFwiZXh0ZXJuYWwtaW1hZ2VzLWNhY2hlXCIsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogNTAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzMCAvLyAzMCBkYXlzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KSxcclxuICAgIG1vZGUgPT09IFwicHJvZHVjdGlvblwiICYmIHZpc3VhbGl6ZXIoe1xyXG4gICAgICBmaWxlbmFtZTogXCJkaXN0L3N0YXRzLmh0bWxcIixcclxuICAgICAgb3BlbjogZmFsc2UsXHJcbiAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICBicm90bGlTaXplOiB0cnVlLFxyXG4gICAgICB0ZW1wbGF0ZTogXCJ0cmVlbWFwXCJcclxuICAgIH0pXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIC8vIE9wdGltaXplZCBjaHVua2luZyBmb3IgYmV0dGVyIEZDUCBhbmQgbG9hZCB0aW1lXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XHJcbiAgICAgICAgICAvLyBSZWFjdCBjb3JlIC0gbG9hZGVkIGZpcnN0IGZvciBhbGwgcGFnZXNcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3JlYWN0LycpIHx8XHJcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QtZG9tLycpIHx8XHJcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvc2NoZWR1bGVyLycpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAncmVhY3QtY29yZSc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUmVhY3QgUm91dGVyIC0gbmVlZGVkIGZvciBuYXZpZ2F0aW9uXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9yZWFjdC1yb3V0ZXInKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3JvdXRlcic7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gVGFuU3RhY2sgUXVlcnkgLSBkYXRhIGZldGNoaW5nXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AdGFuc3RhY2snKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3RhbnN0YWNrJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBTdXBhYmFzZSBjbGllbnRcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL0BzdXBhYmFzZScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnc3VwYWJhc2UnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFVJIENvbXBvbmVudHMgKFJhZGl4IHByaW1pdGl2ZXMpXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AcmFkaXgtdWknKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3VpLXByaW1pdGl2ZXMnO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEljb25zIC0gbG9hZGVkIG9uIGRlbWFuZFxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvbHVjaWRlLXJlYWN0JykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdpY29ucyc7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRGF0ZSB1dGlsaXRpZXNcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2RhdGUtZm5zJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICdkYXRlLXV0aWxzJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBGb3JtIHV0aWxpdGllc1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMvcmVhY3QtaG9vay1mb3JtJykgfHxcclxuICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcy9AaG9va2Zvcm0nKSB8fFxyXG4gICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3pvZCcpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnZm9ybXMnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gVXNlIGVzYnVpbGQgZm9yIGZhc3RlciBtaW5pZmljYXRpb24gKGRlZmF1bHQgaW4gVml0ZSlcclxuICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gIH1cclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdQLFNBQVMsb0JBQW9CO0FBQ3JSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxlQUFlO0FBQ3hCLFNBQVMsa0JBQWtCO0FBQzNCLFNBQVMsMEJBQTBCO0FBTm5DLElBQU0sbUNBQW1DO0FBU3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFB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
