import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/",
  server: {
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // تفعيل التصغير الأقصى للملفات
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // حذف أوامر console.log لتسريع الموقع
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // خوارزمية تقسيم الملفات الذكية
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // فصل مكتبات React الأساسية
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            // فصل Supabase لأنه ثقيل
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            // فصل مكتبات التصميم والأيقونات
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('clsx') || id.includes('tailwind')) {
              return 'ui-vendor';
            }
            // باقي المكتبات الخارجية
            return 'vendor';
          }
        },
      },
    },
  },
});
