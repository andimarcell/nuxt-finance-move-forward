<script setup>
import { onMounted, ref } from "vue"

definePageMeta({
  layout: "default"
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const oldPassword = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const isLoading = ref(false)

// Proteksi Sisi Klien
onMounted(() => {
  if (!user.value) {
    navigateTo("/login", { replace: true })
  }
})

const handleResetPassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    return toast.add({
      title: "Gagal",
      description: "Semua kolom wajib diisi!",
      color: "error",
      icon: "i-heroicons-x-circle"
    })
  }

  if (newPassword.value.length < 6) {
    return toast.add({
      title: "Gagal",
      description: "Kata sandi baru minimal harus terdiri dari 6 karakter!",
      color: "error",
      icon: "i-heroicons-x-circle"
    })
  }

  if (newPassword.value !== confirmPassword.value) {
    return toast.add({
      title: "Gagal",
      description: "Konfirmasi kata sandi tidak cocok!",
      color: "error",
      icon: "i-heroicons-x-circle"
    })
  }

  isLoading.value = true
  try {
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: oldPassword.value
    })

    if (verifyError) {
      throw new Error("Kata sandi lama yang Anda masukkan salah!")
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (updateError) throw updateError

    toast.add({
      title: "Sukses",
      description: "Kata sandi Anda berhasil diperbarui. Mengalihkan ke dashboard...",
      color: "success",
      icon: "i-heroicons-check-circle"
    })

    oldPassword.value = ""
    newPassword.value = ""
    confirmPassword.value = ""

    setTimeout(() => {
      navigateTo("/dashboard", { replace: true })
    }, 2000)

  } catch (error) {
    toast.add({
      title: "Gagal memperbarui",
      description: error.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle"
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex bg-white dark:bg-gray-950">
    <!-- PANEL KIRI: Branding & Aesthetics (Mengikuti Gaya Figma Login) -->
    <div
      class="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden bg-primary"
    >
      <!-- Dekorasi Ornamen Background -->
      <div
        class="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none bg-white blur-3xl"
      />
      <div
        class="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none bg-white blur-3xl"
      />

      <!-- Logo Top -->
      <div class="relative z-10">
        <Link to="/" class="text-xl font-bold text-white" style="font-family: 'DM Sans', sans-serif">
          F<span class="opacity-80">Tracker</span>
        </Link>
      </div>

      <!-- Quote Section -->
      <div class="relative z-10">
        <div class="flex gap-1 mb-4">
          <span v-for="i in 5" :key="i" class="text-yellow-300 text-lg">★</span>
        </div>
        <blockquote
          class="text-2xl font-semibold leading-snug mb-6 text-white"
          style="font-family: 'DM Sans', sans-serif"
        >
          "Keamanan data adalah prioritas utama kami. Pastikan kata sandi Anda kuat untuk melindungi aset finansial Anda."
        </blockquote>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-white text-primary">
            FT
          </div>
          <div class="text-white">
            <p class="text-sm font-semibold">Security Team</p>
            <p class="text-xs opacity-70">FTracker Security</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL KANAN: Form Reset Password -->
    <div class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">
        <!-- Back Link -->
        <Link
          to="/dashboard"
          class="inline-flex items-center gap-1.5 text-sm mb-8 font-medium transition-colors text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          ← Kembali ke Dashboard
        </Link>

        <div class="mb-8">
          <!-- Icon Header -->
          <div
            class="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5 bg-primary/10 text-primary"
          >
            <UIcon name="i-heroicons-lock-closed" class="w-6 h-6" />
          </div>
          <h1
            class="text-3xl font-bold mb-2"
            style="font-family: 'DM Sans', sans-serif; letter-spacing: -0.02em"
          >
            Ubah Kata Sandi
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Silakan masukkan kata sandi lama Anda dan buat kata sandi baru yang lebih aman.
          </p>
        </div>

        <!-- Form Reset -->
        <form @submit.prevent="handleResetPassword" class="flex flex-col gap-4">
          <div class="space-y-4">
            <!-- Password Lama -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                KATA SANDI LAMA
              </label>
              <UInput
                v-model="oldPassword"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed"
                class="w-full"
                :loading="isLoading"
                variant="outline"
              />
            </div>

            <!-- Divider -->
            <div class="relative py-2">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-white dark:bg-gray-950 px-2 text-gray-500">Atur Ulang</span>
              </div>
            </div>

            <!-- Password Baru -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                KATA SANDI BARU
              </label>
              <UInput
                v-model="newPassword"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed"
                class="w-full"
                :loading="isLoading"
                variant="outline"
              />
            </div>

            <!-- Konfirmasi Password Baru -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-gray-500 dark:text-gray-400">
                KONFIRMASI KATA SANDI BARU
              </label>
              <UInput
                v-model="confirmPassword"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed"
                class="w-full"
                :loading="isLoading"
                variant="outline"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <UButton
            type="submit"
            block
            size="lg"
            color="primary"
            class="mt-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-primary/30"
            :loading="isLoading"
          >
            Perbarui Kata Sandi
          </UButton>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Menyesuaikan input agar mengikuti gaya Figma (border-radius & focus) */
:deep(.u-input) {
  border-radius: 0.75rem !important;
  transition: all 0.2s ease;
}
:deep(.u-input:focus) {
  border-color: rgb(var(--color-primary-500)) !important;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-500), 0.1) !important;
}
</style>