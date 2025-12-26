// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-09-20',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  typescript: {
    strict: true
  },
  tailwindcss: {
    // Le module va créer automatiquement la config
    exposeConfig: true
  }
})