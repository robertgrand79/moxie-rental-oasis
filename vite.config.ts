import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — always needed, load first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Supabase client — needed early for auth
          'vendor-supabase': ['@supabase/supabase-js'],

          // Heavy UI libraries — only loaded when needed
          'vendor-mapbox': ['mapbox-gl'],
          'vendor-charts': ['recharts'],
          'vendor-editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-link',
            '@tiptap/extension-image',
            '@tiptap/extension-placeholder',
          ],
          'vendor-carousel': ['embla-carousel-react', 'embla-carousel'],

          // Date / utility libs
          'vendor-utils': ['date-fns', 'clsx', 'class-variance-authority'],
        },
      },
    },
  },
}));
