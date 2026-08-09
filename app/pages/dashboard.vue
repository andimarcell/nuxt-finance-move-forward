<script setup>
import {
  format,
  addYears,
  addMonths,
  addDays,
  subYears,
  subMonths,
  subDays,
} from "date-fns";
import { id } from "date-fns/locale";
import { transactionViewsItems } from "~/utils/constants";

const config = useRuntimeConfig()
const isMemberMode = config.public.memberMode // mengambil nilai true / false dari .env

const selectedView = ref(transactionViewsItems[1]);
const referenceDate = ref(new Date());
const isModalOpen = ref(false);
const selectedTransaction = ref(null); 

const onEditClick = (transaction) => {
  if (isMemberMode) return // 🔒 PENGAMAN: Member tidak boleh edit
  selectedTransaction.value = transaction; 
  isModalOpen.value = true; 
};

const onAddClick = () => {
  if (isMemberMode) return // 🔒 PENGAMAN: Member tidak boleh tambah
  selectedTransaction.value = null; 
  isModalOpen.value = true; 
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

// Judul dinamis untuk navigasi
const periodLabel = computed(() => {
  if (selectedView.value === "tahunan")
    return format(referenceDate.value, "yyyy", { locale: id });
  if (selectedView.value === "bulanan")
    return format(referenceDate.value, "MMMM yyyy", { locale: id });
  return format(referenceDate.value, "d MMMM yyyy", { locale: id });
});

// Menentukan kondisi keuangan
const incomeStatusColor = computed(() => {
  return incomeTotal.value < previousIncomeTotal.value
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

const expenseStatusColor = computed(() => {
  const isSpendingMore = expenseTotal.value > previousExpenseTotal.value;
  const isOverBudget = expenseTotal.value > incomeTotal.value;

  return isSpendingMore || isOverBudget
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

const savingsStatusColor = computed(() => {
  const isDecreasing = savingsTotal.value < previousSavingsTotal.value;
  const isNegative = savingsTotal.value < 0;

  return isDecreasing || isNegative
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

const cashColor = computed(() => {
  return balanceTotal.value < 0
    ? "text-red-600 dark:text-red-400"
    : "text-green-600 dark:text-green-400";
});

const activeChartType = ref("all");

const filteredGroupByDate = computed(() => {
  let grouped = {};
  const txs = transactions.value || [];

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

  filtered = filtered.filter((t) => {
    if (activeCategory.value && activeChartType.value !== "all") {
      return t.category?.toLowerCase() === activeCategory.value;
    }
    if (selectedCategory.value !== "all") {
      return t.category?.toLowerCase() === selectedCategory.value;
    }
    return true;
  });

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

  for (const transaction of filtered) {
    const date = new Date(transaction.created_at).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(transaction);
  }
  return grouped;
});

const activeCategory = ref(null);

watch(activeChartType, () => {
  activeCategory.value = null;
  selectedCategory.value = "all";
});

const selectedCategory = ref("all");
const sortBy = ref("date_desc");

watch(activeChartType, () => {
  activeCategory.value = null;
  selectedCategory.value = "all";
});

const activeTotalAmount = computed(() => {
  if (activeChartType.value === "income") return incomeTotal.value;
  if (activeChartType.value === "expense") return expenseTotal.value;
  return incomeTotal.value + expenseTotal.value;
});

const categoryFilterItems = computed(() => {
  const defaultItems = [
    { label: "Semua Kategori", value: "all", icon: "i-heroicons-squares-2x2" },
    { label: "Gaji", value: "gaji", icon: "i-heroicons-banknotes" },
    { label: "Bonus", value: "bonus", icon: "i-heroicons-gift" },
    { label: "Transportasi", value: "transportasi", icon: "i-heroicons-truck" },
    { label: "Hiburan", value: "hiburan", icon: "i-heroicons-ticket" },
    {
      label: "Pendidikan",
      value: "pendidikan",
      icon: "i-heroicons-academic-cap",
    },
    { label: "Bulanan", value: "bulanan", icon: "i-heroicons-calendar-days" },
  ];

  const defaultValues = defaultItems.map((d) => d.value);
  const customItems = [];
  const uniqueCustomNames = new Set();

  const txs = transactions.value || [];
  txs.forEach((t) => {
    const cat = t.category?.toLowerCase()?.trim() || "";
    if (
      cat &&
      !defaultValues.includes(cat) &&
      cat !== "all" &&
      cat !== "lainnya"
    ) {
      if (!uniqueCustomNames.has(cat)) {
        uniqueCustomNames.add(cat);
        customItems.push({
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          value: cat,
          icon: t.category_icon || "i-heroicons-tag",
        });
      }
    }
  });

  return [...defaultItems, ...customItems];
});
</script>

<template>
  <!-- BAGIAN 1: HEADER NAVIGASI BULANAN -->
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

  <!-- BAGIAN 2: EMPAT KARTU TREN (Pemasukan, Pengeluaran, Tabungan, Total Saldo) -->
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

  <!-- BAGIAN 3: GRAFIK DISTRIBUSI KATEGORI (Tetap Dimunculkan untuk Analisis) -->
  <section class="mb-10">
    <div class="order-1 lg:order-2 lg:col-span-1">
      <CategoryBreakdown
        :transactions="transactions"
        :period="selectedView"
        :periodLabel="periodLabel"
        v-model:chartType="activeChartType"
        v-model:activeCategory="activeCategory"
        :key="activeChartType"
      />
    </div>
  </section>

  <!-- ========================================================================= -->
  <!-- 🔒 SENSOR MEMBER MODE: Seluruh elemen di bawah ini HANYA terbuka untuk Admin -->
  <!-- ========================================================================= -->
  
  <!-- BAGIAN 4: HEADER TRANSAKSI -->
  <section
    v-if="!isMemberMode"
    class="flex flex-col sm:flex-row ml-1 sm:ml-0 justify-between mb-6 sm:mb-10 gap-2 mt-5"
  >
    <div>
      <h2 class="text-xl sm:text-2xl font-extrabold">Transaksi</h2>
      <div class="text-sm sm:text-base text-gray-500 dark:text-gray-400">
        Terdapat {{ income.length }} pemasukan dan
        {{ expense.length }} pengeluaran pada periode ini.
      </div>
    </div>
    
    <div class="w-full sm:w-auto mt-4 sm:mt-0 flex justify-center sm:justify-end">
      <TransactionModal
        v-model:modelValue="isModalOpen"
        @update:modelValue="refreshAll"
        @saved="refreshAll"
        :transaction="selectedTransaction"
        :currentBalance="balanceTotal"
      />
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

  <!-- BAGIAN 5: FILTER KATEGORI & URUTAN DATA -->
  <section 
    v-if="!isMemberMode" 
    class="flex justify-center sm:justify-end mb-6 ml-1 sm:ml-0 gap-2"
  >
    <div class="w-full max-w-42 sm:w-64">
      <UFormField label="Saring Kategori">
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryFilterItems"
          value-attribute="value"
          option-attribute="label"
          placeholder="Semua Kategori..."
          class="w-full capitalize cursor-pointer"
          :ui="{
            trigger: 'capitalize',
            content: 'w-[var(--radix-select-trigger-width)] min-w-[200px] capitalize',
          }"
        >
          <template #item="{ item }">
            <div class="flex items-center gap-2">
              <UIcon
                :name="item.icon"
                class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400"
              />
              <span>{{ item.label }}</span>
            </div>
          </template>
        </USelectMenu>
      </UFormField>
    </div>
    <div class="w-full max-w-42 sm:w-64">
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

  <!-- BAGIAN 6: DETAIL LIST TRANSAKSI HARIAN -->
  <section
    v-if="!isMemberMode"
    :key="selectedView"
    :class="{ 'opacity-50': isLoading, 'transition-opacity': true }"
    class="min-h-150"
  >
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
          :read-only="isMemberMode" 
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

  <!-- BAGIAN 7: SKELETON LOADER SAAT LOADING DATA -->
  <section v-if="!isMemberMode && isLoading && transactions.length === 0">
    <USkeleton v-for="i in 3" :key="i" class="h-8 w-full rounded-md mb-2" />
  </section>
</template>