<script setup>
definePageMeta({
  layout: false, // Menghilangkan layout default agar tidak bentrok dengan Navbar baru
});

useHead({
  title: "FTracker - Kelola Arus Kas & Akuntabilitas Keuangan",
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Inter:wght@400;500;600;700&display=swap",
    },
  ],
});

const user = useSupabaseUser();

const laptopMockupVisible = ref(false);
const mobileMockupVisible = ref(false);
const laptopMockupRef = ref(null);
const mobileMockupRef = ref(null);

const features = [
  {
    icon: "i-heroicons-chart-bar-square",
    title: "Analisis Arus Kas",
    desc: "Pantau kesehatan finansial lewat grafik distribusi kategori dan indikator tren saldo yang intuitif secara otomatis.",
  },
  {
    icon: "i-heroicons-user-group",
    title: "Akuntabilitas Komunitas",
    desc: "Bagikan ringkasan saldo kas ke seluruh anggota organisasi secara akuntabel tanpa membuka data pribadi.",
  },
  {
    icon: "i-heroicons-shield-check",
    title: "Akses Aman & Andal",
    desc: "Autentikasi terenkripsi dengan Supabase RLS memastikan data finansial Anda tersimpan dengan proteksi penuh.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "12.400+", label: "Pengguna Aktif" },
  { value: "Rp 0", label: "Biaya Mulai" },
  { value: "Real-time", label: "Update Data" },
];

const testimonials = [
  {
    name: "Andi Rachman",
    role: "Bendahara RT 04",
    text: "FTracker bikin laporan kas RT jadi transparan dan mudah diakses semua warga. Tidak ada lagi pertanyaan soal kemana uang kas pergi.",
    avatar: "AR",
  },
  {
    name: "Siti Rahayu",
    role: "Ketua UMKM Bersama",
    text: "Arus kas usaha kami sekarang terpantau setiap hari. Grafik-nya mudah dipahami bahkan oleh anggota yang tidak melek teknologi.",
    avatar: "SR",
  },
  {
    name: "Budi Santoso",
    role: "Manajer Koperasi",
    text: "Fitur akuntabilitas komunitas adalah game changer. Anggota bisa lihat ringkasan tanpa khawatir data sensitif bocor.",
    avatar: "BS",
  },
];

onMounted(() => {
  setTimeout(() => {
    laptopMockupVisible.value = true;
    mobileMockupVisible.value = true;
  }, 300);
});
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">
    
    <!-- NAVBAR: Fixed, Full Width, No Layout Collision -->
    <header class="fixed top-0 inset-x-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div class="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 py-3.5">
        <!-- NuxtLink for proper navigation -->
        <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0 select-none" style="font-family: 'DM Sans', sans-serif">
          <img src="/favicon.ico" alt="FTracker logo" class="w-7 h-7 rounded-md" />
          <span>F<span class="text-primary">Tracker</span></span>
        </NuxtLink>
        
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
          <a href="#fitur" class="hover:text-primary transition-colors">Fitur</a>
          <a href="#statistik" class="hover:text-primary transition-colors">Tentang</a>
          <a href="#testimoni" class="hover:text-primary transition-colors">Testimoni</a>
        </nav>

        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <UButton
            v-if="!user"
            to="/login"
            variant="ghost"
            color="neutral"
            class="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 cursor-pointer"
          >
            Masuk
          </UButton>
          <UButton
            to="/dashboard"
            color="primary"
            class="text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            {{ user ? 'Buka Dashboard' : 'Mulai Gratis' }}
          </UButton>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="relative pt-28 sm:pt-36 pb-20 px-4 sm:px-6 text-center overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[350px] pointer-events-none bg-primary/10 blur-[100px] rounded-full" />

      <div class="relative max-w-4xl mx-auto">
        <UBadge
          color="primary"
          variant="subtle"
          class="mb-6 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide animate-fade-in-up"
        >
          Solusi Pintar Keuangan Pribadi & Komunitas
        </UBadge>

        <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight sm:leading-tight md:leading-tight mb-6 tracking-tight" style="font-family: 'DM Sans', sans-serif">
          Kelola Arus Kas & <br class="hidden md:block" />
          <span class="text-primary">Akuntabilitas Keuangan.</span>
        </h1>

        <p class="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-600 dark:text-gray-400 leading-relaxed animate-fade-in-up animate-delay-100">
          FTracker membantu Anda mencatat pemasukan, mengendalikan pengeluaran harian,
          serta menyajikan portal akuntabilitas kas real-time yang aman dan profesional.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16 sm:mb-20 animate-fade-in-up animate-delay-200">
          <UButton
            to="/dashboard"
            size="xl"
            color="primary"
            class="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform cursor-pointer justify-center"
            icon="i-heroicons-sparkles"
          >
            Coba Dashboard
          </UButton>
          <UButton
            to="/login"
            size="xl"
            variant="outline"
            color="neutral"
            class="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-semibold cursor-pointer justify-center"
          >
            Masuk Sekarang
          </UButton>
        </div>

        <!-- BROWSER MOCKUP -->
        <div
          ref="laptopMockupRef"
          :class="[
            'mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 transition-all duration-700',
            laptopMockupVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          ]"
        >
          <div class="bg-gray-100 dark:bg-gray-900 p-3 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-400 shrink-0" />
            <div class="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
            <div class="w-3 h-3 rounded-full bg-green-400 shrink-0" />
            <div class="flex-1 mx-4">
              <div class="text-[11px] px-3 py-1 rounded-md max-w-xs mx-auto text-center bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700 select-none">
                ftracker.app/dashboard
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-950">
            <img src="/laptop-baru.png" alt="Dashboard Preview" class="w-full h-auto block" />
          </div>
        </div>
      </div>
    </section>

    <!-- STATS SECTION -->
    <section id="statistik" class="py-16 px-6 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800/60">
      <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        <div v-for="s in stats" :key="s.label" class="text-center">
          <p class="text-3xl font-bold text-primary mb-1" style="font-family: 'JetBrains Mono', monospace">
            {{ s.value }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section id="fitur" class="py-24 px-6">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <span class="text-xs font-semibold tracking-widest text-primary uppercase">Fitur Unggulan</span>
          <h2 class="text-3xl sm:text-4xl font-bold mt-2 tracking-tight" style="font-family: 'DM Sans', sans-serif">
            Semua yang kamu butuhkan
          </h2>
          <p class="mt-3 text-base max-w-xl mx-auto text-gray-600 dark:text-gray-400">
            Dirancang khusus untuk individu, komunitas, dan organisasi yang ingin kelola keuangan secara transparan.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="f in features"
            :key="f.title"
            class="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:border-primary/50 transition-all duration-300 group"
          >
            <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <UIcon :name="f.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-lg font-bold mb-3">{{ f.title }}</h3>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {{ f.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section id="testimoni" class="py-24 px-6 bg-gray-50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800/60">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <span class="text-xs font-semibold tracking-widest text-primary uppercase">Testimoni</span>
          <h2 class="text-3xl sm:text-4xl font-bold mt-2 tracking-tight" style="font-family: 'DM Sans', sans-serif">
            Dipercaya komunitas nyata
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="t in testimonials"
            :key="t.name"
            class="p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm"
          >
            <p class="text-sm leading-relaxed mb-6 text-gray-600 dark:text-gray-400 italic">
              "{{ t.text }}"
            </p>
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {{ t.avatar }}
              </div>
              <div>
                <p class="text-sm font-semibold">{{ t.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA SECTION -->
    <section class="py-24 px-6">
      <div class="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden bg-primary text-white shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none bg-white blur-[80px]" />
        
        <h2 class="text-3xl sm:text-4xl font-bold mb-4 relative" style="font-family: 'DM Sans', sans-serif">
          Siap mulai gratis?
        </h2>
        <p class="mb-10 text-base sm:text-lg relative opacity-90 max-w-xl mx-auto">
          Bergabung dengan ribuan pengguna yang sudah percayakan keuangan mereka ke FTracker.
        </p>
        <UButton
          to="/login"
          size="xl"
          class="px-10 py-4 rounded-full font-bold bg-white text-primary hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
        >
          Daftar Sekarang — Gratis
        </UButton>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
      © 2026 FTracker. Solusi Pintar Keuangan Pribadi & Komunitas.
    </footer>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
.animate-delay-100 { animation-delay: 0.1s; }
.animate-delay-200 { animation-delay: 0.2s; }
.animate-delay-300 { animation-delay: 0.3s; }
.animate-delay-400 { animation-delay: 0.4s; }
.animate-delay-500 { animation-delay: 0.5s; }
.animate-delay-600 { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>