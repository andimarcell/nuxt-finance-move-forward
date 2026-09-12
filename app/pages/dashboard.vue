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

definePageMeta({
  layout: false, // Membangun full-screen dashboard workspace dengan Sidebar dan Top Bar ala Figma
});

useHead({
  title: "Dashboard - FTracker Modern Finance",
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Inter:wght@400;500;600;700&display=swap",
    },
  ],
});

const config = useRuntimeConfig();
const isMemberMode = config.public.memberMode;
const user = useSupabaseUser();
const supabase = useSupabaseClient();
const colorMode = useColorMode();

const selectedView = ref(transactionViewsItems[1]); // Bulanan
const referenceDate = ref(new Date());
const isModalOpen = ref(false);
const selectedTransaction = ref(null);
const isMobileSidebarOpen = ref(false);
const activeNavTab = ref("overview"); // 'overview' | 'transactions' | 'analytics'

// Greeting Dinamis berdasarkan Waktu
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
});

const userDisplayName = computed(() => {
  if (!user.value) return "Pengguna";
  if (user.value.user_metadata?.full_name) {
    return user.value.user_metadata.full_name.split(" ")[0];
  }
  if (user.value.email) {
    const username = user.value.email.split("@")[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }
  return "Pengguna";
});

const userAvatarUrl = computed(() => {
  if (user.value?.user_metadata?.avatar_url) {
    return user.value.user_metadata.avatar_url;
  }
  const email = user.value?.email || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=10b981&color=fff&bold=true`;
});

const logout = async () => {
  await supabase.auth.signOut();
  clearNuxtData();
  navigateTo("/login", { replace: true });
};

// Modal handlers
const onEditClick = (transaction) => {
  if (isMemberMode) return;
  selectedTransaction.value = transaction;
  isModalOpen.value = true;
};

const onAddClick = () => {
  if (isMemberMode) return;
  selectedTransaction.value = null;
  isModalOpen.value = true;
};

// Data transactions fetch
const { current, previous } = useSelectedTimePeriod(
  selectedView,
  referenceDate,
);

const {
  transactions,
  isLoading,
  refreshTransactions,
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

const refreshAll = async () => {
  await Promise.all([refreshTransactions(), refreshPreviousTransactions()]);
};

// Navigasi Periode
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

const periodLabel = computed(() => {
  if (selectedView.value === "tahunan")
    return format(referenceDate.value, "yyyy", { locale: id });
  if (selectedView.value === "bulanan")
    return format(referenceDate.value, "MMMM yyyy", { locale: id });
  return format(referenceDate.value, "d MMMM yyyy", { locale: id });
});

// Filters & Sorting
const activeChartType = ref("all");
const selectedCategory = ref("all");
const sortBy = ref("date_desc");
const activeCategory = ref(null);
const searchQuery = ref("");

watch(activeChartType, () => {
  activeCategory.value = null;
  selectedCategory.value = "all";
});

const getCategoryValue = (cat) => {
  if (cat && typeof cat === "object") return cat.value;
  return cat;
};

// Filter transaksi lengkap
const filteredTransactionsList = computed(() => {
  const txs = transactions.value || [];

  // 1. Filter Tipe Utama
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

  // 2. Filter Kategori
  filtered = filtered.filter((t) => {
    if (activeCategory.value && activeChartType.value !== "all") {
      return (
        t.category?.toLowerCase()?.trim() ===
        activeCategory.value?.toLowerCase()?.trim()
      );
    }

    const filterValue = getCategoryValue(selectedCategory.value);
    if (filterValue === "kas_only") {
      const cat = t.category?.toLowerCase()?.trim() || "";
      return (
        cat.includes("kas") ||
        cat.includes("iuran") ||
        cat.includes("lunas") ||
        cat.includes("tunggak") ||
        cat.includes("kurang")
      );
    }
    if (filterValue !== "all") {
      return (
        t.category?.toLowerCase()?.trim() === filterValue?.toLowerCase()?.trim()
      );
    }
    return true;
  });

  // 3. Search Query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter((t) => {
      const desc = (t.description || "").toLowerCase();
      const cat = (t.category || "").toLowerCase();
      return desc.includes(q) || cat.includes(q);
    });
  }

  // 4. Pengurutan Data
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

  return filtered;
});

// Grouping Harian
const filteredGroupByDate = computed(() => {
  let grouped = {};
  for (const transaction of filteredTransactionsList.value) {
    const date = new Date(transaction.created_at).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(transaction);
  }
  return grouped;
});

const filteredIncomeTotal = computed(() =>
  filteredTransactionsList.value
    .filter((t) => t.type?.toLowerCase() === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0),
);

const filteredExpenseTotal = computed(() =>
  filteredTransactionsList.value
    .filter((t) => t.type?.toLowerCase() === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0),
);

const filteredBalanceTotal = computed(
  () => filteredIncomeTotal.value - filteredExpenseTotal.value,
);

const activeFilterLabel = computed(() => {
  const activeCat = getCategoryValue(selectedCategory.value);
  let catText =
    activeCat && activeCat !== "all"
      ? ` - KATEGORI: ${activeCat.toUpperCase()}`
      : "";
  if (activeCategory.value) {
    catText = ` - KATEGORI: ${activeCategory.value.toUpperCase()}`;
  }
  let typeText =
    activeChartType.value !== "all"
      ? ` (${activeChartType.value.toUpperCase()})`
      : "";
  return `${periodLabel.value}${typeText}${catText}`;
});

const activeTotalAmount = computed(() => {
  if (activeChartType.value === "income") return incomeTotal.value;
  if (activeChartType.value === "expense") return expenseTotal.value;
  return incomeTotal.value + expenseTotal.value;
});

const categoryFilterItems = computed(() => {
  const defaultItems = [
    { label: "Semua Kategori", value: "all", icon: "i-heroicons-squares-2x2" },
    { label: "Khusus Kas Anggota", value: "kas_only", icon: "i-heroicons-user-group" },
    { label: "Gaji", value: "gaji", icon: "i-heroicons-banknotes" },
    { label: "Bonus", value: "bonus", icon: "i-heroicons-gift" },
    { label: "Transportasi", value: "transportasi", icon: "i-heroicons-truck" },
    { label: "Hiburan", value: "hiburan", icon: "i-heroicons-ticket" },
    { label: "Pendidikan", value: "pendidikan", icon: "i-heroicons-academic-cap" },
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

// Composable Ekspor Laporan
const { exportToExcel, exportToPDF, exportToMatrixExcel, exportToMatrixPDF } =
  useExportReport();

const exportMenuItems = computed(() => [
  [
    {
      label: "Excel Matriks (Sesuai Filter)",
      icon: "i-heroicons-table-cells",
      onSelect: () =>
        exportToMatrixExcel(
          filteredTransactionsList.value,
          activeFilterLabel.value,
          !isMemberMode,
        ),
    },
    {
      label: "PDF Matriks (Sesuai Filter)",
      icon: "i-heroicons-document-chart-bar",
      onSelect: () =>
        exportToMatrixPDF(
          filteredTransactionsList.value,
          activeFilterLabel.value,
          !isMemberMode,
        ),
    },
  ],
  [
    {
      label: "Excel Detail (Sesuai Filter)",
      icon: "i-heroicons-document-text",
      onSelect: () =>
        exportToExcel(filteredTransactionsList.value, activeFilterLabel.value, {
          incomeTotal: filteredIncomeTotal.value,
          expenseTotal: filteredExpenseTotal.value,
          balanceTotal: filteredBalanceTotal.value,
        }),
    },
    {
      label: "PDF Detail (Sesuai Filter)",
      icon: "i-heroicons-document-arrow-down",
      onSelect: () =>
        exportToPDF(filteredTransactionsList.value, activeFilterLabel.value, {
          incomeTotal: filteredIncomeTotal.value,
          expenseTotal: filteredExpenseTotal.value,
          balanceTotal: filteredBalanceTotal.value,
        }),
    },
  ],
]);

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
  isMobileSidebarOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex text-gray-900 dark:text-white font-sans selection:bg-primary/20 selection:text-primary">
    
    <!-- ======================================================== -->
    <!-- 1. SIDEBAR (Fixed Desktop & Drawer Mobile)              -->
    <!-- ======================================================== -->

    <!-- Mobile Drawer Overlay -->
    <div
      v-if="isMobileSidebarOpen"
      class="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity"
      @click="isMobileSidebarOpen = false"
    />

    <!-- Sidebar Element -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-gray-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0"
      :class="isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Top Section: Brand Logo -->
      <div>
        <div class="h-18 px-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
          <NuxtLink
            to="/"
            class="flex items-center gap-2.5 font-extrabold text-xl tracking-tight select-none group"
            style="font-family: 'DM Sans', sans-serif"
          >
            <div class="w-8 h-8 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <img src="/favicon.ico" alt="FTracker" class="w-full h-full object-contain" />
            </div>
            <span>F<span class="text-primary">Tracker</span></span>
          </NuxtLink>

          <!-- Close button on Mobile -->
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            color="neutral"
            size="sm"
            class="lg:hidden cursor-pointer"
            @click="isMobileSidebarOpen = false"
          />
        </div>

        <!-- Navigation Menu Links -->
        <div class="px-3 py-6 space-y-1">
          <div class="px-3 pb-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Menu Utama
          </div>

          <button
            type="button"
            @click="scrollToSection('section-metrics')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
            :class="activeNavTab === 'overview' ? 'bg-primary/10 text-primary dark:bg-primary/20 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'"
          >
            <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
            <span>Ringkasan Kas</span>
          </button>

          <button
            type="button"
            @click="scrollToSection('section-charts')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          >
            <UIcon name="i-heroicons-chart-pie" class="w-5 h-5" />
            <span>Analisis & Grafik</span>
          </button>

          <button
            type="button"
            @click="scrollToSection('section-transactions')"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
          >
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
            <span>Tabel Transaksi</span>
          </button>

          <div class="pt-6 px-3 pb-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Akuntabilitas
          </div>

          <UDropdownMenu :items="exportMenuItems">
            <button
              type="button"
              class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span class="flex items-center gap-3">
                <UIcon name="i-heroicons-arrow-down-tray" class="w-5 h-5" />
                <span>Unduh Laporan</span>
              </span>
              <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 opacity-50" />
            </button>
          </UDropdownMenu>

          <NuxtLink
            to="/"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <UIcon name="i-heroicons-globe-alt" class="w-5 h-5" />
            <span>Portal Publik</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Bottom Section: User Info, Theme Toggle & Logout -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
        <!-- User Profile Card -->
        <div class="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <img
            :src="userAvatarUrl"
            :alt="userDisplayName"
            class="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-gray-900 dark:text-white truncate">
              {{ userDisplayName }}
            </p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {{ isMemberMode ? 'Akses Anggota' : 'Bendahara / Admin' }}
            </p>
          </div>
        </div>

        <!-- Controls: Theme switch & Logout -->
        <div class="flex items-center gap-2">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            variant="ghost"
            color="neutral"
            size="sm"
            class="flex-1 cursor-pointer justify-center"
            @click="colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'"
          >
            <span>{{ colorMode.value === 'dark' ? 'Gelap' : 'Terang' }}</span>
          </UButton>

          <UButton
            icon="i-heroicons-arrow-right-on-rectangle"
            variant="ghost"
            color="error"
            size="sm"
            class="cursor-pointer"
            title="Keluar"
            @click="logout"
          />
        </div>
      </div>
    </aside>

    <!-- ======================================================== -->
    <!-- 2. MAIN WORKSPACE CONTENT (Beside Sidebar)               -->
    <!-- ======================================================== -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      
      <!-- TOP BAR ALA FIGMA (Sticky Glass Header) -->
      <header class="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        
        <!-- Left: Hamburger + Greeting -->
        <div class="flex items-center gap-3 min-w-0">
          <UButton
            icon="i-heroicons-bars-3"
            variant="ghost"
            color="neutral"
            size="sm"
            class="lg:hidden cursor-pointer -ml-1 shrink-0"
            @click="isMobileSidebarOpen = true"
          />

          <div class="min-w-0">
            <h1
              class="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white truncate"
              style="font-family: 'DM Sans', sans-serif"
            >
              {{ greeting }}, {{ userDisplayName }} 👋
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Kelola & pantau arus kas secara transparan
            </p>
          </div>
        </div>

        <!-- Right: Period Selector & Quick Actions -->
        <div class="flex items-center gap-2 sm:gap-3 shrink-0">
          
          <!-- Period Navigator Pill -->
          <div class="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">
            <UButton
              icon="i-heroicons-chevron-left"
              variant="ghost"
              color="neutral"
              size="xs"
              class="cursor-pointer hover:bg-white dark:hover:bg-gray-700 rounded-lg"
              @click="prevPeriod"
            />
            <span class="text-xs sm:text-sm font-bold px-2 sm:px-3 text-center min-w-20 sm:min-w-28 select-none truncate">
              {{ periodLabel }}
            </span>
            <UButton
              icon="i-heroicons-chevron-right"
              variant="ghost"
              color="neutral"
              size="xs"
              class="cursor-pointer hover:bg-white dark:hover:bg-gray-700 rounded-lg"
              @click="nextPeriod"
            />
          </div>

          <!-- View Mode (Bulanan/Tahunan/Harian) -->
          <div class="hidden md:block">
            <USelect
              v-model="selectedView"
              :items="transactionViewsItems"
              size="sm"
              class="w-28 cursor-pointer"
            />
          </div>

          <!-- Tombol Tambah Transaksi Baru (Admin) -->
          <template v-if="!isMemberMode">
            <UButton
              color="primary"
              size="sm"
              class="px-3 sm:px-4 py-2 rounded-xl font-bold shadow-sm hover:shadow-md hover:shadow-primary/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              icon="i-heroicons-plus"
              @click="onAddClick"
            >
              <span class="hidden sm:inline">Transaksi Baru</span>
              <span class="sm:hidden">Baru</span>
            </UButton>
          </template>
        </div>
      </header>

      <!-- DASHBOARD MAIN BODY -->
      <main class="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
        
        <!-- ======================================================== -->
        <!-- STEP 2: METRICS SECTION (4x Metric Cards)                -->
        <!-- ======================================================== -->
        <section id="section-metrics" class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
              Ringkasan Finansial
            </h2>
            <span class="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Periode {{ periodLabel }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Total Saldo Kas"
              :amount="balanceTotal"
              :lastAmount="previousBalanceTotal"
              type="balance"
              :loading="isLoading"
              icon="i-heroicons-wallet"
            />
            <MetricCard
              title="Pemasukan Kas"
              :amount="incomeTotal"
              :lastAmount="previousIncomeTotal"
              type="income"
              :loading="isLoading"
              icon="i-heroicons-arrow-down-left"
            />
            <MetricCard
              title="Pengeluaran Kas"
              :amount="expenseTotal"
              :lastAmount="previousExpenseTotal"
              type="expense"
              :loading="isLoading"
              icon="i-heroicons-arrow-up-right"
            />
            <MetricCard
              title="Tabungan / Cadangan"
              :amount="savingsTotal"
              :lastAmount="previousSavingsTotal"
              type="savings"
              :loading="isLoading"
              icon="i-heroicons-banknotes"
            />
          </div>
        </section>

        <!-- ======================================================== -->
        <!-- STEP 2 & 4: CHARTS & ACTIVITY FEED                       -->
        <!-- ======================================================== -->
        <section id="section-charts" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <!-- Sisi Kiri: Category Breakdown & Distribution Chart (7 cols) -->
          <div class="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 sm:p-6 shadow-sm">
            <CategoryBreakdown
              :transactions="transactions"
              :period="selectedView"
              :periodLabel="periodLabel"
              v-model:chartType="activeChartType"
              v-model:activeCategory="activeCategory"
              :key="activeChartType"
            />
          </div>

          <!-- Sisi Kanan: Live Activity Feed (5 cols) -->
          <div class="lg:col-span-5">
            <ActivityFeed
              :transactions="transactions"
              :loading="isLoading"
              :limit="5"
            />
          </div>
        </section>

        <!-- ======================================================== -->
        <!-- STEP 3: TRANSACTION TABLE & CONTROLS                     -->
        <!-- ======================================================== -->
        <section id="section-transactions" class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6">
          
          <!-- Header Transaksi & Action Ekspor -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800/80">
            <div>
              <div class="flex items-center gap-2.5">
                <h3 class="text-xl font-extrabold text-gray-900 dark:text-white" style="font-family: 'DM Sans', sans-serif">
                  Daftar Transaksi
                </h3>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {{ filteredTransactionsList.length }} catatan
                </span>
              </div>
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Terdapat <strong class="text-emerald-600 dark:text-emerald-400">{{ income.length }} pemasukan</strong> dan <strong class="text-rose-600 dark:text-rose-400">{{ expense.length }} pengeluaran</strong> pada periode ini.
              </p>
            </div>

            <!-- Download & Filter Actions -->
            <div class="flex items-center gap-2">
              <UDropdownMenu :items="exportMenuItems">
                <UButton
                  icon="i-heroicons-arrow-down-tray"
                  color="neutral"
                  variant="outline"
                  size="sm"
                  class="cursor-pointer rounded-xl font-semibold"
                  label="Unduh Laporan"
                />
              </UDropdownMenu>

              <template v-if="!isMemberMode">
                <UButton
                  icon="i-heroicons-plus-circle"
                  color="primary"
                  variant="solid"
                  size="sm"
                  class="cursor-pointer rounded-xl font-semibold"
                  label="Tambah Transaksi"
                  @click="onAddClick"
                />
              </template>
            </div>
          </div>

          <!-- Controls Bar: Search, Category Filter, Sort -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Search Bar -->
            <div>
              <UInput
                v-model="searchQuery"
                placeholder="Cari transaksi..."
                icon="i-heroicons-magnifying-glass"
                size="sm"
                class="w-full"
              />
            </div>

            <!-- Category Filter -->
            <div>
              <USelectMenu
                v-model="selectedCategory"
                :items="categoryFilterItems"
                value-attribute="value"
                option-attribute="label"
                placeholder="Semua Kategori..."
                size="sm"
                class="w-full cursor-pointer"
              >
                <template #item="{ item }">
                  <div class="flex items-center gap-2">
                    <UIcon :name="item.icon" class="w-4 h-4 text-gray-400 shrink-0" />
                    <span class="truncate">{{ item.label }}</span>
                  </div>
                </template>
              </USelectMenu>
            </div>

            <!-- Sort By -->
            <div>
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
                size="sm"
                class="w-full cursor-pointer"
              />
            </div>
          </div>

          <!-- Transaction Daily List -->
          <div
            :class="{ 'opacity-50': isLoading, 'transition-opacity': true }"
            class="space-y-6 pt-2"
          >
            <!-- Daily Summary Group -->
            <div
              v-for="(transactionOnDay, date) in filteredGroupByDate"
              :key="date"
              class="space-y-2"
            >
              <TransactionDailySummary :date="date" :transaction="transactionOnDay" />

              <div class="space-y-1">
                <Transaction
                  v-for="transaction in transactionOnDay"
                  :key="transaction.id"
                  :transaction="transaction"
                  :totalAmount="activeTotalAmount"
                  :read-only="isMemberMode"
                  @edit="onEditClick(transaction)"
                  @delete="refreshAll"
                />
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="filteredTransactionsList.length === 0 && !isLoading"
              class="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl"
            >
              <div class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <UIcon name="i-heroicons-document-magnifying-glass" class="w-6 h-6" />
              </div>
              <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-1">
                Tidak ada transaksi ditemukan
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                Belum ada mutasi keuangan yang cocok dengan filter atau kata kunci pencarian Anda pada periode ini.
              </p>
              <UButton
                v-if="!isMemberMode"
                color="primary"
                size="xs"
                variant="subtle"
                label="Catat Transaksi Pertama"
                icon="i-heroicons-plus"
                @click="onAddClick"
              />
            </div>

            <!-- Skeleton Loading -->
            <div v-if="isLoading && filteredTransactionsList.length === 0" class="space-y-3">
              <USkeleton v-for="i in 4" :key="i" class="h-16 w-full rounded-xl" />
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Modal Form Tambah / Edit Transaksi -->
    <template v-if="!isMemberMode">
      <TransactionModal
        v-model:modelValue="isModalOpen"
        @update:modelValue="refreshAll"
        @saved="refreshAll"
        :transaction="selectedTransaction"
        :currentBalance="balanceTotal"
      />
    </template>
  </div>
</template>

<style scoped>
/* Transisi Smooth */
button, a {
  -webkit-tap-highlight-color: transparent;
}
</style>
