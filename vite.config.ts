import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively by browser
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Data layer — rarely changes
          "vendor-query": ["@tanstack/react-query", "@supabase/supabase-js"],
          // UI library — large, changes infrequently
          "vendor-radix": [
            "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar", "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover", "@radix-ui/react-select",
            "@radix-ui/react-tabs", "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          // Charts — only loaded on reports page
          "vendor-charts": ["recharts"],
          // Drag and drop — only loaded in app
          "vendor-dnd": ["@hello-pangea/dnd"],
          // Date utils
          "vendor-dates": ["date-fns"],
        },
      },
    },
    // Raise chunk size warning threshold slightly — 500KB is reasonable for a SaaS app
    chunkSizeWarningLimit: 500,
  },
}));
