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

// Proteksi Sisi Klien: Menendang pengguna tanpa sesi login aktif kembali ke halaman login
onMounted(() => {
  if (!user.value) {
    navigateTo("/login", { replace: true })
  }
})

const handleResetPassword = async () => {
  // 1. Validasi Kelengkapan Kolom
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    return toast.add({
      title: "Gagal",
      description: "Semua kolom wajib diisi!",
      color: "error",
      icon: "i-heroicons-x-circle"
    })
  }

  // 2. Validasi Karakter Minimum
  if (newPassword.value.length < 6) {
    return toast.add({
      title: "Gagal",
      description: "Kata sandi baru minimal harus terdiri dari 6 karakter!",
      color: "error",
      icon: "i-heroicons-x-circle"
    })
  }

  // 3. Validasi Kesamaan Password Baru & Konfirmasi
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
    // LANGKAH KRUSIAL: Verifikasi apakah password lama benar menggunakan email user aktif
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.value.email,
      password: oldPassword.value
    })

    if (verifyError) {
      throw new Error("Kata sandi lama yang Anda masukkan salah!")
    }

    // Jika verifikasi password lama sukses, baru jalankan update password baru
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

    // Bersihkan form
    oldPassword.value = ""
    newPassword.value = ""
    confirmPassword.value = ""

    // Redirect kembali ke dashboard setelah 2 detik
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
  <div class="max-w-md mx-auto mt-10 sm:mt-16 px-4 pb-16 animate-fade-in-up">
    <div class="flex flex-col items-center text-center mb-6">
      <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition">
        <img src="/favicon.ico" class="w-10 h-10 rounded-lg shadow-sm" alt="FTracker" />
        <span class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">FTracker</span>
      </NuxtLink>
    </div>
    <UCard class="shadow-lg rounded-2xl">
      <template #header>
        <h3 class="text-lg font-extrabold leading-6 text-gray-900 dark:text-white">
          Ubah Kata Sandi
        </h3>
        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Masukkan kata sandi lama, lalu tetapkan kata sandi baru minimal 6 karakter.
        </p>
      </template>

      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <!-- Input Kata Sandi Lama -->
        <UFormField label="Kata Sandi Lama" required>
          <UInput
            v-model="oldPassword"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            :loading="isLoading"
          />
        </UFormField>

        <hr class="border-gray-200 dark:border-gray-800 my-4" />

        <!-- Input Kata Sandi Baru -->
        <UFormField label="Kata Sandi Baru" required>
          <UInput
            v-model="newPassword"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            :loading="isLoading"
          />
        </UFormField>

        <!-- Input Konfirmasi Kata Sandi Baru -->
        <UFormField label="Konfirmasi Kata Sandi Baru" required>
          <UInput
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon="i-heroicons-lock-closed"
            :loading="isLoading"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          variant="solid"
          block
          size="lg"
          class="mt-6 cursor-pointer font-bold rounded-xl disabled:opacity-70"
          :loading="isLoading"
          :disabled="isLoading"
        >
          {{ isLoading ? "Menyimpan..." : "Perbarui Kata Sandi" }}
        </UButton>
      </form>
    </UCard>
  </div>
</template>