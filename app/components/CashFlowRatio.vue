<script setup>
import { computed, ref } from "vue";

// Menerima data transaksi aktif dari dashboard.vue
const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

// State untuk simulasi tombol filter (Year, Month, Week, Day)
const activeTab = ref("Month");
const tabs = ["Year", "Month", "Week", "Day"];

// 1. KONTROL DATA: Memisahkan transaksi masuk (Pemasukan) dan keluar (Pengeluaran)
const incomeTransactions = computed(() => {
  return props.transactions.filter((t) => t.type?.toLowerCase() === "income");
});

const expenseTransactions = computed(() => {
  return props.transactions.filter((t) => t.type?.toLowerCase() === "expense");
});

// 2. KONTROL FREKUENSI (JUMLAH TRANSAKSI)
const incomeCount = computed(() => incomeTransactions.value.length);
const expenseCount = computed(() => expenseTransactions.value.length);
const totalCount = computed(() => incomeCount.value + expenseCount.value);

// 3. KALKULASI RASIO KEHEMATAN (WIN RATIO %)
const winRatio = computed(() => {
  if (totalCount.value === 0) return 0;
  // Rumus: (Jumlah Transaksi Pemasukan / Total Frekuensi Transaksi) * 100
  return Math.round((incomeCount.value / totalCount.value) * 100);
});

// 4. KONTROL DATA TREN DI BAGIAN FOOTER (CONTOH SIMULASI HISTORIS)
const pastMonthWinPercent = ref(56); // Angka pembanding bulan lalu (simulasi)
const diffPercent = computed(() => {
  const diff = winRatio.value - pastMonthWinPercent.value;
  return {
    value: Math.abs(diff),
    isHigher: diff >= 0,
  };
});

// 5. KONFIGURASI APEXCHARTS (Mewujudkan Visual Lingkaran Donut Mewah)
const chartOptions = computed(() => {
  return {
    chart: {
      type: "donut",
      sparkline: {
        enabled: true, // Menghilangkan semua border/padding bawaan agar fokus pada lingkaran
      },
    },
    labels: ["Pemasukan", "Pengeluaran"],
    stroke: {
      show: true,
      colors: ["#111827"], // Garis pembatas warna gelap (grey-900) agar terlihat tersegmen modern
      width: 4,
    },
    colors: ["#10b981", "#ef4444"], // Hijau untuk Pemasukan, Merah untuk Pengeluaran
    plotOptions: {
      pie: {
        donut: {
          size: "78%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              color: "#9ca3af",
              offsetY: -4,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              color: "#ffffff",
              offsetY: 6,
              formatter: () => `${winRatio.value}%`, // Tampilkan angka persentase di tengah
            },
            total: {
              show: true,
              label: "Surplus", // Kategori positif tengah donat
              color: "#9ca3af",
              formatter: () => `${winRatio.value}%`,
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => `${val} Transaksi`,
      },
    },
  };
});

// Data series yang dikirim ke ApexCharts: [Jumlah Pemasukan, Jumlah Pengeluaran]
const series = computed(() => [incomeCount.value, expenseCount.value]);
</script>

<template>
  <div
    class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between h-full"
  >
    <!-- 1. BAGIAN HEADER (Judul & Tiga Ikon Aksi Pojok Kanan) -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
        Rasio Arus Kas
      </h3>
      <div
        class="flex items-center space-x-1.5 text-gray-400 dark:text-gray-500"
      >
        <UButton
          icon="i-heroicons-information-circle"
          variant="ghost"
          color="neutral"
          size="sm"
          class="cursor-pointer"
        />
        <UButton
          icon="i-heroicons-cog-6-tooth"
          variant="ghost"
          color="neutral"
          size="sm"
          class="cursor-pointer"
        />
        <UButton
          icon="i-heroicons-trash"
          variant="ghost"
          color="neutral"
          size="sm"
          class="cursor-pointer"
        />
      </div>
    </div>

    <!-- 2. BAGIAN TENGAH (Grid 2-Kolom: Kiri Grafik Bulat, Kanan Angka Nominal) -->
    <div class="grid grid-cols-2 items-center gap-4 mb-6">
      <!-- Sisi Kiri: Grafik Donat Mini -->
      <div class="flex justify-center">
        <ClientOnly>
          <apexchart
            v-if="totalCount > 0"
            type="donut"
            width="180"
            :options="chartOptions"
            :series="series"
          />
          <!-- State Pengaman jika belum ada data transaksi harian -->
          <div
            v-else
            class="text-xs text-gray-500 dark:text-gray-400 text-center py-6"
          >
            <UIcon
              name="i-heroicons-chart-pie"
              class="w-8 h-8 mx-auto mb-1 opacity-50"
            />
            <p>Belum ada data</p>
          </div>
          <template #fallback>
            <USkeleton class="h-28 w-28 rounded-full" />
          </template>
        </ClientOnly>
      </div>

      <!-- Sisi Kanan: Rincian Frekuensi Transaksi Masuk & Keluar -->
      <div class="space-y-4 ml-2">
        <div>
          <div
            class="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider"
          >
            Pemasukan
          </div>
          <div class="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            {{ incomeCount }}
            <span class="text-xs font-normal text-gray-400">transaksi</span>
          </div>
        </div>
        <div>
          <div
            class="text-[11px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider"
          >
            Pengeluaran
          </div>
          <div class="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
            {{ expenseCount }}
            <span class="text-xs font-normal text-gray-400">transaksi</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. BAGIAN TOMBOL PILIHAN (Pill Tab Switcher) -->
    <div
      class="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-full flex justify-between mb-6 border border-gray-100 dark:border-gray-800"
    >
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="grow py-1.5 text-[11px] font-black rounded-full transition duration-150 cursor-pointer text-center"
        :class="
          activeTab === tab
            ? 'bg-primary-500 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        "
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 4. BAGIAN FOOTER (Teks Analitis Komparasi Lintas Periode) -->
    <div
      class="text-xs text-center text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4"
    >
      Rasio berhemat Anda
      <span
        :class="
          diffPercent.isHigher
            ? 'text-green-500 font-black'
            : 'text-red-500 font-black'
        "
      >
        {{ diffPercent.isHigher ? "lebih tinggi" : "lebih rendah" }}
        {{ diffPercent.value }}%
      </span>
      dibandingkan bulan lalu.
    </div>
  </div>
</template>
