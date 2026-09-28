<script setup>
// Domain publik aplikasi, diambil dari NUXT_PUBLIC_SITE_URL (lihat nuxt.config.ts)
const {
  public: { siteUrl },
} = useRuntimeConfig();

// Gambar pratinjau saat tautan dibagikan: harus file yang benar-benar ada di public/
const ogImage = `${siteUrl}/laptop-baru.png`;

// Konfigurasi Head & Favicon
useHead({
  title: 'FTracker - Lacak Keuanganmu Lebih Cerdas',
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/favicon.ico'
    }
  ]
})

// Konfigurasi SEO & Open Graph
useSeoMeta({
  title: 'FTracker - Lacak Keuanganmu Lebih Cerdas',
  description: 'FTracker membantu Anda mencatat pemasukan, mengawasi pengeluaran, dan mengontrol sisa saldo secara otomatis agar Anda bisa menabung dengan lebih baik.',
  
  ogTitle: 'FTracker - Lacak Keuanganmu Lebih Cerdas',
  ogDescription: 'Kelola dan awasi pengeluaran harian Anda secara otomatis menggunakan sistem analisis keuangan cerdas dan responsif.',
  ogImage,
  ogImageAlt: 'Pratinjau dashboard FTracker',
  ogType: 'website',
  ogUrl: siteUrl,

  // Twitter Card
  twitterCard: 'summary_large_image',
  twitterTitle: 'FTracker - Lacak Keuanganmu Lebih Cerdas',
  twitterDescription: 'Kelola dan awasi pengeluaran harian Anda secara otomatis.',
  twitterImage: ogImage,
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>