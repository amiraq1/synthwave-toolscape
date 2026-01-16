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
        // Simplified Manual Chunking - Only separate truly lazy-loaded heavy libraries
        // to avoid TDZ (Temporal Dead Zone) initialization errors
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory")) {
              return "vendor-charts";
            }
            if (id.includes("reactflow") || id.includes("@reactflow")) {
              return "vendor-flow";
            }
            return "vendor";
          }
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxzeW50aHdhdmUtdG9vbHNjYXBlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9zeW50aHdhdmUtdG9vbHNjYXBlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tIFwidml0ZS1wbHVnaW4tcHdhXCI7XHJcbmltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSBcInZpdGUtcGx1Z2luLWNvbXByZXNzaW9uXCI7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogJ2RlZmVyLWNzcycsXHJcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxyXG4gICAgICB0cmFuc2Zvcm1JbmRleEh0bWwoaHRtbCkge1xyXG4gICAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoXHJcbiAgICAgICAgICAvPGxpbmtcXHMrcmVsPVwic3R5bGVzaGVldFwiKFtePl0qPyk+L2csXHJcbiAgICAgICAgICAobWF0Y2gsIGF0dHJzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhyZWZNYXRjaCA9IGF0dHJzLm1hdGNoKC9ocmVmPVwiKFteXCJdKylcIi8pO1xyXG4gICAgICAgICAgICBpZiAoIWhyZWZNYXRjaCkgcmV0dXJuIG1hdGNoO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgaHJlZiA9IGhyZWZNYXRjaFsxXTtcclxuICAgICAgICAgICAgY29uc3QgY3Jvc3NvcmlnaW5NYXRjaCA9IGF0dHJzLm1hdGNoKC9cXHNjcm9zc29yaWdpbig/Oj1cIlteXCJdKlwiKT8vKTtcclxuICAgICAgICAgICAgY29uc3QgY3Jvc3NvcmlnaW4gPSBjcm9zc29yaWdpbk1hdGNoID8gY3Jvc3NvcmlnaW5NYXRjaFswXSA6ICcnO1xyXG4gICAgICAgICAgICBjb25zdCBwcmVsb2FkVGFnID0gYDxsaW5rIHJlbD1cInByZWxvYWRcIiBhcz1cInN0eWxlXCIgaHJlZj1cIiR7aHJlZn1cIiR7Y3Jvc3NvcmlnaW59IG9ubG9hZD1cInRoaXMub25sb2FkPW51bGw7dGhpcy5yZWw9J3N0eWxlc2hlZXQnXCI+YDtcclxuICAgICAgICAgICAgY29uc3Qgbm9zY3JpcHRUYWcgPSBgPG5vc2NyaXB0PjxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiJHtocmVmfVwiJHtjcm9zc29yaWdpbn0+PC9ub3NjcmlwdD5gO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGAke3ByZWxvYWRUYWd9XFxuJHtub3NjcmlwdFRhZ31gO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICApO1xyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxyXG5cclxuICAgIC8vIDEuIEJyb3RsaSBDb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxyXG4gICAgICBleHQ6ICcuYnInLFxyXG4gICAgICB0aHJlc2hvbGQ6IDEwMjQsXHJcbiAgICB9KSxcclxuXHJcbiAgICAvLyAyLiBCdW5kbGUgVmlzdWFsaXplclxyXG4gICAgdmlzdWFsaXplcih7XHJcbiAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICBmaWxlbmFtZTogXCJzdGF0cy5odG1sXCJcclxuICAgIH0pIGFzIGFueSxcclxuXHJcbiAgICAvLyAzLiBQV0EgQ29uZmlndXJhdGlvblxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmplY3RSZWdpc3RlcjogbnVsbCwgLy8gUHJldmVudCByZW5kZXItYmxvY2tpbmcgLSB3ZSBtYW51YWxseSByZWdpc3RlciBTVyBhZnRlciBwYWdlIGxvYWRcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0JywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1x1MDY0Nlx1MDYyOFx1MDYzNiBBSScsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ05hYmRoIEFJJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1x1MDYyRlx1MDY0NFx1MDY0QVx1MDY0NFx1MDY0MyBcdTA2MjdcdTA2NDRcdTA2MzRcdTA2MjdcdTA2NDVcdTA2NDQgXHUwNjQ0XHUwNjIzXHUwNjJGXHUwNjQ4XHUwNjI3XHUwNjJBIFx1MDYyN1x1MDY0NFx1MDYzMFx1MDY0M1x1MDYyN1x1MDYyMSBcdTA2MjdcdTA2NDRcdTA2MjdcdTA2MzVcdTA2MzdcdTA2NDZcdTA2MjdcdTA2MzlcdTA2NEEnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzBmMGYxYScsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwZjBmMWEnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICdwd2EtMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJ1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAncHdhLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZydcclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7IHN0YXR1c2VzOiBbMCwgMjAwXSB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9eaHR0cHM6XFwvXFwvLipcXC5zdXBhYmFzZVxcLmNvXFwvc3RvcmFnZVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdTdGFsZVdoaWxlUmV2YWxpZGF0ZScsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdzdXBhYmFzZS1pbWFnZXMnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogNTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDcgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG5cclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgYnVpbGQ6IHtcclxuICAgIHRhcmdldDogXCJlc25leHRcIixcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNjAwLFxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsXHJcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogdHJ1ZSxcclxuICAgICAgICBwdXJlX2Z1bmNzOiBbJ2NvbnNvbGUubG9nJywgJ2NvbnNvbGUuaW5mbycsICdjb25zb2xlLmRlYnVnJ10sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBTaW1wbGlmaWVkIE1hbnVhbCBDaHVua2luZyAtIE9ubHkgc2VwYXJhdGUgdHJ1bHkgbGF6eS1sb2FkZWQgaGVhdnkgbGlicmFyaWVzXHJcbiAgICAgICAgLy8gdG8gYXZvaWQgVERaIChUZW1wb3JhbCBEZWFkIFpvbmUpIGluaXRpYWxpemF0aW9uIGVycm9yc1xyXG4gICAgICAgIG1hbnVhbENodW5rcyhpZCkge1xyXG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMnKSkge1xyXG4gICAgICAgICAgICAvLyA9PT0gSEVBVlkgTElCUkFSSUVTIFRIQVQgQVJFIExBWlkgTE9BREVEID09PVxyXG4gICAgICAgICAgICAvLyBUaGVzZSBhcmUgc2FmZSB0byBzZXBhcmF0ZSBiZWNhdXNlIHRoZXkncmUgb25seSBpbXBvcnRlZCBkeW5hbWljYWxseVxyXG5cclxuICAgICAgICAgICAgLy8gMS4gQ2hhcnRzIChyZWNoYXJ0cyArIGQzKSAtIE9OTFkgZm9yIEFkbWluIHBhZ2UgKH40MDBLQilcclxuICAgICAgICAgICAgLy8gQWRtaW5DaGFydHMgaXMgbGF6eSBsb2FkZWQgd2l0aCBSZWFjdC5sYXp5KClcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWNoYXJ0cycpIHx8IGlkLmluY2x1ZGVzKCdkMy0nKSB8fCBpZC5pbmNsdWRlcygndmljdG9yeScpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItY2hhcnRzJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gMi4gUmVhY3RGbG93IC0gT05MWSBmb3IgV29ya2Zsb3dCdWlsZGVyIHBhZ2UgKH45MEtCKVxyXG4gICAgICAgICAgICAvLyBXb3JrZmxvd0J1aWxkZXIgaXMgbGF6eSBsb2FkZWQgd2l0aCBSZWFjdC5sYXp5KClcclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdGZsb3cnKSB8fCBpZC5pbmNsdWRlcygnQHJlYWN0ZmxvdycpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3ItZmxvdyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vID09PSBBTEwgT1RIRVIgTk9ERV9NT0RVTEVTIEdPIElOVE8gdmVuZG9yID09PVxyXG4gICAgICAgICAgICAvLyBUaGlzIGVuc3VyZXMgcHJvcGVyIGluaXRpYWxpemF0aW9uIG9yZGVyXHJcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1AsU0FBUyxvQkFBb0I7QUFDclIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLGVBQWU7QUFDeEIsT0FBTyxxQkFBcUI7QUFDNUIsU0FBUyxrQkFBa0I7QUFOM0IsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1A7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxNQUNQLG1CQUFtQixNQUFNO0FBQ3ZCLGVBQU8sS0FBSztBQUFBLFVBQ1Y7QUFBQSxVQUNBLENBQUMsT0FBTyxVQUFVO0FBQ2hCLGtCQUFNLFlBQVksTUFBTSxNQUFNLGdCQUFnQjtBQUM5QyxnQkFBSSxDQUFDLFVBQVcsUUFBTztBQUV2QixrQkFBTSxPQUFPLFVBQVUsQ0FBQztBQUN4QixrQkFBTSxtQkFBbUIsTUFBTSxNQUFNLDRCQUE0QjtBQUNqRSxrQkFBTSxjQUFjLG1CQUFtQixpQkFBaUIsQ0FBQyxJQUFJO0FBQzdELGtCQUFNLGFBQWEsd0NBQXdDLElBQUksSUFBSSxXQUFXO0FBQzlFLGtCQUFNLGNBQWMsMENBQTBDLElBQUksSUFBSSxXQUFX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
