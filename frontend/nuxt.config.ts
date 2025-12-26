import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  modules: ["@nuxt/ui", "nuxt-icon"],

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8080'
    }
  },

  devServer: {
    port: 8081,
    host: "0.0.0.0",
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
