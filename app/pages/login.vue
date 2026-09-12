<script setup>
definePageMeta({
  layout: false, // Full-screen mandiri tanpa bentrok dengan layout default
});

useHead({
  title: "FTracker - Masuk & Akses Keuangan",
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

const success = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const authMode = ref("login"); // 'login' | 'register' | 'magic-link'
const isLoading = ref(false);
const isResetting = ref(false);

const supabase = useSupabaseClient();
const toast = useToast();
const user = useSupabaseUser();

// Redirect ke dashboard jika sudah login
watch(
  user,
  (currentUser) => {
    if (currentUser) {
      return navigateTo("/dashboard");
    }
  },
  { immediate: true },
);

const handleSubmit = async () => {
  if (!email.value) {
    return toast.add({
      title: "Gagal",
      description: "Email wajib diisi!",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }

  if (authMode.value !== "magic-link" && !password.value) {
    return toast.add({
      title: "Gagal",
      description: "Password wajib diisi!",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }

  isLoading.value = true;
  try {
    const siteUrl = window.location.origin;

    if (authMode.value === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;

      toast.add({
        title: "Login Berhasil!",
        description: "Selamat datang kembali di FTracker.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
    } else if (authMode.value === "register") {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;

      toast.add({
        title: "Registrasi Berhasil! 📩",
        description: `Link verifikasi telah dikirim ke ${email.value}. Silakan periksa inbox Gmail Anda untuk mengaktifkan akun.`,
        color: "success",
        icon: "i-heroicons-paper-airplane",
        timeout: 8000,
      });
      authMode.value = "login";
    } else if (authMode.value === "magic-link") {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.value,
        options: {
          emailRedirectTo: `${siteUrl}/confirm`,
        },
      });
      if (error) throw error;

      toast.add({
        title: "Cek Email Anda",
        description: `Kami telah mengirimkan link login ke ${email.value}. Silahkan periksa kotak masuk.`,
        color: "success",
        icon: "i-heroicons-check-circle",
      });
      success.value = true;
    }
  } catch (error) {
    let errorMessage = error.message;
    if (errorMessage.includes("Invalid login credentials")) {
      errorMessage = "Email atau Password salah!";
    } else if (errorMessage.includes("Email not confirmed")) {
      errorMessage = "Email Anda belum dikonfirmasi! Silakan buka Gmail dan klik link verifikasi.";
    } else if (errorMessage.includes("Password should be at least")) {
      errorMessage = "Password minimal 6 karakter!";
    } else if (errorMessage.includes("missing email")) {
      errorMessage = "Email wajib diisi!";
    } else if (errorMessage.includes("User already exists") || errorMessage.includes("User already registered")) {
      errorMessage = "Email ini sudah terdaftar! Silakan login langsung.";
    }
    toast.add({
      title: "Gagal",
      description: errorMessage,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isLoading.value = false;
  }
};

const handleForgotPassword = async () => {
  if (!email.value) {
    return toast.add({
      title: "Gagal",
      description: "Silakan isi alamat email Anda terlebih dahulu!",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }

  isResetting.value = true;
  try {
    const siteUrl = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) throw error;
    toast.add({
      title: "Email Reset Terkirim",
      description: `Tautan pengaturan ulang kata sandi telah dikirim ke ${email.value}`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    toast.add({
      title: "Gagal Mengirim",
      description: error.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isResetting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-950 text-gray-900 dark:text-white selection:bg-primary/20 selection:text-primary">
    
    <!-- TOP BAR KHUSUS MOBILE / TABLET -->
    <div class="lg:hidden flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800/80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md sticky top-0 z-30">
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors py-1 px-2.5 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        <span>Beranda</span>
      </NuxtLink>

      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-lg tracking-tight select-none" style="font-family: 'DM Sans', sans-serif">
        <img src="/favicon.ico" alt="FTracker" class="w-6 h-6 rounded" />
        <span>F<span class="text-primary">Tracker</span></span>
      </NuxtLink>
    </div>

    <!-- PANEL KIRI: Branding & Testimoni (Desktop) -->
    <div
      class="hidden lg:flex flex-col justify-between w-1/2 p-12 xl:p-16 relative overflow-hidden bg-gradient-to-br from-emerald-600 via-primary to-teal-700 text-white shadow-2xl"
    >
      <!-- Ambient Glow Shapes -->
      <div class="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-25 pointer-events-none bg-white blur-3xl animate-pulse-slow" />
      <div class="absolute -top-12 -right-12 w-80 h-80 rounded-full opacity-20 pointer-events-none bg-teal-200 blur-3xl" />
      <div class="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <!-- Top Header Panel Kiri -->
      <div class="relative z-10 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 text-2xl font-extrabold text-white tracking-tight group select-none"
          style="font-family: 'DM Sans', sans-serif"
        >
          <div class="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-105">
            <img src="/favicon.ico" alt="FTracker" class="w-full h-full object-contain brightness-0 invert" />
          </div>
          <span>F<span class="opacity-90">Tracker</span></span>
        </NuxtLink>

        <!-- Tombol Kembali Desktop -->
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-3.5 h-3.5" />
          <span>Ke Beranda</span>
        </NuxtLink>
      </div>

      <!-- Center / Bottom Content Panel Kiri -->
      <div class="relative z-10 my-auto py-12 max-w-lg">
        <!-- 5 Star Rating -->
        <div class="flex items-center gap-1 mb-6">
          <UIcon v-for="i in 5" :key="i" name="i-heroicons-star-solid" class="w-5 h-5 text-amber-300 drop-shadow-sm" />
          <span class="ml-2 text-xs font-bold text-white/90 uppercase tracking-wider">Terpercaya</span>
        </div>

        <blockquote
          class="text-2xl xl:text-3xl font-bold leading-snug mb-8 text-white drop-shadow-sm"
          style="font-family: 'DM Sans', sans-serif"
        >
          "Kelola keuangan komunitas dengan transparansi penuh. Mudah, cepat, dan akuntabel untuk semua anggota."
        </blockquote>

        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold bg-white text-primary shadow-lg ring-4 ring-white/20">
            FT
          </div>
          <div>
            <p class="text-sm font-bold text-white">FTracker Team</p>
            <p class="text-xs text-white/80">Platform Keuangan Akuntabel</p>
          </div>
        </div>
      </div>

      <!-- Bottom Meta Panel Kiri -->
      <div class="relative z-10 text-xs text-white/70 flex items-center justify-between border-t border-white/15 pt-6">
        <span>© 2026 FTracker. Solusi Pintar Keuangan.</span>
        <span class="flex items-center gap-1">
          <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
          Terenkripsi & Aman
        </span>
      </div>
    </div>

    <!-- PANEL KANAN: Form Auth -->
    <div class="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:py-16 relative overflow-hidden">
      <!-- Ambient Glow di Belakang Form -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none bg-primary/5 dark:bg-primary/10 blur-[90px] rounded-full" />

      <!-- Form Container Card -->
      <div class="w-full max-w-sm relative z-10 animate-fade-in-up">
        
        <!-- STATE 1: FORM LOGIN / REGISTER / MAGIC LINK -->
        <div v-if="!success">
          <!-- Header Form dengan Transisi Mulus -->
          <div class="mb-8 text-left">
            <div
              class="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 bg-primary/10 text-primary ring-4 ring-primary/5 transition-all duration-300"
            >
              <Transition name="icon-pop" mode="out-in">
                <UIcon
                  :key="authMode"
                  :name="
                    authMode === 'magic-link'
                      ? 'i-heroicons-sparkles'
                      : authMode === 'register'
                        ? 'i-heroicons-user-plus'
                        : 'i-heroicons-lock-closed'
                  "
                  class="w-6 h-6"
                />
              </Transition>
            </div>

            <!-- Title & Subtitle dengan Animasi Slide -->
            <Transition name="fade-slide" mode="out-in">
              <div :key="authMode">
                <h1
                  class="text-3xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-white"
                  style="font-family: 'DM Sans', sans-serif"
                >
                  <span v-if="authMode === 'login'">Selamat Datang</span>
                  <span v-else-if="authMode === 'register'">Buat Akun Baru</span>
                  <span v-else>Login Cepat</span>
                </h1>
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {{
                    authMode === 'login'
                      ? 'Silakan masuk untuk mengelola keuangan Anda.'
                      : authMode === 'register'
                        ? 'Daftar sekarang untuk mulai mencatat kas & laporan.'
                        : 'Masuk menggunakan tautan sekali klik yang dikirim ke email.'
                  }}
                </p>
              </div>
            </Transition>
          </div>

          <!-- Form Fields -->
          <form @submit.prevent="handleSubmit" class="space-y-4.5">
            <!-- Email Input -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Email
              </label>
              <UInput
                v-model="email"
                type="email"
                placeholder="nama@email.com"
                icon="i-heroicons-envelope"
                class="w-full"
                :loading="isLoading"
                variant="outline"
                autofocus
              />
            </div>

            <!-- Password Input (Animated Toggle) -->
            <Transition name="expand">
              <div v-if="authMode !== 'magic-link'" class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    v-if="authMode === 'login'"
                    type="button"
                    @click="handleForgotPassword"
                    class="text-xs font-semibold text-primary hover:underline cursor-pointer transition-colors"
                    :disabled="isResetting"
                  >
                    {{ isResetting ? 'Mengirim...' : 'Lupa Password?' }}
                  </button>
                </div>
                <UInput
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  icon="i-heroicons-lock-closed"
                  class="w-full"
                  :loading="isLoading"
                  variant="outline"
                >
                  <template #trailing>
                    <UButton
                      color="neutral"
                      variant="link"
                      size="xs"
                      :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                      class="p-0 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </UInput>
              </div>
            </Transition>

            <!-- Submit Button with Active Scale & Glow -->
            <UButton
              type="submit"
              block
              size="xl"
              color="primary"
              class="w-full mt-6 py-3.5 rounded-xl font-bold transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer justify-center"
              :loading="isLoading"
            >
              <span v-if="isLoading">Memproses...</span>
              <span v-else>
                {{
                  authMode === "login"
                    ? "Masuk"
                    : authMode === "register"
                      ? "Daftar Sekarang"
                      : "Kirim Magic Link"
                }}
              </span>
            </UButton>
          </form>

          <!-- Divider & Mode Switches -->
          <div class="mt-8 space-y-4 text-center">
            <div class="relative flex items-center py-1">
              <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
              <span class="shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Atau</span>
              <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
            </div>

            <div class="flex flex-col gap-3">
              <!-- Switch Magic Link vs Password Button -->
              <UButton
                variant="soft"
                color="neutral"
                block
                class="rounded-xl py-2.5 font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer justify-center"
                :icon="authMode === 'magic-link' ? 'i-heroicons-key' : 'i-heroicons-envelope-open'"
                @click="authMode = authMode === 'magic-link' ? 'login' : 'magic-link'"
              >
                {{ authMode === "magic-link" ? "Kembali Pakai Password" : "Login Pakai Magic Link" }}
              </UButton>

              <!-- Switch Login vs Register -->
              <div v-show="authMode !== 'magic-link'" class="text-sm text-gray-600 dark:text-gray-400 pt-1">
                {{ authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?" }}
                <button
                  type="button"
                  @click="authMode = authMode === 'login' ? 'register' : 'login'"
                  class="text-primary font-bold hover:underline ml-1 cursor-pointer transition-colors"
                  :disabled="isLoading"
                >
                  {{ authMode === "login" ? "Daftar di sini" : "Masuk di sini" }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- STATE 2: SUCCESS STATE (Magic Link terkirim) -->
        <div v-else class="text-center py-6 animate-fade-in-up">
          <div class="mb-6">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 text-primary mb-4 ring-8 ring-primary/5 animate-bounce-slow">
              <UIcon name="i-heroicons-paper-airplane" class="w-10 h-10" />
            </div>
            <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
              Cek Email Anda
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              Kami telah mengirimkan tautan login sekali klik ke: <br>
              <strong class="text-gray-900 dark:text-white font-semibold mt-1 inline-block bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md">
                {{ email }}
              </strong>
            </p>
          </div>

          <div class="space-y-3">
            <UButton
              variant="outline"
              color="neutral"
              block
              class="rounded-xl py-3 cursor-pointer justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
              @click="success = false; authMode = 'login';"
            >
              Kembali ke Login
            </UButton>
            <p class="text-xs text-gray-400">
              Tidak menerima email? Periksa folder spam atau kirim ulang setelah beberapa saat.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transisi Ganti Teks / Mode Form */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Transisi Expand/Collapse Field Password */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease, max-height 0.25s ease;
  max-height: 100px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0;
}

/* Transisi Ikon Header */
.icon-pop-enter-active {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.icon-pop-leave-active {
  transition: all 0.2s ease;
}
.icon-pop-enter-from {
  opacity: 0;
  transform: scale(0.6) rotate(-15deg);
}
.icon-pop-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(15deg);
}

/* Ambient Pulse */
@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.25;
    transform: scale(1);
  }
  50% {
    opacity: 0.35;
    transform: scale(1.08);
  }
}

.animate-pulse-slow {
  animation: pulseSlow 7s ease-in-out infinite;
}

@keyframes bounceSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-bounce-slow {
  animation: bounceSlow 3s ease-in-out infinite;
}
</style>