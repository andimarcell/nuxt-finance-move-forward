<script setup>
const props = defineProps({
  title: String,
  amount: Number,
  lastAmount: Number,
  loading: Boolean,
});

const { amount } = toRefs(props);
const { animatedValue } = useAnimatedCounter(amount);

const percentageTrend = computed(() => {
  const current = props.amount ?? 0;
  const previous = props.lastAmount ?? 0;

  if (previous === 0 && current === 0) return "0%";
  if (previous === 0) return "Baru";

  const delta = current - previous;
  const ratio = (delta / Math.abs(previous)) * 100;
  const absRatio = Math.abs(ratio);

  if (absRatio > 0 && absRatio < 1) {
    return `${absRatio.toFixed(2)}%`;
  }

  return `${Math.round(absRatio)}%`;
});

const trendingUp = computed(() => (props.amount ?? 0) >= (props.lastAmount ?? 0));
const icon = computed(() =>
  trendingUp.value
    ? "i-heroicons:arrow-trending-up"
    : "i-heroicons:arrow-trending-down",
);

// Single source of truth untuk semantik tone tren
const tone = computed(() => {
  const isExpense = props.title?.toLowerCase() === "pengeluaran";
  const current = props.amount ?? 0;
  const previous = props.lastAmount ?? 0;

  // Jika nilai saat ini negatif pada tabungan/saldo, mutlak buruk (warning)
  if (!isExpense && current < 0) return "bad";

  const delta = current - previous;
  if (percentageTrend.value === "0%" || delta === 0) return "neutral";

  const upIsGood = !isExpense;
  return (delta > 0) === upIsGood ? "good" : "bad";
});

const toneClass = computed(() => ({
  good: {
    text: "text-green-600 dark:text-green-400",
    chip: "bg-green-500/10 text-green-600 dark:text-green-400",
    badge: "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  },
  bad: {
    text: "text-red-600 dark:text-red-400",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  neutral: {
    text: "text-gray-400 dark:text-gray-500",
    chip: "bg-gray-500/10 text-gray-500 dark:text-gray-400",
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
}[tone.value]));

const trendStatusText = computed(() => {
  const lowerTitle = props.title?.toLowerCase() || "";
  if (lowerTitle === "pemasukan" || lowerTitle === "income") return "";
  if (tone.value === "neutral") return "(Stabil)";
  return tone.value === "good" ? "(Optimal)" : "(Perlu Evaluasi)";
});

const { currency } = useCurrency(animatedValue);
</script>

<template>
  <div
    class="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="font-bold text-sm tracking-wide text-gray-700 dark:text-gray-300">
        {{ title }}
      </span>
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center"
        :class="toneClass.chip"
      >
        <UIcon :name="icon" class="w-4 h-4" />
      </div>
    </div>

    <div class="text-base sm:text-lg xl:text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
      <USkeleton class="h-8 w-3/4 rounded-md" v-if="loading" />

      <ClientOnly v-else>
        <div class="flex items-start">
          <span class="break-all sm:break-normal">{{ currency.main }}</span>
          <sup
            v-if="currency.fraction"
            class="text-xs sm:text-sm font-semibold ml-0.5 mt-1 opacity-70"
            >{{ currency.fraction }}</sup
          >
        </div>

        <template #fallback>
          <USkeleton class="h-8 w-3/4 rounded-md" />
        </template>
      </ClientOnly>
    </div>

    <div class="pt-2 border-t border-gray-50 dark:border-gray-800/60">
      <USkeleton class="h-5 w-full rounded-md" v-if="loading" />
      <div v-else class="flex items-center flex-wrap gap-1 text-xs">
        <span
          class="inline-flex items-center font-bold px-1.5 py-0.5 rounded"
          :class="toneClass.badge"
        >
          {{ percentageTrend }}
        </span>
        <span class="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs">
          vs lalu
        </span>
        
        <span v-if="trendStatusText" class="font-bold text-[11px] sm:text-xs ml-auto" :class="toneClass.text">
          {{ trendStatusText }}
        </span>
      </div>
    </div>
  </div>
</template>