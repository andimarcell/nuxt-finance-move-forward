<script setup>
const props = defineProps({
  date: String,
  transaction: Array,
});

const total = computed(() => {
  let total = 0;
  for (const transaction of props.transaction) {
    if (transaction.type === "income") {
      total += transaction.amount;
    } else {
      total -= transaction.amount;
    }
  }
  return total;
});

const { currency: amount } = useCurrency(total);
</script>

<template>
  <div
    class="grid grid-cols-2 items-center border-b border-gray-200 dark:border-gray-800 py-2.5 mt-2 text-gray-500 dark:text-gray-400 font-semibold"
  >
    <div class="text-sm">
      {{ date }}
    </div>
    <div class="flex items-center justify-end">
      <div class="flex items-start text-sm">
        <span>{{ amount.main }}</span>
        <sup
          v-if="amount.fraction"
          class="text-[0.75rem] font-semibold ml-0.5 mt-1 opacity-70"
          >{{ amount.fraction }}</sup
        >
      </div>
    </div>
  </div>
</template>
