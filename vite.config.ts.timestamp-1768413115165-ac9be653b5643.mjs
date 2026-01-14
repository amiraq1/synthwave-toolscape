// vite.config.ts
import { defineConfig } from "file:///D:/synthwave-toolscape/node_modules/vite/dist/node/index.js";
import react from "file:///D:/synthwave-toolscape/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///D:/synthwave-toolscape/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///D:/synthwave-toolscape/node_modules/vite-plugin-pwa/dist/index.js";
import viteCompression from "file:///D:/synthwave-toolscape/node_modules/vite-plugin-compression/dist/index.mjs";
import { visualizer } from "file:///D:/synthwave-toolscape/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "D:\\synthwave-toolscape";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // 1. Brotli Compression
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024
    }),
    // 2. Bundle Visualizer
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html"
    }),
    // 3. PWA Configuration
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      // Prevent render-blocking - we manually register SW after page load
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "\u0646\u0628\u0636 AI",
        short_name: "Nabdh AI",
        description: "\u062F\u0644\u064A\u0644\u0643 \u0627\u0644\u0634\u0627\u0645\u0644 \u0644\u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A",
        theme_color: "#0f0f1a",
        background_color: "#0f0f1a",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "supabase-images",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    target: "esnext",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1e3,
    rollupOptions: {
      output: {
        // Smart Manual Chunking
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@sentry")) return "vendor-sentry";
          }
          if (id.includes("@radix-ui") || id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) {
            return "vendor-ui-core";
          }
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("framer-motion")) return "vendor-animation";
          if (id.includes("recharts") || id.includes("chart.js") || id.includes("d3")) {
            return "vendor-charts";
          }
          if (id.includes("zod") || id.includes("react-hook-form")) {
            return "vendor-forms";
          }
          if (id.includes("date-fns") || id.includes("dayjs") || id.includes("moment")) {
            return "vendor-dates";
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9zeW50aHdhdmUtdG9vbHNjYXBlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG5cclxuICAgIC8vIDEuIEJyb3RsaSBDb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxyXG4gICAgICBleHQ6ICcuYnInLFxyXG4gICAgICB0aHJlc2hvbGQ6IDEwMjQsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyAyLiBCdW5kbGUgVmlzdWFsaXplclxyXG4gICAgdmlzdWFsaXplcih7XHJcbiAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICBicm90bGlTaXplOiB0cnVlLFxyXG4gICAgICBmaWxlbmFtZTogXCJzdGF0cy5odG1sXCJcclxuICAgIH0pIGFzIGFueSxcclxuXHJcbiAgICAvLyAzLiBQV0EgQ29uZmlndXJhdGlvblxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmplY3RSZWdpc3RlcjogbnVsbCwgLy8gUHJldmVudCByZW5kZXItYmxvY2tpbmcgLSB3ZSBtYW51YWxseSByZWdpc3RlciBTVyBhZnRlciBwYWdlIGxvYWRcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0JywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1x1MDY0Nlx1MDYyOFx1MDYzNiBBSScsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ05hYmRoIEFJJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDYyRlx1MDY0NFx1MDY0QVx1MDY0NFx1MDY0MyBcdTA2MjdcdTA2NDRcdTA2MzRcdTA2MjdcdTA2NDVcdTA2NDQgXHUwNjQ0XHUwNjIzXHUwNjJGXHUwNjQ4XHUwNjI3XHUwNjJBIFx1MDYyN1x1MDY0NFx1MDYzMFx1MDY0M1x1MDYyN1x1MDYyMSBcdTA2MjdcdTA2NDRcdTA2MjdcdTA2MzVcdTA2MzdcdTA2NDZcdTA2MjdcdTA2MzlcdTA2NEEnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzBmMGYxYScsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwZjBmMWEnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvc3RvcmFnZVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdTdGFsZVdoaWxlUmV2YWxpZGF0ZScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzdXBhYmFzZS1pbWFnZXMnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogNTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDcgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG5cclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIHRhcmdldDogXCJlc25leHRcIixcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgLy8gU21hcnQgTWFudWFsIENodW5raW5nXHJcbiAgICAgICAgbWFudWFsQ2h1bmtzKGlkKSB7XHJcbiAgICAgICAgICAvLyBTaW1wbGlmaWVkIGNodW5raW5nIHRvIGF2b2lkIGluaXRpYWxpemF0aW9uIG9yZGVyIGlzc3Vlc1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BzZW50cnknKSkgcmV0dXJuICd2ZW5kb3Itc2VudHJ5JztcclxuICAgICAgICAgICAgLy8gS2VlcCBvdGhlciBzcGVjaWZpYyBjaHVua3MgaWYgbmVlZGVkLCBidXQgbGV0IGNvcmUgcmVhY3Qvc3VwYWJhc2Ugc3RheSB0b2dldGhlciBvciBmb2xsb3cgZGVmYXVsdCBzcGxpdHRpbmdcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyAzLiBVSSBMaWJyYXJpZXMgKFJhZGl4LCBTaGFkY24gZGVwZW5kZW5jaWVzKVxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAcmFkaXgtdWknKSB8fCBpZC5pbmNsdWRlcygnY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5JykgfHwgaWQuaW5jbHVkZXMoJ2Nsc3gnKSB8fCBpZC5pbmNsdWRlcygndGFpbHdpbmQtbWVyZ2UnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci11aS1jb3JlJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyA0LiBJY29uc1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkgcmV0dXJuICd2ZW5kb3ItaWNvbnMnO1xyXG5cclxuICAgICAgICAgIC8vIDUuIEFuaW1hdGlvblxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdmcmFtZXItbW90aW9uJykpIHJldHVybiAndmVuZG9yLWFuaW1hdGlvbic7XHJcblxyXG4gICAgICAgICAgLy8gNi4gRGF0YSBWaXN1YWxpemF0aW9uXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykgfHwgaWQuaW5jbHVkZXMoJ2NoYXJ0LmpzJykgfHwgaWQuaW5jbHVkZXMoJ2QzJykpIHtcclxuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItY2hhcnRzJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyA3LiBGb3JtcyAmIFZhbGlkYXRpb25cclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnem9kJykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWhvb2stZm9ybScpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yLWZvcm1zJztcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyA4LiBEYXRlIE1hbmlwdWxhdGlvblxyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdkYXRlLWZucycpIHx8IGlkLmluY2x1ZGVzKCdkYXlqcycpIHx8IGlkLmluY2x1ZGVzKCdtb21lbnQnKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1kYXRlcyc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdQLFNBQVMsb0JBQW9CO0FBQ3JSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxlQUFlO0FBQ3hCLE9BQU8scUJBQXFCO0FBQzVCLFNBQVMsa0JBQWtCO0FBTjNCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBO0FBQUEsSUFHMUMsZ0JBQWdCO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsTUFDTCxXQUFXO0FBQUEsSUFDYixDQUFDO0FBQUE7QUFBQSxJQUdELFdBQVc7QUFBQSxNQUNULE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxNQUNaLFVBQVU7QUFBQSxJQUNaLENBQUM7QUFBQTtBQUFBLElBR0QsUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZ0JBQWdCO0FBQUE7QUFBQSxNQUNoQixlQUFlLENBQUMsZUFB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
