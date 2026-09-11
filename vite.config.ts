import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * The library build. `vite dev` ignores all of this and serves index.html,
 * which is the demo — so one config covers both working on the thing and
 * shipping it.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: () => "type.js",
      cssFileName: "type",
    },
    // React is the host's, not ours: two copies of it in one page is a broken
    // app, and every hook in here would throw.
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
