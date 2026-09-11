import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** The hosted demo — a plain app build, nothing to do with the package. */
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "demo-dist" },
});
