import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const MONACO_CHUNK = "monaco";
const MONACO_PACKAGE = "monaco-editor";

const VENDOR_CHUNK = "vendor";
const VENDOR_PACKAGES = [
  "react",
  "react-dom",
  "react-router",
  "react-router-dom",
  "scheduler",
];
const VITE_PRELOAD_HELPER = "vite/preload-helper";

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
  server: {
    warmup: {
      clientFiles: [
        "./src/App.tsx",
        "./src/components/workspace/WorkspacePage.tsx",
        "./src/store/store.ts",
      ],
    },
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

          if (
            id.includes(VITE_PRELOAD_HELPER) ||
            VENDOR_PACKAGES.some((pkg) => id.includes(`node_modules/${pkg}/`))
          ) {
            return VENDOR_CHUNK;
          }
        },
      },
    },
  },
});
