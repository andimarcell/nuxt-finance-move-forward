<script setup>
const route = useRoute();

useHead({
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Red+Rose:wght@300..700&display=swap",
    },
  ],
});

// Gunakan max-w-5xl jika di dashboard agar visual lebih leluasa dan modern
const containerClass = computed(() => {
  return route.path === "/dashboard"
    ? "container mx-auto max-w-5xl px-4 sm:px-6 transition-all duration-300"
    : "container mx-auto max-w-4xl px-4 sm:px-6 transition-all duration-300";
});
</script>

<template>
  <div :class="containerClass">
    <Header />
    <main class="my-8 sm:my-10 pb-16 sm:pb-0">
      <slot />
    </main>
  </div>
</template>

<style></style>
