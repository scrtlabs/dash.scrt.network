import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
