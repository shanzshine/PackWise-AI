import { defineConfig } from "@core/vite-config";

export default defineConfig({
  nitro: {
    preset: "vercel"
  },
  // tanstackStart: {
  //   server: { entry: "./src/server.ts" },
  // },
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
