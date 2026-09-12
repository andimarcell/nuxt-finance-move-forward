<script setup>
import { formatDistanceToNow, parseISO } from "date-fns";
import { id } from "date-fns/locale";

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  limit: {
    type: Number,
    default: 5,
  },
});

const recentTransactions = computed(() => {
  const list = [...props.transactions];
  list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return list.slice(0, props.limit);
});

const formatRelativeTime = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = typeof dateString === "string" ? parseISO(dateString) : new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: id });
  } catch {
    return "-";
  }
};

const formatAmount = (val) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const getInitials = (item) => {
  if (item.description) {
    const words = item.description.trim().split(" ");
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].slice(0, 2).toUpperCase();
  }
  return (item.category || "TX").slice(0, 2).toUpperCase();
};
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
    <div>
      <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80 mb-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <UIcon name="i-heroicons-bolt" class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
              Aktivitas Kas Terbaru
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">Log mutasi keuangan langsung</p>
          </div>
        </div>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {{ transactions.length }} total
        </span>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 4" :key="i" class="flex items-center gap-3 py-2">
          <USkeleton class="w-9 h-9 rounded-full shrink-0" />
          <div class="flex-1 space-y-1.5">
            <USkeleton class="h-3.5 w-3/4" />
            <USkeleton class="h-2.5 w-1/3" />
          </div>
          <USkeleton class="h-4 w-20" />
        </div>
      </div>

      <div v-else-if="recentTransactions.length === 0" class="py-12 text-center text-gray-400 dark:text-gray-500">
        <UIcon name="i-heroicons-inbox" class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-xs font-medium">Belum ada aktivitas pada periode ini.</p>
      </div>

      <div v-else class="space-y-1">
        <div
          v-for="tx in recentTransactions"
          :key="tx.id"
          class="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 group"
        >
          <div class="flex items-center gap-3 min-w-0 pr-2">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105"
              :class="tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-1 ring-emerald-500/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 ring-1 ring-rose-500/20'"
            >
              {{ getInitials(tx) }}
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                {{ tx.description || tx.category || 'Transaksi' }}
              </p>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-gray-400 dark:text-gray-500">
                  {{ formatRelativeTime(tx.created_at) }}
                </span>
                <span class="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                <span class="text-[10px] font-medium capitalize text-gray-500 dark:text-gray-400">
                  {{ tx.category || 'Umum' }}
                </span>
              </div>
            </div>
          </div>
          <div class="shrink-0 text-right">
            <p
              class="text-xs sm:text-sm font-bold tracking-tight"
              :class="tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
              style="font-family: 'JetBrains Mono', monospace"
            >
              {{ tx.type === 'income' ? '+' : '-' }}{{ formatAmount(tx.amount) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
      <span class="flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Live sync aktif
      </span>
      <span>Otomatis terbarui</span>
    </div>
  </div>
</template>