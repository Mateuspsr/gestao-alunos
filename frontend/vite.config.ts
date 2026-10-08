import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/app/",
  server: {
    proxy: {
      "/auth": "http://127.0.0.1:8000",
      "/alunos": "http://127.0.0.1:8000",
      "/disciplinas": "http://127.0.0.1:8000",
      "/health": "http://127.0.0.1:8000",
    },
  },
});
