<script setup>
import {
  format,
  addYears,
  addMonths,
  addDays,
  subYears,
  subMonths,
  subDays,
} from "date-fns"; // TAMBAHKAN IMPORT INI
import { transactionViewsItems } from "~/utils/constants";

const selectedView = ref(transactionViewsItems[1]);
// TANGGAL ACUAN: Default-nya hari ini
const referenceDate = ref(new Date());
const isModalOpen = ref(false);
const selectedTransaction = ref(null); // State untuk menyimpan transaksi yang sedang diedit

const onEditClick = (transaction) => {
  selectedTransaction.value = transaction; // Set transaksi yang akan diedit
  isModalOpen.value = true; // Buka modal
};

const onAddClick = () => {
  selectedTransaction.value = null; // Pastikan tidak ada transaksi yang dipilih
  isModalOpen.value = true; // Buka modal untuk tambah transaksi baru
};

// Kirim referenceDate ke composable
const { current, previous } = useSelectedTimePeriod(
  selectedView,
  referenceDate,
);
const {
  transactions,
  isLoading,
  refreshTransactions,
  transactionGroupByDate,
  income,
  expense,
  incomeTotal,
  expenseTotal,
  savingsTotal,
  balanceTotal,
} = useFetchTransactions(current);

const {
  refreshTransactions: refreshPreviousTransactions,
  incomeTotal: previousIncomeTotal,
  expenseTotal: previousExpenseTotal,
  savingsTotal: previousSavingsTotal,
  balanceTotal: previousBalanceTotal,
} = useFetchTransactions(previous);

// Fungsi untuk memperbarui semua data
const refreshAll = async () => {
  await Promise.all([refreshTransactions(), refreshPreviousTransactions()]);
};

await refreshTransactions();
await refreshPreviousTransactions();

// Fungsi untuk navigasi
const nextPeriod = () => {
  if (selectedView.value === "tahunan")
    referenceDate.value = addYears(referenceDate.value, 1);
  if (selectedView.value === "bulanan")
    referenceDate.value = addMonths(referenceDate.value, 1);
  if (selectedView.value === "harian")
    referenceDate.value = addDays(referenceDate.value, 1);
};

const prevPeriod = () => {
  if (selectedView.value === "tahunan")
    referenceDate.value = subYears(referenceDate.value, 1);
  if (selectedView.value === "bulanan")
    referenceDate.value = subMonths(referenceDate.value, 1);
  if (selectedView.value === "harian")
    referenceDate.value = subDays(referenceDate.value, 1);
};

// Judul dinamis untuk navigasi (Misal: "May 2026" atau "2025")
const periodLabel = computed(() => {
  if (selectedView.value === "tahunan")
    return format(referenceDate.value, "yyyy");
  if (selectedView.value === "bulanan")
    return format(referenceDate.value, "MMMM yyyy");
  return format(referenceDate.value, "d MMMM yyyy");
});

// Menentukan apakah kondisi keuangan sedang "Tekor" (Defisit)
// 1. Logika Warna Income: Merah jika pemasukan turun dibanding periode lalu
const incomeStatusColor = computed(() => {
  return incomeTotal.value < previousIncomeTotal.value
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

// 2. Logika Warna Expense: Merah jika pengeluaran naik (boros) dibanding periode lalu
// ATAU jika pengeluaran sudah melebihi pendapatan (defisit)
const expenseStatusColor = computed(() => {
  const isSpendingMore = expenseTotal.value > previousExpenseTotal.value;
  const isOverBudget = expenseTotal.value > incomeTotal.value;

  return isSpendingMore || isOverBudget
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

// 3. Logika Warna Savings: Merah jika tabungan berkurang atau jika minus (tekor)
const savingsStatusColor = computed(() => {
  const isDecreasing = savingsTotal.value < previousSavingsTotal.value;
  const isNegative = savingsTotal.value < 0;

  return isDecreasing || isNegative
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

// 4. Logika Warna Cash on Hand: Merah hanya jika saldo total di database minus
const cashColor = computed(() => {
  return balanceTotal.value < 0
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

// State penampug sonkronisasi tombol grafik aktif (default: 'expense')
const activeChartType = ref("all");

// Fungsi penyaringan data reaktif berdasarkan tombol aktif di grafik
// Ubah fungsi filteredGroupByDate agar melakukan penyaringan bertingkat (Tipe & Kategori)
// Ganti total fungsi computed
const filteredGroupByDate = computed(() => {
  let grouped = {};

  // Jaring pengaman memastikan 'txs' selalu berupa array (tidak null/undefined) saat pertama dimuat
  const txs = transactions.value || [];

  // A. Filter Tipe Utama (Semua, Pengeluaran, Pemasukan) berdasarkan tab grafik aktif
  let filtered = txs.filter((transaction) => {
    if (activeChartType.value === "all") {
      if (activeCategory.value) {
        const targetType =
          activeCategory.value === "pemasukan" ? "income" : "expense";
        return transaction.type?.toLowerCase() === targetType;
      }
      return true;
    }
    return transaction.type?.toLowerCase() === activeChartType.value;
  });

  // B. Filter Kategori Tingkat Lanjut (Prioritas klik grafik, cadangan dropdown list)
  filtered = filtered.filter((t) => {
    if (activeCategory.value && activeChartType.value !== "all") {
      return t.category?.toLowerCase() === activeCategory.value;
    }
    return true;
  });

  // C. Sinkronisasi pengurutan data secara presisi (Tanggal & Nominal)
  filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    const amountA = Number(a.amount);
    const amountB = Number(b.amount);

    if (sortBy.value === "date_desc") return dateB - dateA;
    if (sortBy.value === "date_asc") return dateA - dateB;
    if (sortBy.value === "amount_desc") return amountB - amountA;
    if (sortBy.value === "amount_asc") return amountA - amountB;
    return 0;
  });

  // D. Kelompokkan hasil akhir yang sudah steril ke dalam tanggal harian
  for (const transaction of filtered) {
    const date = new Date(transaction.created_at).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(transaction);
  }
  return grouped;
});

// State penampung kategori filter aktif dari grafik (default: null)
const activeCategory = ref(null);

// Watcher untuk menyetel ulang filter kategori menjadi null setiap kali pengguna berpindah tab utama
watch(activeChartType, () => {
  activeCategory.value = null;
});

// State filter kategori manual dan metode pengurutan data harian
const selectedCategory = ref("all");
const sortBy = ref("date_desc"); // Default: Tanggal terbaru ke terlama

// Watcher tambahan untuk meriset filter kategori manual jika tombol tab utama grafik berpindah
watch(activeChartType, () => {
  activeCategory.value = null;
  selectedCategory.value = "all"; // Reset filter list harian
});

// Menghitung total nominal aktif untuk dikirim ke masing-masing progress bar
const activeTotalAmount = computed(() => {
  if (activeChartType.value === "income") return incomeTotal.value;
  if (activeChartType.value === "expense") return expenseTotal.value;
  return incomeTotal.value + expenseTotal.value; // Jika "Semua", totalnya adalah Pemasukan + Pengeluaran
});

// Memproses penyaringan daftar kategori
// Menggunakan daftar kategori filter statis
const categoryFilterItems = [
  "all",
  "gaji",
  "bonus",
  "transportasi",
  "hiburan",
  "pendidikan",
  "bulanan",
  "lainnya",
];
</script>

<template>
  <!-- bagian header numpuk di hp, sejejer di laptop -->
  <section
    class="flex flex-col items-center sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4"
  >
    <h1 class="text-3xl sm:text-4xl font-extrabold">Ringkasan</h1>

    <div class="flex items-center justify-between sm:justify-start">
      <div class="flex items-center space-x-2">
        <UButton
          icon="i-heroicons-chevron-left"
          variant="ghost"
          @click="prevPeriod"
        />
        <span
          class="font-bold text-base sm:text-lg min-w-25 sm:min-w-32 text-center"
          >{{ periodLabel }}</span
        >
        <UButton
          icon="i-heroicons-chevron-right"
          variant="ghost"
          @click="nextPeriod"
        />
      </div>
    </div>

    <div class="mt-2 sm:mt-0">
      <USelect v-model="selectedView" :items="transactionViewsItems" />
    </div>
  </section>

  <!-- bagian trend -->
  <section
    class="grid text-sm grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 sm:gap-16 mb-10 gap-8 ml-1 sm:ml-0"
  >
    <Trend
      title="Pemasukan"
      :amount="incomeTotal"
      :lastAmount="previousIncomeTotal"
      :loading="isLoading"
      :color="incomeStatusColor"
    />
    <Trend
      title="Pengeluaran"
      :amount="expenseTotal"
      :lastAmount="previousExpenseTotal"
      :loading="isLoading"
      :color="expenseStatusColor"
    />
    <Trend
      title="Tabungan"
      :amount="savingsTotal"
      :lastAmount="previousSavingsTotal"
      :loading="isLoading"
      :color="savingsStatusColor"
    />
    <Trend
      title="Total Saldo"
      :amount="balanceTotal"
      :lastAmount="previousBalanceTotal"
      :loading="isLoading"
      :color="cashColor"
    />
  </section>
  <section>
    <div class="order-1 lg:order-2 lg:col-span-1">
      <CategoryBreakdown
        :transactions="transactions"
        v-model:chartType="activeChartType"
        v-model:activeCategory="activeCategory"
        :key="activeChartType"
      />
    </div>
  </section>
  <!-- bagian header transaction-->
  <section
    class="flex flex-col sm:flex-row ml-1 sm:ml-0 justify-between mb-6 sm:mb-10 gap-2 mt-5"
  >
    <div>
      <h2 class="text-xl sm:text-2xl font-extrabold">Transaksi</h2>
      <div class="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Terdapat {{ income.length }} pemasukan dan
        {{ expense.length }} pengeluaran pada periode ini.
      </div>
    </div>
    <div
      class="w-full sm:w-auto mt-4 sm:mt-0 flex justify-center sm:justify-end"
    >
      <TransactionModal
        v-model:modelValue="isModalOpen"
        @update:modelValue="refreshAll"
        @saved="refreshAll"
        :transaction="selectedTransaction"
        :currentBalance="balanceTotal"
      />
      <!-- tombol add jadi full width di hp -->
      <UButton
        icon="i-heroicons-plus-circle"
        color="neutral"
        variant="outline"
        class="cursor-pointer sm:w-auto justify-center"
        label="Tambah Transaksi"
        @click="onAddClick"
      />
    </div>
  </section>

  <!-- Filter & sortir kondisonal -->
  <section class="flex justify-center sm:justify-end mb-6 ml-1 sm:ml-0">
    <div class="w-full max-w-42 sm:w-64">
      <!-- Dropdown Urutkan Data -->
      <UFormField label="Urutkan Berdasarkan">
        <USelect
          v-model="sortBy"
          :items="[
            { label: 'Tanggal Terbaru', value: 'date_desc' },
            { label: 'Tanggal Terlama', value: 'date_asc' },
            { label: 'Nominal Tertinggi', value: 'amount_desc' },
            { label: 'Nominal Terendah', value: 'amount_asc' },
          ]"
          option-attribute="label"
          value-attribute="value"
          class="w-full cursor-pointer"
        />
      </UFormField>
    </div>
  </section>
  <!-- bagian list transaksi & Grafik (Grid 2 Kolom di Desktop, Grafik Naik ke Atas di HP) -->
  <section
    :key="selectedView"
    :class="{ 'opacity-50': isLoading, 'transition-opacity': true }"
    class="min-h-150"
  >
    <!-- Kolom 2 (Daftar Transaksi) - Menggunakan order-2 (Bawah di HP) dan lg:order-1 (Kiri di Desktop) -->
    <div class="order-2 lg:order-1 lg:col-span-2">
      <div
        v-for="(transactionOnDay, date) in filteredGroupByDate"
        :key="date"
        class="mb-10"
      >
        <TransactionDailySummary :date="date" :transaction="transactionOnDay" />

        <Transaction
          v-for="(transaction, index) in transactionOnDay"
          :key="index"
          :transaction="transaction"
          :totalAmount="activeTotalAmount"
          @edit="onEditClick(transaction)"
          @delete="refreshAll()"
        />
      </div>

      <div
        v-if="transactions.length === 0 && !isLoading"
        class="text-center py-10 text-gray-500"
      >
        Tidak ada transaksi pada periode ini.
      </div>
    </div>
  </section>
  <section v-if="isLoading && transactions.length === 0">
    <USkeleton v-for="i in 3" :key="i" class="h-8 w-full rounded-md mb-2" />
  </section>
</template>
