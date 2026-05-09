import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
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
      apply: 'build' as const,
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

    // 1. Brotli Compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),

    // 2. Bundle Visualizer
    visualizer({
      open: process.env.ANALYZE === 'true',
      gzipSize: true,
      filename: "stats.html"
    }) as PluginOption,

    // 3. PWA Configuration - cleanly disabled for stability, let main.tsx clean caches
    // VitePWA({}) // Removed to avoid conflicts
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@synthwave/utils": path.resolve(__dirname, "./packages/utils/src"),
      "@synthwave/ui": path.resolve(__dirname, "./packages/ui/src"),
      "@synthwave/api": path.resolve(__dirname, "./packages/api/src"),
      "@synthwave/hooks": path.resolve(__dirname, "./packages/hooks/src"),
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
        // Simplified Manual Chunking - Only separate truly lazy-loaded heavy libraries
        // to avoid TDZ (Temporal Dead Zone) initialization errors
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 1. Charts (recharts + d3) - ONLY for Admin page
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts';
            }
            // 2. ReactFlow - ONLY for WorkflowBuilder page
            if (id.includes('reactflow') || id.includes('@reactflow')) {
              return 'vendor-flow';
            }
            // === ALL OTHER NODE_MODULES GO INTO vendor ===
            return 'vendor';
          }
        },
      },
    },
  },
}));
