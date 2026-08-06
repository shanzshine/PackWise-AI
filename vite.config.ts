import { defineConfig } from "@core/vite-config";

export default defineConfig({
  // Disable Nitro SSR completely — this app is a pure client-side SPA.
  // All data is fetched via Supabase/FastAPI from the browser; localStorage
  // and sessionStorage are used for state. SSR causes a crash because those
  // browser APIs are unavailable on the server.
  nitro: false,
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
