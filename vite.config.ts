import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Chỉ load biến môi trường có prefix VITE_
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    base: "/", // 🔴 BẮT BUỘC CHO VERCEL

    plugins: [react()],

    server: {
      port: 3000,
      host: true,
    },

    define: {
      // Nếu BẮT BUỘC phải inject compile-time
      __GEMINI_API_KEY__: JSON.stringify(env.VITE_GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // ✅ FIX
      },
    },
  };
});
