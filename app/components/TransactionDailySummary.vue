<script setup>
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const props = defineProps({
  date: String,
  transaction: Array,
});

// Kunci tanggal dari database masih ISO (yyyy-MM-dd), tampilkan versi ramah baca
const formattedDate = computed(() => {
  if (!props.date) return "";
  return format(parseISO(props.date), "EEE, d MMM yyyy", { locale: id });
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
      <time :datetime="date">{{ formattedDate }}</time>
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
