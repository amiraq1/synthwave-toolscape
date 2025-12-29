export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS minification in production (cssnano is bundled with Vite)
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
  },
};
