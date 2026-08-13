import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const MONACO_CHUNK = "monaco";
const MONACO_PACKAGE = "monaco-editor";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    include: ["monaco-editor/esm/vs/editor/editor.api", "@monaco-editor/react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes(MONACO_PACKAGE)) {
            return MONACO_CHUNK;
          }
        },
      },
    },
  },
});
