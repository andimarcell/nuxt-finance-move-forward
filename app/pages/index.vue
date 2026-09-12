<script setup>
definePageMeta({
  layout: false, // Menghilangkan layout default agar tidak bentrok dengan Navbar baru
});

useHead({
  title: "FTracker - Kelola Arus Kas & Akuntabilitas Keuangan",
  htmlAttrs: {
    class: "scroll-smooth",
  },
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
const isScrolled = ref(false);

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
  { value: "99.9%", label: "Uptime SLA", sub: "Keandalan tinggi" },
  { value: "12.400+", label: "Pengguna Aktif", sub: "Pribadi & organisasi" },
  { value: "Rp 0", label: "Biaya Mulai", sub: "Tanpa kartu kredit" },
  { value: "Real-time", label: "Update Data", sub: "Sinkronisasi instan" },
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

let observer = null;

onMounted(() => {
  if (!import.meta.client) return;

  // 1. Scroll listener untuk efek navbar transparan -> solid
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 20;
  };
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  // 2. Intersection Observer untuk animasi "Reveal" saat scroll
  const revealElements = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target); // Animasi hanya sekali
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-revealed"));
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden selection:bg-primary/20 selection:text-primary">
    
    <!-- NAVBAR: Responsif & Dynamic -->
    <header
      class="fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-md border-b"
      :class="[
        isScrolled
          ? 'bg-white/95 dark:bg-gray-950/95 border-gray-200/80 dark:border-gray-800/80 shadow-sm py-3'
          : 'bg-white/80 dark:bg-gray-950/80 border-transparent py-4'
      ]"
    >
      <div class="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10">
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0 select-none group"
          style="font-family: 'DM Sans', sans-serif"
        >
          <div class="relative w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105">
            <img src="/favicon.ico" alt="FTracker logo" class="w-full h-full object-contain" />
          </div>
          <span class="transition-colors group-hover:text-primary">F<span class="text-primary">Tracker</span></span>
        </NuxtLink>
        
        <!-- Navigasi Desktop -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <a
            href="#fitur"
            class="hover:text-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            Fitur
          </a>
          <a
            href="#statistik"
            class="hover:text-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            Tentang
          </a>
          <a
            href="#testimoni"
            class="hover:text-primary transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary hover:after:w-full after:transition-all after:duration-300"
          >
            Testimoni
          </a>
        </nav>

        <!-- Tombol Aksi -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          <UButton
            v-if="!user"
            to="/login"
            variant="ghost"
            color="neutral"
            class="text-xs sm:text-sm font-medium px-3 sm:px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Masuk
          </UButton>
          <UButton
            to="/dashboard"
            color="primary"
            class="text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold shadow-sm hover:shadow-md hover:shadow-primary/25 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {{ user ? 'Buka Dashboard' : 'Mulai Gratis' }}
          </UButton>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section class="relative pt-32 sm:pt-40 pb-20 sm:pb-24 px-4 sm:px-6 text-center overflow-hidden">
      <!-- Ambient Glow (Animasi Pulse) -->
      <div class="absolute top-10 left-1/2 -translate-x-1/2 w-150 sm:w-225 h-75 pointer-events-none bg-primary/15 blur-[120px] rounded-full animate-pulse-slow" />
      <div class="absolute top-40 left-1/4 w-75 h-75 pointer-events-none bg-emerald-500/10 blur-[100px] rounded-full" />

      <div class="relative max-w-4xl mx-auto">
        <!-- Badge Status -->
        <div data-reveal class="inline-block">
          <UBadge
            color="primary"
            variant="subtle"
            class="mb-6 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wide shadow-sm ring-1 ring-primary/20 hover:scale-105 transition-transform duration-200 cursor-default"
          >
            <span class="inline-block w-2 h-2 rounded-full bg-primary animate-ping mr-2"></span>
            Solusi Pintar Keuangan Pribadi & Komunitas
          </UBadge>
        </div>

        <!-- Headline Utama -->
        <h1
          data-reveal
          class="text-4xl sm:text-6xl md:text-7xl font-extrabold leading-tight sm:leading-tight md:leading-tight mb-6 tracking-tight text-balance"
          style="font-family: 'DM Sans', sans-serif; transition-delay: 100ms;"
        >
          Kelola Arus Kas & <br class="hidden md:block" />
          <span class="text-transparent bg-clip-text bg-linear-to-r from-primary via-emerald-500 to-teal-400">
            Akuntabilitas Keuangan.
          </span>
        </h1>

        <!-- Sub-headline -->
        <p
          data-reveal
          class="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 text-gray-600 dark:text-gray-300 leading-relaxed font-normal"
          style="transition-delay: 200ms;"
        >
          FTracker membantu Anda mencatat pemasukan, mengendalikan pengeluaran harian,
          serta menyajikan portal akuntabilitas kas real-time yang aman dan profesional.
        </p>

        <!-- CTA Buttons -->
        <div
          data-reveal
          class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-16 sm:mb-20"
          style="transition-delay: 300ms;"
        >
          <UButton
            to="/dashboard"
            size="xl"
            color="primary"
            class="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer justify-center group"
            icon="i-heroicons-sparkles"
          >
            <span>Coba Dashboard</span>
            <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </UButton>
          <UButton
            to="/login"
            size="xl"
            variant="outline"
            color="neutral"
            class="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 cursor-pointer justify-center"
          >
            Masuk Sekarang
          </UButton>
        </div>

        <!-- BROWSER MOCKUP (Elevated Reveal) -->
        <div
          data-reveal="scale"
          class="mx-auto max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 group hover:shadow-primary/10 transition-all duration-700 hover:border-gray-300 dark:hover:border-gray-700"
          style="transition-delay: 400ms;"
        >
          <div class="bg-gray-100 dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-400 shrink-0" />
            <div class="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
            <div class="w-3 h-3 rounded-full bg-green-400 shrink-0" />
            <div class="flex-1 mx-4">
              <div class="text-[11px] px-4 py-1 rounded-md max-w-xs mx-auto text-center bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 select-none font-mono">
                ftracker.app/dashboard
              </div>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-950 overflow-hidden relative">
            <img
              src="/laptop-baru.png"
              alt="Dashboard Preview"
              class="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- STATS SECTION (Staggered Cards) -->
    <section id="statistik" class="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50/80 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800/60">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div
            v-for="(s, index) in stats"
            :key="s.label"
            data-reveal
            :style="{ transitionDelay: `${index * 100}ms` }"
            class="text-center p-4 rounded-xl transition-all duration-300 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md dark:hover:shadow-gray-950/50 hover:-translate-y-1"
          >
            <p
              class="text-3xl sm:text-4xl font-extrabold text-primary mb-1 tracking-tight"
              style="font-family: 'JetBrains Mono', monospace"
            >
              {{ s.value }}
            </p>
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ s.label }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ s.sub }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION (Staggerer Grid) -->
    <section id="fitur" class="py-24 sm:py-28 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto">
        <div data-reveal class="text-center mb-16">
          <span class="text-xs font-semibold tracking-widest text-primary uppercase inline-block px-3 py-1 rounded-full bg-primary/10 mb-3">
            Fitur Unggulan
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
            Semua yang kamu butuhkan
          </h2>
          <p class="mt-3 text-base max-w-xl mx-auto text-gray-600 dark:text-gray-400 leading-relaxed">
            Dirancang khusus untuk individu, komunitas, dan organisasi yang ingin kelola keuangan secara transparan dan terukur.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div
            v-for="(f, index) in features"
            :key="f.title"
            data-reveal
            :style="{ transitionDelay: `${index * 150}ms` }"
            class="p-8 bg-white dark:bg-gray-900/90 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/50 dark:hover:border-primary/50 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div class="w-14 h-14 bg-primary/10 dark:bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <UIcon :name="f.icon" class="w-7 h-7" />
              </div>
              <h3 class="text-lg font-bold mb-3 group-hover:text-primary transition-colors">{{ f.title }}</h3>
              <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {{ f.desc }}
              </p>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>Pelajari selengkapnya</span>
              <UIcon name="i-heroicons-arrow-right" class="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section id="testimoni" class="py-24 sm:py-28 px-4 sm:px-6 bg-gray-50/80 dark:bg-gray-900/40 border-y border-gray-100 dark:border-gray-800/80">
      <div class="max-w-5xl mx-auto">
        <div data-reveal class="text-center mb-16">
          <span class="text-xs font-semibold tracking-widest text-primary uppercase inline-block px-3 py-1 rounded-full bg-primary/10 mb-3">
            Testimoni Nyata
          </span>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
            Dipercaya komunitas & pengurus
          </h2>
          <p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Kisah nyata dari mereka yang sudah mengadopsi akuntabilitas finansial transparan.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div
            v-for="(t, index) in testimonials"
            :key="t.name"
            data-reveal
            :style="{ transitionDelay: `${index * 150}ms` }"
            class="p-8 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center gap-1 text-amber-400 mb-4">
                <UIcon name="i-heroicons-star-solid" class="w-4 h-4" />
                <UIcon name="i-heroicons-star-solid" class="w-4 h-4" />
                <UIcon name="i-heroicons-star-solid" class="w-4 h-4" />
                <UIcon name="i-heroicons-star-solid" class="w-4 h-4" />
                <UIcon name="i-heroicons-star-solid" class="w-4 h-4" />
              </div>
              <p class="text-sm leading-relaxed mb-6 text-gray-700 dark:text-gray-300 italic">
                "{{ t.text }}"
              </p>
            </div>
            <div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div class="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-primary/40 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/20">
                {{ t.avatar }}
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ t.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CTA SECTION -->
    <section class="py-24 sm:py-28 px-4 sm:px-6">
      <div
        data-reveal="scale"
        class="max-w-4xl mx-auto rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden bg-linear-to-br from-primary via-emerald-600 to-teal-700 text-white shadow-2xl hover:shadow-primary/30 transition-all duration-500"
      >
        <div class="absolute -top-10 -right-10 w-72 h-72 rounded-full opacity-25 pointer-events-none bg-white blur-[80px]" />
        <div class="absolute -bottom-10 -left-10 w-72 h-72 rounded-full opacity-20 pointer-events-none bg-black blur-[70px]" />
        
        <div class="relative z-10 max-w-2xl mx-auto">
          <span class="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-4 text-white">
            Mulai Tanpa Biaya
          </span>
          <h2 class="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight leading-tight" style="font-family: 'DM Sans', sans-serif">
            Siap jadikan keuangan lebih transparan?
          </h2>
          <p class="mb-10 text-base sm:text-lg opacity-90 leading-relaxed">
            Bergabung dengan ribuan pengguna yang sudah mempermudah pencatatan kas dan laporan akuntabilitas bersama FTracker.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <UButton
              to="/login"
              size="xl"
              class="w-full sm:w-auto px-10 py-4 rounded-full font-bold bg-white text-primary hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl cursor-pointer justify-center"
            >
              Daftar Sekarang — Gratis
            </UButton>
            <UButton
              to="/dashboard"
              size="xl"
              variant="outline"
              class="w-full sm:w-auto px-8 py-4 rounded-full font-semibold border-white/40 text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer justify-center"
            >
              Lihat Dashboard Demo
            </UButton>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer data-reveal="fade" class="py-12 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
      <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2 font-bold text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
          <img src="/favicon.ico" alt="FTracker logo" class="w-5 h-5 rounded" />
          <span>FTracker</span>
        </div>
        <p>© 2026 FTracker. Solusi Pintar Keuangan Pribadi & Komunitas.</p>
        <div class="flex items-center gap-6 text-xs">
          <a href="#fitur" class="hover:text-primary transition-colors">Fitur</a>
          <a href="#statistik" class="hover:text-primary transition-colors">Tentang</a>
          <a href="#testimoni" class="hover:text-primary transition-colors">Testimoni</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Scroll Reveal Core Animations */
[data-reveal] {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

[data-reveal="scale"] {
  opacity: 0;
  transform: scale(0.95) translateY(24px);
  transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-reveal="fade"] {
  opacity: 0;
  transform: translateY(0);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Ambient Glow Pulse Effect */
@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, 0) scale(1);
  }
  50% {
    opacity: 0.85;
    transform: translate(-50%, -10px) scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulseSlow 8s ease-in-out infinite;
}
</style>