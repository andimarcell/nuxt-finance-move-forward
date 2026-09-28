<script setup>
const props = defineProps({
  title: String,
  amount: Number,
  lastAmount: Number,
  color: String,
  loading: Boolean,
});

const { amount } = toRefs(props);
const { animatedValue } = useAnimatedCounter(amount);

const trendingUp = computed(() => props.amount >= props.lastAmount);
const icon = computed(() =>
  trendingUp.value
    ? "i-heroicons:arrow-trending-up"
    : "i-heroicons:arrow-trending-down",
);

// LOGIKA UTAMA WARNA TREN
const color = computed(() =>
  trendingUp.value
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400",
);

// LOGIKA STATUS KUALITATIF (OPTIMAL / PERLU EVALUASI) 
const trendStatusText = computed(() => {
  // 1. KONDISI STABIL (0%): Berlaku untuk SEMUA kartu termasuk Pemasukan!
  if (percentageTrend.value === "0%") {
    return "(Stabil)";
  }

  const lowerTitle = props.title?.toLowerCase();
  
  // 2. KONDISI PERUBAHAN (Naik/Turun): Pemasukan dinonaktifkan dari penilaian kualitatif
  if (lowerTitle === "pemasukan" || lowerTitle === "income") {
    return "";
  }

  const step = props.amount - props.lastAmount;
  if (step === 0) return "(Stabil)";

  const isUp = step > 0;

  if (lowerTitle === "pengeluaran") {
    // Pengeluaran: Naik = Perlu Evaluasi, Turun = Optimal
    return isUp ? "(Perlu Evaluasi)" : "(Optimal)";
  } else {
    // Tabungan & Total Saldo: Naik = Optimal, Turun = Perlu Evaluasi
    return isUp ? "(Optimal)" : "(Perlu Evaluasi)";
  }
});

// LOGIKA WARNA STATUS TEKS (OPTIMAL = HIJAU, PERLU EVALUASI = MERAH)
const statusTextColor = computed(() => {
  if (!trendStatusText.value) return "";
  if (trendStatusText.value === "(Stabil)") {
    return "text-gray-400 dark:text-gray-500"; // Menambahkan warna abu-abu netral
  }
  return trendStatusText.value === "(Optimal)"
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
});

const percentageTrend = computed(() => {
  if (props.lastAmount === 0 || props.amount === 0) return "0%"; // Avoid division by zero
  if (props.lastAmount === 0) return "100%"; // Kalau bulan lalu 0, sekarang ada isi, artinya tumbuh 100% (dari nol)
  
  const step = props.amount - props.lastAmount;
  const ratio = (step / Math.abs(props.lastAmount)) * 100;
  const absRatio = Math.abs(ratio);

  // OPTIMASI PRESISI: Jika perubahan di bawah 1% tapi tidak 0, tampilkan desimal (misal: 0.43%)
  if (absRatio > 0 && absRatio < 1) {
    return `${absRatio.toFixed(2)}%`; // Menampilkan 2 angka di belakang koma
  }

  return `${Math.round(absRatio)}%`;
});

// LOGIKA WARNA KARTU
const trendColor = computed(() => {
  if (props.color) return props.color; // Prioritas warna dari parent

  return trendingUp.value
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
});

const { currency } = useCurrency(animatedValue);
</script>

<template>
  <div
    class="p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 flex flex-col justify-between"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="font-bold text-sm tracking-wide" :class="trendColor">
        {{ title }}
      </span>
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center"
        :class="trendingUp ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'"
      >
        <UIcon :name="icon" class="w-4 h-4" />
      </div>
    </div>

    <div class="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
      <USkeleton class="h-8 w-3/4 rounded-md" v-if="loading" />

      <!-- ClientOnly buat ngehindarin error merah (Hydration mismatch) -->
      <ClientOnly v-else>
        <!-- Flex items-start bikin teks sejajar di atas -->
        <div class="flex items-start whitespace-nowrap">
          <span>{{ currency.main }}</span>
          <!-- sup bikin teks naik, text-sm ngecilin ukurannya -->
          <sup
            class="text-xs sm:text-sm font-semibold ml-0.5 mt-1 opacity-70"
            >{{ currency.fraction }}</sup
          >
        </div>

        <!-- Tulisan Loading sementara (optional) -->
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
          :class="trendingUp ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'"
        >
          {{ percentageTrend }}
        </span>
        <span class="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs">
          vs lalu
        </span>
        
        <!-- PENAMBAHAN STATUS TEKS DARI DOSEN (BAIK/BURUK) -->
        <span v-if="trendStatusText" class="font-bold text-[11px] sm:text-xs ml-auto" :class="statusTextColor">
          {{ trendStatusText }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.green {
  @apply text-green-600 dark:text-green-400;
}
.red {
  @apply text-red-600 dark:text-red-400;
}
</style>