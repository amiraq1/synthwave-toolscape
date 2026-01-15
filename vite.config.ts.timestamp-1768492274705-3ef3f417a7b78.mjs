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
    {
      name: "defer-css",
      apply: "build",
      transformIndexHtml(html) {
        return html.replace(
          /<link\s+rel="stylesheet"([^>]*?)>/g,
          (match, attrs) => {
            const hrefMatch = attrs.match(/href="([^"]+)"/);
            if (!hrefMatch) return match;
            const href = hrefMatch[1];
            const crossoriginMatch = attrs.match(/\scrossorigin(?:="[^"]*")?/);
            const crossorigin = crossoriginMatch ? crossoriginMatch[0] : "";
            const preloadTag = `<link rel="preload" as="style" href="${href}"${crossorigin} onload="this.onload=null;this.rel='stylesheet'">`;
            const noscriptTag = `<noscript><link rel="stylesheet" href="${href}"${crossorigin}></noscript>`;
            return `${preloadTag}
${noscriptTag}`;
          }
        );
      }
    },
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
    chunkSizeWarningLimit: 600,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"]
      }
    },
    rollupOptions: {
      output: {
        // Smart Manual Chunking - Optimized for Critical Path
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("react") && !id.includes("react-router") && !id.includes("react-hook-form") && !id.includes("reactflow") && !id.includes("react-day-picker") && !id.includes("react-easy-crop") && !id.includes("react-markdown") && !id.includes("react-i18next") && !id.includes("react-helmet") && !id.includes("react-hot-toast") && !id.includes("react-resizable")) {
              return "vendor-react-core";
            }
            if (id.includes("react-router")) return "vendor-router";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("@tanstack")) return "vendor-query";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) {
              return "vendor-charts";
            }
            if (id.includes("reactflow") || id.includes("@reactflow")) {
              return "vendor-flow";
            }
            if (id.includes("lucide-react")) return "vendor-icons";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("class-variance-authority") || id.includes("clsx") || id.includes("tailwind-merge")) {
              return "vendor-ui-utils";
            }
            if (id.includes("zod") || id.includes("react-hook-form") || id.includes("@hookform")) {
              return "vendor-forms";
            }
            if (id.includes("i18next") || id.includes("react-i18next")) return "vendor-i18n";
            if (id.includes("date-fns") || id.includes("dayjs")) return "vendor-dates";
            if (id.includes("react-markdown") || id.includes("remark") || id.includes("rehype")) {
              return "vendor-markdown";
            }
            if (id.includes("react-easy-crop")) return "vendor-image-crop";
            if (id.includes("@sentry")) return "vendor-sentry";
            if (id.includes("embla-carousel")) return "vendor-carousel";
            if (id.includes("sonner") || id.includes("react-hot-toast")) return "vendor-toasts";
            if (id.includes("cmdk")) return "vendor-cmdk";
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9zeW50aHdhdmUtdG9vbHNjYXBlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogJ2RlZmVyLWNzcycsXHJcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxyXG4gICAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xyXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoXHJcbiAgICAgICAgICAvPGxpbmtcXHMrcmVsPVwic3R5bGVzaGVldFwiKFtePl0qPyk+L2csXHJcbiAgICAgICAgICAobWF0Y2gsIGF0dHJzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhyZWZNYXRjaCA9IGF0dHJzLm1hdGNoKC9ocmVmPVwiKFteXCJdKylcIi8pO1xyXG4gICAgICAgICAgICBpZiAoIWhyZWZNYXRjaCkgcmV0dXJuIG1hdGNoO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGhyZWZNYXRjaFsxXTtcclxuICAgICAgICAgICAgY29uc3QgY3Jvc3NvcmlnaW5NYXRjaCA9IGF0dHJzLm1hdGNoKC9cXHNjcm9zc29yaWdpbig/Oj1cIlteXCJdKlwiKT8vKTtcclxuICAgICAgICAgICAgY29uc3QgY3Jvc3NvcmlnaW4gPSBjcm9zc29yaWdpbk1hdGNoID8gY3Jvc3NvcmlnaW5NYXRjaFswXSA6ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkVGFnID0gYDxsaW5rIHJlbD1cInByZWxvYWRcIiBhcz1cInN0eWxlXCIgaHJlZj1cIiR7aHJlZn1cIiR7Y3Jvc3NvcmlnaW59IG9ubG9hZD1cInRoaXMub25sb2FkPW51bGw7dGhpcy5yZWw9J3N0eWxlc2hlZXQnXCI+YDtcclxuICAgICAgICAgICAgY29uc3Qgbm9zY3JpcHRUYWcgPSBgPG5vc2NyaXB0PjxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJHtocmVmfVwiJHtjcm9zc29yaWdpbn0+PC9ub3NjcmlwdD5gO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke3ByZWxvYWRUYWd9XFxuJHtub3NjcmlwdFRhZ31gO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG5cclxuICAgIC8vIDEuIEJyb3RsaSBDb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxyXG4gICAgICBleHQ6ICcuYnInLFxyXG4gICAgICB0aHJlc2hvbGQ6IDEwMjQsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyAyLiBCdW5kbGUgVmlzdWFsaXplclxyXG4gICAgdmlzdWFsaXplcih7XHJcbiAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICBmaWxlbmFtZTogXCJzdGF0cy5odG1sXCJcclxuICAgIH0pIGFzIGFueSxcclxuXHJcbiAgICAvLyAzLiBQV0EgQ29uZmlndXJhdGlvblxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmplY3RSZWdpc3RlcjogbnVsbCwgLy8gUHJldmVudCByZW5kZXItYmxvY2tpbmcgLSB3ZSBtYW51YWxseSByZWdpc3RlciBTVyBhZnRlciBwYWdlIGxvYWRcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0JywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1x1MDY0Nlx1MDYyOFx1MDYzNiBBSScsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ05hYmRoIEFJJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDYyRlx1MDY0NFx1MDY0QVx1MDY0NFx1MDY0MyBcdTA2MjdcdTA2NDRcdTA2MzRcdTA2MjdcdTA2NDVcdTA2NDQgXHUwNjQ0XHUwNjIzXHUwNjJGXHUwNjQ4XHUwNjI3XHUwNjJBIFx1MDYyN1x1MDY0NFx1MDYzMFx1MDY0M1x1MDYyN1x1MDYyMSBcdTA2MjdcdTA2NDRcdTA2MjdcdTA2MzVcdTA2MzdcdTA2NDZcdTA2MjdcdTA2MzlcdTA2NEEnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzBmMGYxYScsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwZjBmMWEnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvc3RvcmFnZVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdTdGFsZVdoaWxlUmV2YWxpZGF0ZScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzdXBhYmFzZS1pbWFnZXMnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogNTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDcgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG5cclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIHRhcmdldDogXCJlc25leHRcIixcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXHJcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgICAgICBwdXJlX2Z1bmNzOiBbJ2NvbnNvbGUubG9nJywgJ2NvbnNvbGUuaW5mbycsICdjb25zb2xlLmRlYnVnJ10sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBTbWFydCBNYW51YWwgQ2h1bmtpbmcgLSBPcHRpbWl6ZWQgZm9yIENyaXRpY2FsIFBhdGhcclxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgLy8gMS4gUmVhY3QgQ29yZSAtIGFic29sdXRlIG1pbmltdW0gZm9yIGFwcCB0byB3b3JrXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QtZG9tJykgfHwgKGlkLmluY2x1ZGVzKCdyZWFjdCcpICYmICFpZC5pbmNsdWRlcygncmVhY3Qtcm91dGVyJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1ob29rLWZvcm0nKSAmJiAhaWQuaW5jbHVkZXMoJ3JlYWN0ZmxvdycpICYmICFpZC5pbmNsdWRlcygncmVhY3QtZGF5LXBpY2tlcicpICYmICFpZC5pbmNsdWRlcygncmVhY3QtZWFzeS1jcm9wJykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1tYXJrZG93bicpICYmICFpZC5pbmNsdWRlcygncmVhY3QtaTE4bmV4dCcpICYmICFpZC5pbmNsdWRlcygncmVhY3QtaGVsbWV0JykgJiYgIWlkLmluY2x1ZGVzKCdyZWFjdC1ob3QtdG9hc3QnKSAmJiAhaWQuaW5jbHVkZXMoJ3JlYWN0LXJlc2l6YWJsZScpKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAndmVuZG9yLXJlYWN0LWNvcmUnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAyLiBSZWFjdCBSb3V0ZXIgLSBuZWVkZWQgZm9yIG5hdmlnYXRpb25cclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC1yb3V0ZXInKSkgcmV0dXJuICd2ZW5kb3Itcm91dGVyJztcclxuXHJcbiAgICAgICAgICAgIC8vIDMuIFN1cGFiYXNlIC0gc2VwYXJhdGUgYnV0IGVzc2VudGlhbFxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0BzdXBhYmFzZScpKSByZXR1cm4gJ3ZlbmRvci1zdXBhYmFzZSc7XHJcblxyXG4gICAgICAgICAgICAvLyA0LiBRdWVyeSAtIG5lZWRlZCBmb3IgZGF0YSBmZXRjaGluZ1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ0B0YW5zdGFjaycpKSByZXR1cm4gJ3ZlbmRvci1xdWVyeSc7XHJcblxyXG4gICAgICAgICAgICAvLyA9PT0gSEVBVlkgTElCUkFSSUVTIC0gTEFaWSBMT0FERUQgPT09XHJcblxyXG4gICAgICAgICAgICAvLyA1LiBDaGFydHMgKHJlY2hhcnRzICsgZDMpIC0gT05MWSBmb3IgQWRtaW4gcGFnZSAofjE1MEtCKVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykgfHwgaWQuaW5jbHVkZXMoJ2QzLScpIHx8IGlkLmluY2x1ZGVzKCd2aWN0b3J5JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1jaGFydHMnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyA2LiBSZWFjdEZsb3cgLSBPTkxZIGZvciBXb3JrZmxvd0J1aWxkZXIgcGFnZSAofjIwMEtCKVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0ZmxvdycpIHx8IGlkLmluY2x1ZGVzKCdAcmVhY3RmbG93JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1mbG93JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gNy4gSWNvbnMgLSBmcmVxdWVudGx5IHVzZWQgYnV0IHRyZWUtc2hha2VhYmxlXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbHVjaWRlLXJlYWN0JykpIHJldHVybiAndmVuZG9yLWljb25zJztcclxuXHJcbiAgICAgICAgICAgIC8vIDguIFVJIENvcmUgKFJhZGl4KSAtIGVzc2VudGlhbCBmb3IgVUlcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAcmFkaXgtdWknKSkgcmV0dXJuICd2ZW5kb3ItcmFkaXgnO1xyXG5cclxuICAgICAgICAgICAgLy8gOS4gVUkgVXRpbHMgKGxpZ2h0d2VpZ2h0KVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NsYXNzLXZhcmlhbmNlLWF1dGhvcml0eScpIHx8IGlkLmluY2x1ZGVzKCdjbHN4JykgfHwgaWQuaW5jbHVkZXMoJ3RhaWx3aW5kLW1lcmdlJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci11aS11dGlscyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDEwLiBGb3JtcyAmIFZhbGlkYXRpb24gLSBmb3IgcGFnZXMgd2l0aCBmb3Jtc1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3pvZCcpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1ob29rLWZvcm0nKSB8fCBpZC5pbmNsdWRlcygnQGhvb2tmb3JtJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1mb3Jtcyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIDExLiBpMThuIC0gY2FuIGJlIHNsaWdodGx5IGRlbGF5ZWRcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdpMThuZXh0JykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWkxOG5leHQnKSkgcmV0dXJuICd2ZW5kb3ItaTE4bic7XHJcblxyXG4gICAgICAgICAgICAvLyAxMi4gRGF0ZSB1dGlsaXRpZXNcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdkYXRlLWZucycpIHx8IGlkLmluY2x1ZGVzKCdkYXlqcycpKSByZXR1cm4gJ3ZlbmRvci1kYXRlcyc7XHJcblxyXG4gICAgICAgICAgICAvLyAxMy4gTWFya2Rvd24gLSBmb3IgYmxvZyBwYWdlcyBvbmx5XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QtbWFya2Rvd24nKSB8fCBpZC5pbmNsdWRlcygncmVtYXJrJykgfHwgaWQuaW5jbHVkZXMoJ3JlaHlwZScpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItbWFya2Rvd24nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyAxNC4gSW1hZ2UgY3JvcHBpbmcgLSBmb3IgcHJvZmlsZS9hZG1pbiBvbmx5XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygncmVhY3QtZWFzeS1jcm9wJykpIHJldHVybiAndmVuZG9yLWltYWdlLWNyb3AnO1xyXG5cclxuICAgICAgICAgICAgLy8gMTUuIFNlbnRyeSAtIG1vbml0b3JpbmcsIGxvYWQgbGF6aWx5XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHNlbnRyeScpKSByZXR1cm4gJ3ZlbmRvci1zZW50cnknO1xyXG5cclxuICAgICAgICAgICAgLy8gMTYuIE90aGVyIGhlYXZ5IGxpYnNcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdlbWJsYS1jYXJvdXNlbCcpKSByZXR1cm4gJ3ZlbmRvci1jYXJvdXNlbCc7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnc29ubmVyJykgfHwgaWQuaW5jbHVkZXMoJ3JlYWN0LWhvdC10b2FzdCcpKSByZXR1cm4gJ3ZlbmRvci10b2FzdHMnO1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2NtZGsnKSkgcmV0dXJuICd2ZW5kb3ItY21kayc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdQLFNBQVMsb0JBQW9CO0FBQ3JSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsU0FBUyxlQUFlO0FBQ3hCLE9BQU8scUJBQXFCO0FBQzVCLFNBQVMsa0JBQWtCO0FBTjNCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FB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
