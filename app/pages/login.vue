<script setup>
const success = ref(false);
const email = ref("");
const password = ref("");
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
  <div class="max-w-md mx-auto mt-20 px-4">
    <UCard v-if="!success">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold leading-6 text-gray-900 dark:text-white">
            <span v-if="authMode === 'login'">Masuk ke FTracker</span>
            <span v-else-if="authMode === 'register'">Daftar Akun Baru</span>
            <span v-else>Masuk Tanpa Password</span>
          </h3>
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
            type="password"
            placeholder="••••••••"
            v-model="password"
            icon="i-heroicons-lock-closed"
            :loading="isLoading"
          />
        </UFormField>

        <!-- Tombol Submit -->
        <UButton
          type="submit"
          color="primary"
          variant="solid"
          block
          class="mt-6"
          :loading="isLoading"
          :icon="authMode === 'magic-link' ? 'i-heroicons-sparkles' : ''"
        >
          {{
            authMode === "login"
              ? "Masuk"
              : authMode === "register"
                ? "Daftar"
                : "Kirim Magic Link"
          }}
        </UButton>
        <!-- Tombol Lupa Password (Hanya muncul jika mode login biasa/password) -->
        <div v-if="authMode === 'login'" class="text-right mt-1">
          <button
            type="button"
            class="text-xs text-gray-500 hover:text-primary transition font-medium cursor-pointer"
            @click="handleForgotPassword"
            :disabled="isResetting"
          >
            Lupa password? / Reset Password
          </button>
        </div>
      </form>

      <!-- Toggle Mode Bawah -->
      <div class="mt-6 space-y-3 text-center text-sm">
        <!-- Pemisah Visual Pakai Tailwind -->
        <div class="relative flex items-center py-2">
          <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
          <span class="shrink-0 mx-4 text-gray-400 text-xs font-medium"
            >ATAU</span
          >
          <div class="grow border-t border-gray-200 dark:border-gray-800"></div>
        </div>

        <div class="flex flex-col space-y-2">
          <!-- Tombol Toggle Dinamis -->
          <UButton
            variant="ghost"
            color="neutral"
            block
            :icon="
              authMode === 'magic-link'
                ? 'i-heroicons-key'
                : 'i-heroicons-envelope-open'
            "
            @click="
              authMode = authMode === 'magic-link' ? 'login' : 'magic-link'
            "
          >
            {{
              authMode === "magic-link"
                ? "Kembali Pakai Password"
                : "Login Pakai Magic Link"
            }}
          </UButton>

          <!-- Toggle Login / Register -->
          <div
            v-show="authMode !== 'magic-link'"
            class="text-gray-500 dark:text-gray-400 mt-2"
          >
            {{
              authMode === "login" ? "Belum punya akun?" : "Sudah punya akun?"
            }}
            <button
              type="button"
              @click="authMode = authMode === 'login' ? 'register' : 'login'"
              class="text-primary font-semibold hover:underline"
              :disabled="isLoading"
            >
              {{ authMode === "login" ? "Daftar di sini" : "Masuk di sini" }}
            </button>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Halaman Sukses Khusus Magic Link -->
    <UCard v-else class="text-center">
      <template #header>
        <h3
          class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
        >
          Email Telah Dikirim.
        </h3>
      </template>
      <div class="text-center space-y-4">
        <UIcon
          name="i-heroicons-paper-airplane"
          class="w-12 h-12 text-primary mx-auto"
        />
        <p class="text-gray-500 dark:text-gray-400">
          Silakan cek email <strong>{{ email }}</strong> untuk mengonfirmasi
          login kamu.
        </p>
        <UButton
          variant="ghost"
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
