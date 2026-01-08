import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
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
    target: "esnext", // استهداف المتصفحات الحديثة فقط (يحذف الـ Polyfills القديمة)
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // فصل React Core عن DOM (لأن DOM أثقل)
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react-core';

            // فصل Supabase
            if (id.includes('@supabase')) return 'vendor-supabase';

            // فصل مكتبات التصميم (Radix UI ثقيلة وتستخدم في Shadcn)
            if (id.includes('@radix-ui')) return 'vendor-ui-radix';

            // فصل مكتبات الرسوم (Lucide / Framer Motion)
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('framer-motion')) return 'vendor-animation';

            // باقي المكتبات تذهب في ملف vendor عام
            return 'vendor-utils';
          }
        },
      },
    },
  },
}));
