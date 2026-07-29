<script setup>
import { computed, ref } from "vue";

const activeIndex = ref(0);

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});

// 1. KONTROL SAKELAR METODE: 'expense' (Belanja) secara default
const chartType = ref("expense");

// 2. LOGIKA AGREGASI DATA KATEGORI YANG SANGAT DETAIL
const categorySummary = computed(() => {
  const summary = {};
  let totalAmount = 0;

  // Filter transaksi berdasarkan tipe aktif (Belanja / Masuk)
  const filtered = props.transactions.filter(
    (t) => t.type?.toLowerCase() === chartType.value,
  );

  // Hitung total nominal keseluruhan untuk perhitungan persentase nanti
  filtered.forEach((t) => {
    totalAmount += Number(t.amount);
    const cat = t.category ? t.category.toLowerCase().trim() : "lainnya";
    summary[cat] = (summary[cat] || 0) + Number(t.amount);
  });

  // Format data menjadi array objek terstruktur agar mudah dilooping di template
  const list = Object.keys(summary)
    .map((cat, index) => {
      const amount = summary[cat];
      const percent =
        totalAmount === 0 ? 0 : Math.round((amount / totalAmount) * 100);

      // Memberikan warna unik penanda (dot color) untuk setiap kategori
      const colors = [
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#ef4444",
        "#f59e0b",
        "#10b981",
      ];

      return {
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        amount: amount,
        percent: `${percent}%`,
        color: colors[index % colors.length], // Loop warna jika kategori melebihi jatah warna
      };
    })
    .sort((a, b) => b.amount - a.amount); // Urutkan dari pengeluaran terbesar ke terkecil

  return {
    list,
    totalAmount,
    series: list.map((item) => item.amount),
    labels: list.map((item) => item.name),
    colors: list.map((item) => item.color),
  };
});

// 3. FORMAT RUPIAH INTERNASIONAL KHUSUS LEGENDA KUSTOM
const formatRupiah = (val) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
};

// 4. KONFIGURASI APEXCHARTS (Mematikan Legenda Bawaan)
const chartOptions = computed(() => {
  return {
    chart: {
      type: "donut",
      sparkline: {
        enabled: true,
      },
      events: {
        dataPointSelection: (event, chartContext, config) => {
          if (
            config.dataPointIndex !== undefined &&
            config.dataPointIndex !== -1
          ) {
            activeIndex.value = config.dataPointIndex;
          }
        },
      },
    },
    labels: categorySummary.value.labels,
    stroke: {
      show: true,
      colors: ["#111827"],
      width: 4,
    },
    colors: categorySummary.value.colors, // Merujuk ke warna dinamis tiap kategori
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true, // Aktifkan kembali agar teks tengah muncul
              fontSize: "12px",
              fontFamily: "Inter, sans-serif",
              color: "#9ca3af",
              offsetY: -4,
            },
            value: {
              show: true, // Aktifkan kembali agar teks tengah muncul
              fontSize: "22px",
              fontFamily: "Inter, sans-serif",
              fontWeight: "bold",
              color: "#ffffff",
              offsetY: 6,
              // Menghitung persen secara dinamis saat kursor melakukan HOVER
              formatter: function (val, opts) {
                if (!opts) return val;
                const total = opts.globals.seriesTotals.reduce(
                  (a, b) => a + b,
                  0,
                );
                if (total === 0) return "0%";
                const percent = Math.round((val / total) * 100);
                return `${percent}%`;
              },
            },
            total: {
              show: true,
              // Tampilkan nama kategori aktif dari activeIndex saat TIDAK HOVER
              label:
                categorySummary.value.list.length > 0
                  ? categorySummary.value.list[activeIndex.value].name
                  : "Nihil",
              color: "#9ca3af",
              // Tampilkan persen kategori aktif dari activeIndex saat TIDAK HOVER
              formatter: function () {
                if (categorySummary.value.list.length === 0) return "0%";
                return categorySummary.value.list[activeIndex.value].percent;
              },
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => formatRupiah(val),
      },
    },
  };
});

const series = computed(() => categorySummary.value.series);
</script>

<template>
  <div
    class="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-between h-full"
  >
    <!-- 1. BAGIAN HEADER (Judul, Subjudul, & Sakelar Belanja/Masuk) -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3
          class="text-base sm:text-lg font-bold text-gray-900 dark:text-white"
        >
          Distribusi Kategori
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Pembagian arus kas bulanan berdasarkan kategori
        </p>
      </div>

      <!-- Tombol Sakelar Dinamis Belanja/Masuk -->
      <div
        class="flex gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-800 shrink-0"
      >
        <button
          type="button"
          class="px-2.5 py-1 text-[10px] font-black rounded-md transition duration-150 cursor-pointer"
          :class="
            chartType === 'expense'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          "
          @click="chartType = 'expense'"
        >
          Pengeluaran
        </button>
        <button
          type="button"
          class="px-2.5 py-1 text-[10px] font-black rounded-md transition duration-150 cursor-pointer"
          :class="
            chartType === 'income'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
          "
          @click="chartType = 'income'"
        >
          Pemasukan
        </button>
      </div>
    </div>

    <!-- 2. BAGIAN TENGAH (Grafik Donat Terpusat) -->
    <div class="flex justify-center mb-6">
      <ClientOnly>
        <apexchart
          v-if="series.length > 0"
          type="donut"
          width="200"
          :options="chartOptions"
          :series="series"
        />
        <!-- State Pengaman jika belum ada transaksi di kategori terpilih -->
        <div
          v-else
          class="text-center py-10 text-gray-500 dark:text-gray-400 text-sm"
        >
          <UIcon
            name="i-heroicons-chart-pie"
            class="w-10 h-10 mx-auto mb-2 opacity-50"
          />
          <p>Belum ada data untuk kategori ini.</p>
        </div>
        <template #fallback>
          <USkeleton class="h-48 w-48 rounded-full" />
        </template>
      </ClientOnly>
    </div>

    <!-- 3. BAGIAN LEGENDA KUSTOM (Category Breakdown List - Di-loop secara Vertikal) -->
    <div v-if="categorySummary.list.length > 0" class="space-y-5">
      <div
        class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center"
      >
        Pecahan Kategori
      </div>

      <!-- Kontainer List: Berjejer vertikal rapi di tengah -->
      <div
        class="grid grid-cols-2 gap-x-4 gap-y-5 justify-items-center max-w-sm mx-auto"
      >
        <div
          v-for="item in categorySummary.list"
          :key="item.name"
          class="flex flex-col items-center min-w-30"
        >
          <!-- Baris 1: Titik Warna + Nama Kategori -->
          <div class="flex items-center space-x-2">
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :style="{ backgroundColor: item.color }"
            ></span>
            <span
              class="text-xs font-bold text-gray-900 dark:text-white truncate max-w-22.5 capitalize"
            >
              {{ item.name }}
            </span>
          </div>
          <!-- Baris 2: Nominal Rupiah + Persentase Kehadiran -->
          <div class="flex items-center space-x-1.5 text-[10px] mt-1">
            <span class="text-gray-400 dark:text-gray-500 font-medium">
              {{ formatRupiah(item.amount) }}
            </span>
            <span class="font-black text-gray-900 dark:text-white">
              {{ item.percent }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. BAGIAN FOOTER (Indikator Real-Time & Dua Tombol Kapsul) -->
    <div
      class="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 text-center"
    >
      <!-- Indikator Hijau Terintegrasi -->
      <div
        class="flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider"
      >
        <span
          class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"
        ></span>
        <span>Data Terintegrasi</span>
      </div>

      <!-- Dua Tombol Pill Mewah di Bagian Bawah -->
      <div class="flex justify-center gap-2 mt-4">
        <UButton
          label="Konfigurasi"
          icon="i-heroicons-cog-6-tooth"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full cursor-pointer text-[10px] font-black"
        />
        <UButton
          label="Lihat Analisis"
          icon="i-heroicons-chart-bar"
          color="neutral"
          variant="outline"
          size="sm"
          class="rounded-full cursor-pointer text-[10px] font-black"
        />
      </div>
    </div>
  </div>
</template>
