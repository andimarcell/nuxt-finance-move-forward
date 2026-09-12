<script setup>
const success = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const authMode = ref("login");
const isLoading = ref(false);
const supabase = useSupabaseClient();
const toast = useToast();

const user = useSupabaseUser();

watch(
  user,
  (user) => {
    if (user) {
      return navigateTo("/dashboard");
    }
  },
  { immediate: true },
);

definePageMeta({
  layout: false, // Menggunakan layout false agar full-screen seperti di Figma
});

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
    } else if (errorMessage.includes("User already exists")) {
      errorMessage = "Email ini sudah terdaftar! Silakan login menggunakan Magic Link.";
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

const isResetting = ref(false);
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
  <div class="min-h-screen flex bg-white dark:bg-gray-950">
    <!-- PANEL KIRI: Branding (Konsisten dengan Reset Password & Login Figma) -->
    <div
      class="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-primary"
    >
      <div class="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none bg-white blur-3xl" />
      <div class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-white blur-3xl" />

      <div class="relative z-10">
        <NuxtLink to="/" class="text-xl font-bold text-white" style="font-family: 'DM Sans', sans-serif">
          F<span class="opacity-80">Tracker</span>
        </NuxtLink>
      </div>

      <div class="relative z-10">
        <div class="flex gap-1 mb-4">
          <span v-for="i in 5" :key="i" class="text-yellow-300 text-lg">★</span>
        </div>
        <blockquote
          class="text-2xl font-semibold leading-snug mb-6 text-white"
          style="font-family: 'DM Sans', sans-serif"
        >
          "Kelola keuangan komunitas dengan transparansi penuh. Mudah, cepat, dan akuntabel untuk semua anggota."
        </blockquote>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white text-primary">
            FT
          </div>
          <div class="text-white">
            <p class="text-sm font-semibold">FTracker Team</p>
            <p class="text-xs opacity-70">Keamanan Terjamin</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL KANAN: Form Auth -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div v-if="!success" class="w-full max-w-sm">
        <!-- Header Form -->
        <div class="mb-8">
          <div
            class="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5 bg-primary/10 text-primary"
          >
            <UIcon :name="authMode === 'magic-link' ? 'i-heroicons-sparkles' : 'i-heroicons-lock-closed'" class="w-6 h-6" />
          </div>
          <h1
            class="text-3xl font-bold mb-2"
            style="font-family: 'DM Sans', sans-serif; letter-spacing: -0.02em"
          >
            <span v-if="authMode === 'login'">Selamat Datang</span>
            <span v-else-if="authMode === 'register'">Buat Akun Baru</span>
            <span v-else>Login Cepat</span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ authMode === 'login' ? 'Silakan masuk untuk mengelola keuangan Anda.' : authMode === 'register' ? 'Daftar sekarang untuk mulai mencatat kas.' : 'Masuk menggunakan tautan sekali klik lewat email.' }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
          <div class="space-y-4">
            <!-- Email Input -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</label>
              <UInput
                v-model="email"
                type="email"
                placeholder="email@contoh.com"
                icon="i-heroicons-envelope"
                class="w-full"
                :loading="isLoading"
                variant="outline"
              />
            </div>

            <!-- Password Input (Hidden in Magic Link mode) -->
            <div v-if="authMode !== 'magic-link'" class="flex flex-col gap-1.5">
              <div class="flex justify-between items-center">
                <label class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Password</label>
                <button
                  type="button"
                  @click="handleForgotPassword"
                  class="text-[10px] font-bold text-primary hover:underline"
                  :disabled="isResetting"
                >
                  Lupa Password?
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
                    class="p-0 text-gray-400"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </UInput>
            </div>
          </div>

          <UButton
            type="submit"
            block
            size="lg"
            color="primary"
            class="mt-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-primary/30"
            :loading="isLoading"
          >
            {{
              authMode === "login"
                ? "Masuk"
                : authMode === "register"
                  ? "Daftar Sekarang"
                  : "Kirim Magic Link"
            }}
          </UButton>
        </form>

        <!-- Mode Toggle Section -->
        <div class="mt-8 space-y-4 text-center">
          <div class="relative flex items-center py-2">
            <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
            <span class="shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">Atau</span>
            <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
          </div>

          <div class="flex flex-col gap-3">
            <UButton
              variant="ghost"
              color="neutral"
              block
              class="rounded-xl py-2"
              :icon="authMode === 'magic-link' ? 'i-heroicons-key' : 'i-heroicons-envelope-open'"
              @click="authMode = authMode === 'magic-link' ? 'login' : 'magic-link'"
            >
              {{ authMode === "magic-link" ? "Kembali Pakai Password" : "Login Pakai Magic Link" }}
            </UButton>

            <div v-show="authMode !== 'magic-link'" class="text-sm text-gray-500 dark:text-gray-400">
              {{ authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?" }}
              <button
                type="button"
                @click="authMode = authMode === 'login' ? 'register' : 'login'"
                class="text-primary font-bold hover:underline ml-1"
                :disabled="isLoading"
              >
                {{ authMode === "login" ? "Daftar di sini" : "Masuk di sini" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SUCCESS STATE (Magic Link) -->
      <div v-else class="w-full max-w-sm text-center">
        <div class="mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <UIcon name="i-heroicons-paper-airplane" class="w-8 h-8" />
          </div>
          <h2 class="text-2xl font-bold mb-2">Cek Email Anda</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Kami telah mengirimkan tautan login ke <br>
            <strong class="text-gray-900 dark:text-white">{{ email }}</strong>.
          </p>
        </div>
        <UButton
          variant="outline"
          color="neutral"
          block
          class="rounded-xl"
          @click="success = false; authMode = 'login';"
        >
          Kembali ke Login
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.u-input) {
  border-radius: 0.75rem !important;
  transition: all 0.2s ease;
}
:deep(.u-input:focus) {
  border-color: rgb(var(--color-primary-500)) !important;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-500), 0.1) !important;
}
</style>