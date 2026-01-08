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
          // تقسيم ملفات المكتبات الكبيرة لتقليل حجم الملف الرئيسي
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Add ui library chunk
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui';
            }
            // Add animation library chunk
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
          }
        },
      },
    },
  },
}));
