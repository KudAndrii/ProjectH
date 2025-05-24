// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  nitro: { experimental: { websocket: true } },
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000       // Optional: specify the port (default is 3000)
  },
  runtimeConfig: { // first values taken from the env vars, then from the config file
    // private config goes here with NUXT_* env vars prefix
    sessionsLimit: 1,
    public: {
      // public config goes here with NUXT_PUBLIC_* env vars prefix
    }
  },
  modules: ['@nuxt/ui', '@nuxt/icon', '@vueuse/nuxt'],
  css: ['~/assets/css/main.css'],
  ui: { prefix: 'Nuxt', fonts: false }
})
