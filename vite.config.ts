import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  server: {
    port: 5173,
    open: false,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          "lucide-react": ["lucide-react"],
        },
      },
    },
  },
  // css: {
  //   postcss: "./postcss.config.js",
  // },
  // define: {
  //   global: "globalThis",
  // },
  esbuild: {
    loader: "tsx",

    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    include: ["lucide-react"],
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".ts": "tsx",
      },
    },
  },
});
