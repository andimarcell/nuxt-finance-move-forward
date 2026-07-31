<script setup>
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const route = useRoute();

const localAvatarStyle = ref(
  user.value?.user_metadata?.avatar_style || "initials",
);

const updateAvatarStyle = async (style) => {
  localAvatarStyle.value = style; // Langsung update UI tanpa nunggu loading

  // Simpan secara permanen ke database Auth Supabase
  await supabase.auth.updateUser({
    data: { avatar_style: style },
  });
};

const avatarProps = computed(() => {
  if (localAvatarStyle.value === "icon") {
    return {
      icon: "i-heroicons-user",
      class: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    };
  } else {
    const email = user.value?.email || "User";
    return {
      src: `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random&color=fff&bold=true`,
    };
  }
});

const dropdownItems = computed(() => [
  [
    {
      label: "Akun",
      slot: "account", // Kita buat custom slot untuk nampilin email
      disabled: true,
    },
  ],
  [
    {
      label: "Pakai Icon Bawaan",
      icon: "i-heroicons-user",
      disabled: localAvatarStyle.value === "icon", // Disable tombol jika sudah terpilih
      onSelect: () => updateAvatarStyle("icon"),
    },
    {
      label: "Pakai Inisial Email",
      icon: "i-heroicons-envelope",
      disabled: localAvatarStyle.value === "initials", // Disable tombol jika sudah terpilih
      onSelect: () => updateAvatarStyle("initials"),
    },
  ],
  [
    {
      label: "Logout",
      icon: "i-heroicons-arrow-left-on-rectangle",
      onSelect: logout,
    },
  ],
]);

const avatarUrl = computed(() => {
  if (!user.value) return null;

  // 1. Jika user punya foto asli (misal nanti kamu tambah fitur login Google), pakai foto asli
  if (user.value.user_metadata?.avatar_url) {
    return user.value.user_metadata.avatar_url;
  }

  // 2. Jika tidak ada foto (Magic Link), generate warna unik berdasarkan email!
  const email = user.value.email || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=random&color=fff&bold=true`;
});

// Fungsi untuk logout
const logout = async () => {
  await supabase.auth.signOut();
  // Bersihkan semua data hasil fetch (termasuk useAsyncData jika ada)
  clearNuxtData();

  // Redirect ke halaman login
  navigateTo("/login", { replace: true });
};
</script>

<template>
  <header class="flex items-center justify-between mt-10">
    <!-- klik logo/nama otomatis mengarah ke halaman ("/") -->
    <NuxtLink to="/" class="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition shrink-0">
      <img src="/favicon.ico" class="w-8 h-8 sm:w-10 sm:h-10 rounded-md" /><span class="text-3xl font-extrabold">FTracker</span></NuxtLink>
    <ClientOnly>
      <div v-if="user" class="flex items-center gap-2 sm:gap-4">
        <!-- tombol dinamis: hanya muncul jika user sudah login, tapi sedang tidak berada di halaman /dashboard-->
         <UButton
         v-if="route.path !== '/dashboard'"
         to="/dashboard"
         variant="solid"
         label="Ke Dashboard"
         icon="i-heroicons-arrow-right-on-rectangle"
         class="cursor-pointer font-bold shrink-0 text-xs sm:text-sm"
         >
        <span class="hidden sm:inline">Ke Dashboard </span>
        </UButton>
        <UDropdownMenu :items="dropdownItems">
          <UAvatar
            v-bind="avatarProps"
            :alt="user.email"
            size="xl"
            class="cursor-pointer"
          />
          <!-- Slot khusus untuk menampilkan email user di dropdown -->
          <template #account>
            <div class="text-left">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Signed in as
              </p>
              <p
                class="text-sm font-medium text-gray-900 dark:text-white truncate"
              >
                {{ user.email }}
              </p>
            </div>
          </template>
        </UDropdownMenu>
      </div>
      <div v-else-if="route.path !== '/login' && route.path !== '/confirm'">
        <UButton
          to="/login"
          variant="ghost"
          label="Login"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </UButton>
      </div>
      <!-- Opsional: munculin buletan kosong sementara gambarnya di-load -->
      <template #fallback>
        <USkeleton class="h-8 w-8 rounded-full" />
      </template>
    </ClientOnly>
  </header>
</template>
