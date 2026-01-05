import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/",
  server: {
    port: 8080,
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://ksdodojvchiybbqxfhcl.supabase.co'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZG9kb2p2Y2hpeWJicXhmaGNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjczNzQsImV4cCI6MjA4MTgwMzM3NH0.aHyfrzZoNizRyi43PfqRRC4JsNGLTbTunEHXgkvRpM4'),
  },
  plugins: [react()],
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
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@supabase')) {
              return 'supabase-vendor';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('clsx') || id.includes('tailwind')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
