<script setup>
const user = useSupabaseUser();
const { target: laptopMockupRef, isVisible: laptopMockupVisible } = useScrollReveal()
const { target: mobileMockupRef, isVisible: mobileMockupVisible } = useScrollReveal()

definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "FTracker - Catat Kas, Bagikan Laporan ke Anggota",
  description:
    "FTracker untuk bendahara dan keuangan pribadi: catat pemasukan dan pengeluaran, lihat ringkasan per periode, unduh rekap Excel/PDF per anggota.",
});

const ctaDestination = computed(() => {
  return user.value ? "/dashboard" : "/login";
});

const ctaLabel = computed(() => {
  return user.value ? "Buka Dasbor Saya" : "Mulai Mencatat - Gratis";
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
      class="mb-6 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide shadow-sm animate-fade-in-up"
    >
      Kas komunitas & keuangan pribadi
    </UBadge>

    <!-- Headline Utama -->
    <h1
      class="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 text-gray-900 dark:text-white animate-fade-in-up animate-delay-100"
    >
      Catat kas, <br class="hidden md:block" />
      <span class="text-primary">bagikan laporan ke anggota.</span>
    </h1>

    <!-- Sub-Headline Komersial -->
    <p
      class="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-10 leading-relaxed font-normal animate-fade-in-up animate-delay-200"
    >
      Untuk bendahara organisasi maupun keuangan pribadi: catat pemasukan dan
      pengeluaran, lihat ringkasan per periode, unduh rekap Excel/PDF per anggota.
    </p>

    <!-- Call to Action (CTA) Button -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 animate-fade-in-up animate-delay-300">
      <UButton
        :to="ctaDestination"
        size="xl"
        color="primary"
        class="px-8 py-3.5 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
        :trailing-icon="
          user ? 'i-heroicons-arrow-right-20-solid' : 'i-heroicons-sparkles'
        "
      >
        {{ ctaLabel }}
      </UButton>
      <UButton
        v-if="!user"
        to="/login"
        size="xl"
        color="neutral"
        variant="outline"
        class="px-8 py-3.5 rounded-full font-bold cursor-pointer"
        icon="i-heroicons-key"
      >
        Coba Magic Link
      </UButton>
    </div>

    <!-- Trust signals -->
    <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 text-xs sm:text-sm text-gray-500 dark:text-gray-400 animate-fade-in-up animate-delay-300">
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-heroicons-check-circle" class="w-4 h-4 text-green-500" />
        Gratis
      </span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-green-500" />
        Data tersimpan di akun Supabase Anda
      </span>
      <span class="inline-flex items-center gap-1.5">
        <UIcon name="i-heroicons-device-phone-mobile" class="w-4 h-4 text-green-500" />
        Bisa dipakai di HP Android
      </span>
    </div>

    <!-- Fitur utama berbasis fungsi nyata aplikasi -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl w-full mb-16"
    >
      <div
        class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition duration-300 animate-fade-in-up animate-delay-400"
      >
        <div
          class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary"
        >
          <UIcon name="i-heroicons-chart-bar-square" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Ringkasan per periode
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Lihat pemasukan, pengeluaran, dan sisa saldo per hari, bulan, atau tahun,
          lengkap dengan distribusi kategori.
        </p>
      </div>

      <div
        class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition duration-300 animate-fade-in-up animate-delay-500"
      >
        <div
          class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary"
        >
          <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Rekap kas per anggota
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Susun rekap matriks pembayaran kas per nama anggota dan unduh sebagai
          Excel atau PDF untuk dibagikan.
        </p>
      </div>

      <div
        class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition duration-300 animate-fade-in-up animate-delay-600"
      >
        <div
          class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary"
        >
          <UIcon name="i-heroicons-shield-check" class="w-6 h-6" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Login aman
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Masuk dengan password atau Magic Link. Data transaksi hanya bisa diakses
          dari akun Anda sendiri.
        </p>
      </div>
    </div>

    <!-- MOCKUP DASHBOARD LAPTOP -->
    <div
      ref="laptopMockupRef"
      :class="[
        'hidden md:block w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden',
        laptopMockupVisible ? 'animate-scale-in' : 'opacity-0'
      ]"
    >
      <div
        class="bg-gray-100 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between"
      >
        <div class="flex space-x-2" aria-hidden="true">
          <div class="w-3 h-3 rounded-full bg-red-400"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div class="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <span class="text-[11px] font-medium text-gray-400 dark:text-gray-500">Pratinjau dashboard FTracker</span>
      </div>
      <div class="bg-white dark:bg-gray-950 relative w-full h-auto">
        <img
          src="/laptop-baru.png"
          alt="Pratinjau dashboard FTracker di laptop"
          loading="lazy"
          class="w-full h-auto"
        />
      </div>
    </div>

    <!-- MOCKUP DASHBOARD HP -->
    <div
      ref="mobileMockupRef"
      :class="[
        'block md:hidden mt-6 w-72 rounded-[40px] border-8 border-gray-800 dark:border-gray-950 shadow-2xl overflow-hidden relative aspect-9/19 bg-white dark:bg-gray-900',
        mobileMockupVisible ? 'animate-scale-in' : 'opacity-0'
      ]"
    >
      <div
        class="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-gray-800 dark:bg-gray-950 rounded-full z-20 flex items-center justify-center"
        aria-hidden="true"
      >
        <div class="w-12 h-1 bg-gray-700 rounded-full mr-2"></div>
        <div class="w-2 h-2 bg-gray-700 rounded-full"></div>
      </div>

      <div
        class="w-full h-full pt-4 bg-gray-50 dark:bg-gray-950 overflow-y-auto no-scrollbar scroll-smooth"
      >
        <img
          src="/mobile-baru.jpeg"
          alt="Pratinjau ringkasan FTracker di HP"
          loading="lazy"
          class="w-full object-cover object-top"
        />
        <img
          src="/mobile-chart-baru.jpeg"
          alt="Pratinjau grafik kategori FTracker di HP"
          loading="lazy"
          class="w-full object-cover object-top -mt-1"
        />
        <img
          src="/mobile-filter-baru.jpeg"
          alt="Pratinjau filter transaksi FTracker di HP"
          loading="lazy"
          class="w-full object-cover object-top"
        />
        <img
          src="/mobile-list-baru.jpeg"
          alt="Pratinjau daftar transaksi FTracker di HP"
          loading="lazy"
          class="w-full object-cover object-top -mt-1"
        />
      </div>
    </div>

    <!-- Alur singkat satu baris -->
    <p class="w-full max-w-5xl mt-16 mb-4 text-center text-sm text-gray-500 dark:text-gray-400">
      Buat akun &rarr; catat pemasukan dan pengeluaran &rarr; pantau ringkasan dan unduh rekap.
    </p>
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
