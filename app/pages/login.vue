<script setup>
const success = ref(false);
const email = ref("");
const password = ref("");
const showPassword = ref(false); // Untuk toggle visibility password
const authMode = ref("login");
const isLoading = ref(false);
const supabase = useSupabaseClient();
const toast = useToast(); // Instance Toast resmi dari Nuxt UI

const user = useSupabaseUser();

watch(
  user,
  (user) => {
    if (user) {
      return navigateTo("/dashboard"); // Redirect ke homepage jika sudah login
    }
  },
  { immediate: true },
);

definePageMeta({
  layout: "default",
});

const handleSubmit = async () => {
  // validasi mencegah kirim data kosong
  if (!email.value) {
    return toast.add({
      title: "Gagal",
      description: "Email wajib diisi!",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }

  // jika bukan mode magic-link wajib isi password
  if (authMode.value !== "magic-link" && !password.value) {
    return toast.add({
      title: "Gagal",
      description: "Password wajib diisi!",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }

  // proses ke server supabase
  isLoading.value = true;
  try {
    const siteUrl = window.location.origin;

    if (authMode.value === "login") {
      // LOGIC LOGIN PASSWORD
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;

      // TOAST LOGIN SUKSES
      toast.add({
        title: "Login Berhasil!",
        description: "Selamat datang kembali di FTracker.",
        color: "success",
        icon: "i-heroicons-check-circle",
      });
    } else if (authMode.value === "register") {
      // LOGIC DAFTAR (REGISTER) PASSWORD
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) throw error;

      // 1. UPDATE PESAN SUKSES DAFTAR BIAR USER LANGSUNG FAHAM BUKA GMAIL
      toast.add({
        title: "Registrasi Berhasil! 📩",
        description: `Link verifikasi telah dikirim ke ${email.value}. Silakan periksa inbox Gmail Anda untuk mengaktifkan akun.`,
        color: "success",
        icon: "i-heroicons-paper-airplane",
        timeout: 8000, // Tampil lebih lama (8 detik) agar terbaca utuh
      });

      // Pindahkan mode form ke Login setelah daftar
      authMode.value = "login";
    } else if (authMode.value === "magic-link") {
      // LOGIC MAGIC LINK (OTP)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.value,
        options: {
          emailRedirectTo: `${siteUrl}/confirm`,
        },
      });
      if (error) throw error;

      // TOAST MAGIC LINK SUKSES
      toast.add({
        title: "Cek Email Anda",
        description: `Kami telah mengirimkan link login ke ${email.value}. Silahkan periksa kotak masuk.`,
        color: "success",
        icon: "i-heroicons-check-circle",
      });

      success.value = true; // Munculkan layar "Cek Email"
    }
  } catch (error) {
    let errorMessage = error.message;

    // PENERJEMAH ERROR SUPABASE KE BAHASA INDONESIA
    if (errorMessage.includes("Invalid login credentials")) {
      errorMessage = "Email atau Password salah!";
    } else if (errorMessage.includes("Email not confirmed")) {
      // 👈 TERJEMAHAN KHUSUS UNTUK EMAIL BELUM DIKONFIRMASI
      errorMessage =
        "Email Anda belum dikonfirmasi! Silakan buka Gmail dan klik link verifikasi yang telah kami kirimkan.";
    } else if (errorMessage.includes("Password should be at least")) {
      errorMessage = "Password minimal 6 karakter!";
    } else if (
      errorMessage.includes("missing email or phone") ||
      errorMessage.includes("missing email")
    ) {
      errorMessage = "Email wajib diisi!";
    } else if (
      errorMessage.includes("User already exists") ||
      errorMessage.includes("User already registered")
    ) {
      // Menangkap "User already registered"
      errorMessage =
        "Email ini sudah terdaftar! Silakan login menggunakan Magic Link.";
    } else if (
      errorMessage.includes("Anonymous sign-ins are not disabled") ||
      errorMessage.includes("Signup requires password")
    ) {
      errorMessage = "Password wajib diisi dengan benar !";
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
      redirectTo: `${siteUrl}/reset-password`, // Diarahkan ke halaman reset password baru
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
  <div class="max-w-md mx-auto mt-10 sm:mt-16 px-4 pb-16 animate-fade-in-up">
    <!-- Brand header -->
    <div class="flex flex-col items-center text-center mb-6">
      <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition">
        <img src="/favicon.ico" class="w-10 h-10 rounded-lg shadow-sm" alt="FTracker" />
        <span class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">FTracker</span>
      </NuxtLink>
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
        Kelola arus kas dan akuntabilitas keuangan dalam satu tempat.
      </p>
    </div>

    <UCard v-if="!success" class="shadow-lg shadow-gray-200/50 dark:shadow-black/30 border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
      <template #header>
        <div class="flex flex-col gap-4">
          <div>
            <h3 class="text-lg font-extrabold leading-6 text-gray-900 dark:text-white">
              <span v-if="authMode === 'login'">Selamat datang kembali</span>
              <span v-else-if="authMode === 'register'">Buat akun baru</span>
              <span v-else>Masuk tanpa password</span>
            </h3>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span v-if="authMode === 'login'">Masuk ke FTracker untuk lanjut ke dashboard.</span>
              <span v-else-if="authMode === 'register'">Daftar gratis, verifikasi via email.</span>
              <span v-else>Kami kirimkan tautan login aman ke email kamu.</span>
            </p>
          </div>

          <!-- Segmented mode tabs -->
          <div class="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl" role="tablist">
            <button
              type="button"
              role="tab"
              :aria-selected="authMode === 'login'"
              @click="authMode = 'login'"
              class="py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer"
              :class="authMode === 'login' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            >
              Masuk
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="authMode === 'register'"
              @click="authMode = 'register'"
              class="py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer"
              :class="authMode === 'register' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            >
              Daftar
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="authMode === 'magic-link'"
              @click="authMode = 'magic-link'"
              class="py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer"
              :class="authMode === 'magic-link' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            >
              Magic Link
            </button>
          </div>
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Input Email -->
        <UFormField label="Email" required name="email">
          <UInput
            type="email"
            placeholder="email@contoh.com"
            v-model="email"
            icon="i-heroicons-envelope"
            :loading="isLoading"
            class="w-full"
          />
        </UFormField>

        <!-- Input Password (Hanya muncul jika BUKAN mode magic link) -->
        <UFormField
          v-if="authMode !== 'magic-link'"
          label="Password"
          required
          name="password"
        >
          <UInput
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            v-model="password"
            icon="i-heroicons-lock-closed"
            :loading="isLoading"
            class="w-full"
          >
            <!-- Tombol Ikon Mata di Sebelah Kanan Input -->
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="xs"
                :icon="
                  showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'
                "
                class="cursor-pointer text-gray-400 hover:text-primary p-0"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <!-- Tombol Submit -->
        <UButton
          type="submit"
          color="primary"
          variant="solid"
          block
          size="lg"
          class="mt-6 font-bold rounded-xl cursor-pointer"
          :loading="isLoading"
          :icon="authMode === 'magic-link' ? 'i-heroicons-sparkles' : ''"
        >
          {{
            authMode === "login"
              ? "Masuk ke Dashboard"
              : authMode === "register"
                ? "Buat Akun"
                : "Kirim Magic Link"
          }}
        </UButton>
        <!-- Tombol Lupa Password (Hanya muncul jika mode login biasa/password) -->
        <div v-if="authMode === 'login'" class="text-center mt-2">
          <button
            type="button"
            class="text-xs text-gray-500 hover:text-primary transition font-medium cursor-pointer disabled:opacity-50"
            @click="handleForgotPassword"
            :disabled="isResetting || isLoading"
          >
            {{ isResetting ? "Mengirim tautan reset..." : "Lupa password? Reset di sini" }}
          </button>
        </div>
      </form>

      <!-- Info keamanan -->
      <div class="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
        <UIcon name="i-heroicons-shield-check" class="w-4 h-4" />
        <span>Dilindungi autentikasi terenkripsi Supabase</span>
      </div>
    </UCard>

    <!-- Halaman Sukses Khusus Magic Link -->
    <UCard v-else class="text-center shadow-lg rounded-2xl">
      <template #header>
        <h3
          class="text-base font-extrabold leading-6 text-gray-900 dark:text-white"
        >
          Email Telah Dikirim
        </h3>
      </template>
      <div class="text-center space-y-4 py-2">
        <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <UIcon
            name="i-heroicons-paper-airplane"
            class="w-8 h-8"
          />
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
          Silakan cek email <strong class="text-gray-900 dark:text-white">{{ email }}</strong> untuk mengonfirmasi
          login kamu.
        </p>
        <UButton
          variant="ghost"
          color="neutral"
          class="cursor-pointer"
          @click="
            success = false;
            authMode = 'login';
          "
        >
          Kembali ke login
        </UButton>
      </div>
    </UCard>
  </div>
</template>
