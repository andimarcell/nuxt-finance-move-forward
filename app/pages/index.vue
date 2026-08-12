<script setup>
const user = useSupabaseUser();

definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "FTracker - Platform Manajemen Keuangan Pribadi & Komunitas",
  ogImage: "/preview-dashboard.png",
});

const ctaDestination = computed(() => {
  return user.value ? "/dashboard" : "/login";
});

const ctaLabel = computed(() => {
  return user.value ? "Buka Dasbor Saya" : "Mulai Sekarang - Gratis";
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 pt-6 sm:pt-10"
  >
    <!-- Badge Status Produk Komersial -->
    <UBadge
      color="primary"
      variant="subtle"
      class="mb-6 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide shadow-sm"
    >
      Solusi Pintar Keuangan Pribadi & Komunitas
    </UBadge>

    <!-- Headline Utama -->
    <h1
      class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-gray-900 dark:text-white"
    >
      Kelola Arus Kas & <br class="hidden md:block" />
      <span class="text-primary">Akuntabilitas Keuangan.</span>
    </h1>

    <!-- Sub-Headline Komersial -->
    <p
      class="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed font-normal"
    >
      FTracker membantu Anda mencatat pemasukan, mengendalikan pengeluaran
      harian, serta menyajikan portal akuntabilitas kas real-time yang aman dan
      profesional.
    </p>

    <!-- Call to Action (CTA) Button -->
    <div class="flex flex-col sm:flex-row items-center gap-4 mb-16">
      <UButton
        :to="ctaDestination"
        size="xl"
        color="primary"
        class="px-8 py-3.5 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-200 cursor-pointer"
        :trailing-icon="
          user ? 'i-heroicons-arrow-right-20-solid' : 'i-heroicons-sparkles'
        "
      >
        {{ ctaLabel }}
      </UButton>
    </div>

    <!-- 🌟 SEKSI 3 KARTU FITUR UNGGULAN (VALUE PROPOSITION) -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl w-full mb-16"
    >
      <div
        class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition duration-300"
      >
        <div
          class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary"
        >
          <UIcon name="i-heroicons-chart-bar-square" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Analisis Arus Kas
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Pantau kesehatan finansial lewat grafik distribusi kategori dan
          indikator tren saldo yang intuitif secara otomatis.
        </p>
      </div>

      <div
        class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition duration-300"
      >
        <div
          class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary"
        >
          <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Akuntabilitas Komunitas
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Bagikan ringkasan saldo kas ke seluruh anggota organisasi atau
          komunitas secara akuntabel tanpa membuka data pribadi.
        </p>
      </div>

      <div
        class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition duration-300"
      >
        <div
          class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary"
        >
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Akses Aman & Andal
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Dilengkapi autentikasi terenkripsi Supabase RLS untuk memastikan data
          finansial Anda tersimpan dengan proteksi penuh.
        </p>
      </div>
    </div>

    <!-- MOCKUP DASHBOARD LAPTOP -->
    <div
      class="hidden md:block w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition hover:scale-[1.01] duration-300"
    >
      <div
        class="bg-gray-100 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800 flex space-x-2"
      >
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <div class="bg-white dark:bg-gray-950 relative w-full h-auto">
        <img
          src="/laptop-baru.png"
          alt="Preview Dashboard FTracker"
          class="w-full h-auto opacity-95 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>

    <!-- MOCKUP DASHBOARD HP -->
    <div
      class="block md:hidden mt-6 w-72 rounded-[40px] border-8 border-gray-800 dark:border-gray-950 shadow-2xl overflow-hidden relative aspect-9/19 bg-white dark:bg-gray-900 transform transition hover:scale-[1.02] duration-300"
    >
      <div
        class="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-gray-800 dark:bg-gray-950 rounded-full z-20 flex items-center justify-center"
      >
        <div class="w-12 h-1 bg-gray-700 rounded-full mr-2"></div>
        <div class="w-2 h-2 bg-gray-700 rounded-full"></div>
      </div>

      <div
        class="w-full h-full pt-4 bg-gray-50 dark:bg-gray-950 overflow-y-auto no-scrollbar scroll-smooth"
      >
        <img
          src="/mobile-baru.jpeg"
          alt="Preview Dashboard FTracker Mobile Top"
          class="w-full object-cover object-top"
        />
        <img
          src="/mobile-chart-baru.jpeg"
          alt="Preview Dashboard FTracker Mobile Bottom"
          class="w-full object-cover object-top -mt-1"
        />
        <img
          src="/mobile-filter-baru.jpeg"
          alt="Preview Dashboard FTracker Mobile Top"
          class="w-full object-cover object-top"
        />
        <img
          src="/mobile-list-baru.jpeg"
          alt="Preview Dashboard FTracker Mobile Bottom"
          class="w-full object-cover object-top -mt-1"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
