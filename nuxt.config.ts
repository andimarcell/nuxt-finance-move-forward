// Detect jika sedang melakukan build untuk HP Android
const isMobileBuild = process.env.CAPACITOR_BUILD === 'true'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Tetap aktifkan SSR untuk Vercel Web, tapi matikan SSR hanya saat build APK Mobile
  ssr: !isMobileBuild,

  modules: ["@nuxt/ui", "@nuxtjs/supabase"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/main.css"],
  
  // Konfigurasi Supabase asli kamu
  supabase: {
    redirect: false,
  },

  // 🟢 TAMBAHAN BARU: Runtime Config untuk Deteksi Member Mode & Config Mobile
  runtimeConfig: {
    public: {
      // Akan bernilai true jika di .env ditulis NUXT_PUBLIC_MEMBER_MODE="true"
      memberMode: process.env.NUXT_PUBLIC_MEMBER_MODE === 'true',
      
      // Keperluan Universal App (Pillar 1)
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Financial App',
      appScheme: process.env.NUXT_PUBLIC_APP_SCHEME || 'myfinance'
    }
  },

  // Preset Nitro dinamis (Vercel untuk Web, Static untuk Mobile)
  nitro: {
    preset: isMobileBuild ? 'static' : 'vercel'
  },

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },
});