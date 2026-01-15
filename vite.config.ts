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
  build: {
    target: 'esnext',
    sourcemap: true,
    // Improve initial load by splitting chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React ecosystem
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI framework 
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          // Form handling
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Data fetching
          'query-vendor': ['@tanstack/react-query', '@supabase/supabase-js'],
          // Rich text editor (heavy, rarely needed on initial load)
          'editor-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/pm'],
          // Charts (only needed for admin)
          'charts-vendor': ['recharts'],
          // Date handling
          'date-vendor': ['date-fns'],
        },
      },
    },
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
}));
