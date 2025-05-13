// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000       // Optional: specify the port (default is 3000)
  },
  modules: ['@nuxt/ui', '@nuxt/icon', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  ui: { prefix: 'Nuxt', fonts: false },
  nitro: {
    experimental: {
      websocket: true
    }
  }
})
