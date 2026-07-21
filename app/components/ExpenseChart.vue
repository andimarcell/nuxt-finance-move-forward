<script setup>
import { computed } from "vue";

const chartType = ref("expense");

// Menerima data transaksi langsung dari dashboard.vue sebagai props
const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

// LOGIKA AGREGASI: Mengelompokkan & menjumlahkan nominal transaksi khusus tipe 'expense'
const aggregatedData = computed(() => {
  const summary = {};

  props.transactions
    .filter((t) => t.type?.toLowerCase() === chartType.value) // Hanya ambil transaksi dengan tipe 'expense'
    .forEach((t) => {
      // Menyamakan huruf kapital pada nama kategori agar konsisten
      const categoryName = t.category
        ? t.category.charAt(0).toUpperCase() + t.category.slice(1)
        : "Lainnya";
      summary[categoryName] = (summary[categoryName] || 0) + Number(t.amount);
    });

  return {
    labels: Object.keys(summary),
    series: Object.values(summary),
  };
});

// Konfigurasi visual ApexCharts
const chartOptions = computed(() => {
  return {
    chart: {
      type: "donut",
      foreColor: "#9ca3af", // Warna teks abu-abu agar serasi dengan dark mode
    },
    labels: aggregatedData.value.labels,
    stroke: {
      show: false, // Menghilangkan garis batas antar irisan grafik
    },
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Inter, sans-serif",
    },
    // Konfigurasi warna warna modern khas finansial
    colors: chartColors.value,

    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: centerLabel.value,
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              color: "#9ca3af",
              formatter: function (w) {
                // Menghitung total pengeluaran untuk diletakkan di tengah lingkaran donat
                const totalSum = w.globals.seriesTotals.reduce(
                  (a, b) => a + b,
                  0,
                );
                return new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(totalSum);
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(val);
        },
      },
    },
  };
});

const chartColors = computed(() => {
  return chartType.value === "expense"
    ? // 10 Pilihan warna hangat/merah untuk Pengeluaran (Expense)
      [
        "#ef4444",
        "#f97316",
        "#f59e0b",
        "#eab308",
        "#8b5cf6",
        "#ec4899",
        "#d946ef",
        "#a855f7",
        "#3b82f6",
        "#06b6d4",
      ]
    : // 10 Pilihan warna dingin/hijau untuk Pemasukan (Income)
      [
        "#10b981",
        "#14b8a6",
        "#06b6d4",
        "#3b82f6",
        "#6366f1",
        "#8b5cf6",
        "#a855f7",
        "#d946ef",
        "#ec4899",
        "#f43f5e",
      ];
});

const centerLabel = computed(() => {
  return chartType.value === "expense" ? "Total Belanja" : "Total Tabungan";
});

const series = computed(() => aggregatedData.value.series);
</script>

<template>
  <div
    class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm"
  >
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
        Analisis Transaksi
      </h3>

      <div class="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          type="button"
          class="px-3 py-1 text-xs font-bold rounded-md transaition duration-150 cursor-pointer"
          :class="
            chartType === 'expense'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          "
          @click="chartType = 'expense'"
        >
          Belanja
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-bold rounded-md transaition duration-150 cursor-pointer"
          :class="
            chartType === 'income'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          "
          @click="chartType = 'income'"
        >
          Masuk
        </button>
      </div>
    </div>

    <!-- Render chart murni di sisi klien (ClientOnly) karena ApexCharts membutuhkan objek window browser -->
    <ClientOnly>
      <div v-if="series.length > 0" class="flex justify-center">
        <!-- Komponen pembungkus ApexCharts bawaan dari vue3-apexcharts -->
        <apexchart
          type="donut"
          width="360"
          :options="chartOptions"
          :series="series"
        />
      </div>
      <div
        v-else
        class="text-center py-10 text-gray-500 dark:text-gray-400 text-sm"
      >
        <UIcon
          name="i-heroicons-chart-pie"
          class="w-10 h-10 mx-auto mb-2 opacity-50"
        />
        <p>Belum ada data transaksi pengeluaran pada periode ini.</p>
      </div>

      <!-- Tampilan sementara (skeleton loader) saat library dimuat di browser -->
      <template #fallback>
        <USkeleton class="h-64 w-full rounded-lg" />
      </template>
    </ClientOnly>
  </div>
</template>
