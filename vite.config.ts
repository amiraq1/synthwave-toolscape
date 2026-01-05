import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
    // تفعيل التصغير الأقصى للملفات
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // حذف أوامر console.log لتسريع الموقع
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true, // دعم Safari 10
      },
    },
    // تحسين CSS
    cssCodeSplit: true,
    cssMinify: true,
    // تحذير عند تجاوز حجم 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // خوارزمية تقسيم الملفات الذكية المحسنة
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // فصل React و React-DOM (الأساسيات)
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
              return 'react-core';
            }
            // فصل React Router
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // فصل TanStack Query (ثقيل)
            if (id.includes('@tanstack')) {
              return 'tanstack';
            }
            // فصل Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // فصل Radix UI components (ثقيلة)
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // فصل Recharts (إذا وجد)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            // فصل مكتبات التصميم والأيقونات
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            // Markdown و syntax highlighting
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype')) {
              return 'markdown';
            }
            // باقي المكتبات الصغيرة
            if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance')) {
              return 'utils';
            }
            // باقي المكتبات الخارجية
            return 'vendor';
          }
        },
        // تحسين أسماء الملفات للـ caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // تمكين source maps للـ production debugging (اختياري)
    sourcemap: false,
    // تحسين target للمتصفحات الحديثة
    target: 'es2020',
  },
  // تحسينات للتطوير
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query'],
  },
  };
});
