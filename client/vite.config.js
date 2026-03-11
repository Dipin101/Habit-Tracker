import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  build: { outDir: "dist", chunkSizeWarningLimit: 1000 },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth", "react-icons/ai"],
  },
});
