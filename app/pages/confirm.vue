<script setup>
const user = useSupabaseUser();

// Dengarkan perubahan state user. Begitu Supabase berhasil baca token dari email,
// 'user' akan terisi, dan kita langsung tendang ke index (/)
watch(
  user,
  () => {
    if (user.value) {
      navigateTo("/dashboard", { replace: true });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="h-screen flex flex-col items-center justify-center space-y-4">
    <UIcon
      name="i-heroicons-arrow-path"
      class="w-10 h-10 animate-spin text-primary"
    />
    <p class="text-xl font-semibold text-gray-700 dark:text-gray-300">
      Memverifikasi tautan login...
    </p>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      Tunggu sebentar, Anda akan diarahkan ke dashboard.
    </p>
  </div>
</template>
