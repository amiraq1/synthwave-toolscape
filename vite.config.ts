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
          // 1. عزل مكتبات React الأساسية
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react-core';
          }

          // 2. عزل Supabase (لأنه ثقيل)
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }

          // 3. عزل Sentry (لأنه للمراقبة فقط ولا يؤثر على العرض)
          if (id.includes('@sentry')) {
            return 'vendor-monitoring';
          }

          // 4. عزل مكتبات الواجهة (Radix UI المستخدمة في Shadcn)
          // هذه المكتبات تحتوي على منطق كثير يسبب بطء التفاعل الأولي
          if (id.includes('@radix-ui')) {
            return 'vendor-ui-headless';
          }

          // 5. عزل Framer Motion (إذا كنت تستخدمها للأنميشن فهي ثقيلة جداً)
          if (id.includes('framer-motion')) {
            return 'vendor-animation';
          }

          // 6. عزل الأيقونات
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
}));
