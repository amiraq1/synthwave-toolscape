import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2, // تمريرتين للضغط الأقصى
      },
    },
    // تحسين حجم الـ chunks
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // تقسيم ذكي للملفات
        manualChunks: {
          // فصل Supabase (كبير جداً ~160KB)
          'supabase': ['@supabase/supabase-js'],
          // فصل مكتبات UI الثقيلة
          'radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
          ],
          // فصل TanStack Query
          'query': ['@tanstack/react-query'],
          // فصل date-fns
          'date': ['date-fns'],
        },
      },
    },
  },
}));
