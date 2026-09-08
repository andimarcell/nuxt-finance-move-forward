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
  <div>
    <div class="font-bold text-sm sm:text-base" :class="trendColor">
      {{ title }}
    </div>
    <div
      class="text-xl sm:text-2xl font-extrabold text-black dark:text-white mb-2"
    >
      <USkeleton class="h-8 w-full" v-if="loading" />

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
          <USkeleton class="h-8 w-3/4" />
        </template>
      </ClientOnly>
    </div>
    <div>
      <USkeleton class="h-6 w-full" v-if="loading" />
      <div v-else class="flex items-center space-x-1 text-sm">
        <UIcon :name="icon" class="h-6 w-6" :class="trendColor" />
        <span class="text-gray-500 dark:text-gray-400">
          {{ percentageTrend }} dari periode lalu
          
          <!-- PENAMBAHAN STATUS TEKS DARI DOSEN (BAIK/BURUK) -->
          <span v-if="trendStatusText" class="font-bold ml-1" :class="statusTextColor">
            {{ trendStatusText }}
          </span>
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