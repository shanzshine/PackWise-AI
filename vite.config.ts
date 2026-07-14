import { defineConfig } from "@core/vite-config";

export default defineConfig({
  nitro: {
    preset: "vercel"
  },
  tanstackStart: {
    // @ts-ignore
    server: { entry: "server" },
  },
  // @ts-ignore
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
