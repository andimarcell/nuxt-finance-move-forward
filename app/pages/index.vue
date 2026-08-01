<script setup>
// mengambil state user aktif
const user = useSupabaseUser();
// Halaman ini tidak butuh logic apa-apa, murni UI
definePageMeta({
  layout: "default",
});

useSeoMeta({
  ogImage: "/preview-dashboard.png",
});

// SOLUSI AMAN: Hitung tujuan URL & teks tombol secara dinamis lewat computed di <script>
const ctaDestination = computed(() => {
  return user.value ? "/dashboard" : "/login";
});

const ctaLabel = computed(() => {
  return user.value ? "Masuk ke Dasbor" : "Mulai Sekarang";
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[75vh] text-center px-4"
  >
    <!-- Badge Versi -->
    <UBadge
      color="primary"
      variant="subtle"
      class="mb-6 rounded-full px-3 py-1"
    >
      v1.0 - Edisi Skripsi
    </UBadge>

    <!-- Headline Utama -->
    <h1
      class="text-4xlsm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 sm-leading-none text-gray-900  dark:text-white"
    >
      Lacak Keuanganmu <br class="hidden md:block" />
      <span class="text-primary">Lebih Cerdas.</span>
    </h1>

    <!-- Sub-Headline -->
    <p
      class="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10"
    >
      FTracker membantu Anda mencatat pemasukan, mengawasi pengeluaran, dan
      mengontrol sisa saldo secara otomatis agar Anda bisa menabung dengan lebih
      baik.
    </p>

    <!-- Call to Action (CTA) Button -->
    <div class="flex flex-col sm:flex-row items-center gap-4">
      <UButton
        :to="ctaDestination"
        size="xl"
        color="primary"
        class="px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/30"
        :trailing-icon="
          user ? 'i-heroicons-arrow-right-20-solid' : 'i-heroicons-sparkles'
        "
      >
        {{ ctaLabel }}
      </UButton>
    </div>

    <!-- Mockup Dasbor LAPTOP (Ilustrasi Kotak) -->
    <div
      class="hidden md:block mt-16 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition hover:scale-[1.02] duration-300"
    >
      <!-- Mac OS Window Header Style -->
      <div
        class="bg-gray-100 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800 flex space-x-2"
      >
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
      </div>
      <!-- Body Mockup -->
      <div
        class="bg-white dark:bg-gray-950 aspect-video flex flex-col items-center justify-center relative"
      >
        <img
          src="/preview-laptop.png"
          alt="Preview Dashboard FTracker"
          class="w-full h-full object-cover object-top opacity-90 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    </div>

    <!-- MOCKUP DASHBOARD HP -->
    <div
      class="block md:hidden mt-12 w-70 rounded-[40px] border-8 border-gray-800 dark:border-gray-950 shadow-2xl overflow-hidden relative aspect-9/19 bg-white dark:bg-gray-900 transform transition hover:scale-[1.03] duration-300"
    >
      <!-- Speaker & Camera Notch -->
      <div
        class="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-gray-800 dark:bg-gray-950 rounded-full z-20 flex items-center justify-center"
      >
        <div class="w-12 h-1 bg-gray-700 rounded-full mr-2"></div>
        <div class="w-2 h-2 bg-gray-700 rounded-full"></div>
      </div>

      <!-- BODY HP: Ditambahkan overflow-y-auto & no-scrollbar agar layar HP bisa di-scroll mulus -->
      <div
        class="w-full h-full pt-4 bg-gray-50 dark:bg-gray-950 overflow-y-auto no-scrollbar scroll-smooth"
      >
        <!-- BAGIAN 1: Ringkasan & Chart (Atas) -->
        <img
          src="/wowo.jpeg"
          alt="Preview Dashboard FTracker Mobile Top"
          class="w-full object-cover object-top"
        />

        <!-- BAGIAN 2: Daftar Transaksi (Bawah) -->
        <img
          src="/gamteng.jpeg"
          alt="Preview Dashboard FTracker Mobile Bottom"
          class="w-full object-cover object-top -mt-1"
        />
      </div>
    </div>
  </div>
</template>
<!-- STYLE KHUSUS UNTUK MENYEMBUNYIKAN SCROLLBAR BAWAAN BROWSER DI HP -->
<style scoped>
/* Chrome, Safari, Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* IE, Edge, Firefox */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
