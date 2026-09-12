<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  lastAmount: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    default: "balance", // 'income' | 'expense' | 'savings' | 'balance'
  },
  loading: {
    type: Boolean,
    default: false,
  },
  icon: {
    type: String,
    default: "",
  },
});

const { amount } = toRefs(props);
// Menggunakan composable animated counter agar angka bergerak saat load
const { animatedValue } = useAnimatedCounter(amount);
const { currency } = useCurrency(animatedValue);

const defaultIcon = computed(() => {
  if (props.icon) return props.icon;
  switch (props.type) {
    case "income": return "i-heroicons-arrow-down-left";
    case "expense": return "i-heroicons-arrow-up-right";
    case "savings": return "i-heroicons-banknotes";
    default: return "i-heroicons-wallet";
  }
});

const trendingUp = computed(() => props.amount >= props.lastAmount);

const percentageTrend = computed(() => {
  if (props.lastAmount === 0 || props.amount === 0) return "0%";
  const step = props.amount - props.lastAmount;
  const ratio = (step / Math.abs(props.lastAmount)) * 100;
  return `${Math.round(Math.abs(ratio))}%`;
});

const trendStatusText = computed(() => {
  if (percentageTrend.value === "0%") return "Stabil";
  const isUp = props.amount > props.lastAmount;
  if (props.type === "income") return isUp ? "Tumbuh" : "Menurun";
  if (props.type === "expense") return isUp ? "Perlu Evaluasi" : "Optimal";
  return isUp ? "Optimal" : "Perlu Evaluasi";
});

const deltaBadgeClass = computed(() => {
  if (trendStatusText.value === "Stabil") return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  const isUp = props.amount > props.lastAmount;
  if (props.type === "expense") {
    return isUp ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 ring-1 ring-red-500/20" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-500/20";
  }
  return isUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 ring-1 ring-emerald-500/20" : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 ring-1 ring-red-500/20";
});

const iconContainerClass = computed(() => {
  switch (props.type) {
    case "income": return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "expense": return "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400";
    case "savings": return "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
    default: return "bg-primary/10 text-primary dark:bg-primary/20";
  }
});
</script>

<template>
  <div class="relative p-5 sm:p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700/80 transition-all duration-300 group">
    <div class="flex items-center justify-between mb-4">
      <span class="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wide">
        {{ title }}
      </span>
      <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110" :class="iconContainerClass">
        <UIcon :name="defaultIcon" class="w-5 h-5" />
      </div>
    </div>

    <div class="mb-3">
      <USkeleton v-if="loading" class="h-8 w-40 rounded-lg" />
      <ClientOnly v-else>
        <div class="flex items-baseline font-mono tracking-tight text-gray-950 dark:text-white">
          <span class="text-2xl sm:text-3xl font-extrabold" style="font-family: 'JetBrains Mono', monospace">
            {{ currency.main }}
          </span>
          <sup class="text-xs sm:text-sm font-bold ml-1 text-gray-400 dark:text-gray-500" style="font-family: 'JetBrains Mono', monospace">
            {{ currency.fraction }}
          </sup>
        </div>
      </ClientOnly>
    </div>

    <div class="flex items-center gap-2 pt-1">
      <USkeleton v-if="loading" class="h-5 w-28 rounded-md" />
      <div v-else class="flex items-center flex-wrap gap-1.5 text-xs">
        <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-semibold" :class="deltaBadgeClass">
          <UIcon :name="trendingUp ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="w-3.5 h-3.5" />
          <span>{{ percentageTrend }}</span>
        </span>
        <span class="text-gray-400 dark:text-gray-500 text-[11px]">
          vs periode lalu <span v-if="trendStatusText" class="font-medium ml-0.5">({{ trendStatusText }})</span>
        </span>
      </div>
    </div>
  </div>
</template>