// Supabase/PostgREST memotong hasil di 1000 baris. Ambil per halaman supaya
// daftar transaksi dan total saldo tidak terpotong diam-diam.
const PAGE_SIZE = 1000;
const MAX_PAGES = 10;

export const useFetchTransactions = (period) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const transactions = ref([]);
  const isLoading = ref(false);
  const allTimeBalance = ref(0);
  const error = ref(null);

  // Ambil seluruh baris transaksi pada rentang periode (paging 1000 baris)
  const fetchPeriodRows = async (startDate, endDate) => {
    const rows = [];

    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const { data, error: pageError } = await supabase
        .from("transactions")
        .select()
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (pageError) throw pageError;

      rows.push(...(data || []));
      if (!data || data.length < PAGE_SIZE) break;
    }

    return rows;
  };

  // Hitung saldo kumulatif di Postgres lewat fungsi agregat (lihat
  // supabase/migrations/20260929_add_balance_summary_rpc.sql)
  const fetchBalanceFromRpc = async (endDate) => {
    const { data, error: rpcError } = await supabase.rpc("get_balance_summary", {
      end_date: endDate,
    });

    if (rpcError) return { data: null, error: rpcError };

    const row = Array.isArray(data) ? data[0] : data;
    return { data: Number(row?.balance ?? 0), error: null };
  };

  // Cadangan kalau fungsi SQL belum dipasang: jumlahkan manual per halaman
  const fetchBalanceFallback = async (endDate) => {
    let balance = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE;
      const { data, error: pageError } = await supabase
        .from("transactions")
        .select("amount, type")
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (pageError) throw pageError;

      for (const transaction of data || []) {
        const type = transaction.type?.toLowerCase();
        const amount = Number(transaction.amount) || 0;

        if (type === "income") balance += amount;
        else if (type === "expense") balance -= amount;
      }

      if (!data || data.length < PAGE_SIZE) break;
    }

    return balance;
  };

  // Fungsi SQL belum ada: PostgREST membalas PGRST202, Postgres membalas 42883
  const isMissingRpcError = (rpcError) =>
    rpcError?.code === "PGRST202" || rpcError?.code === "42883";

  const fetchTransactions = async () => {
    if (!user.value || !period.value?.start || !period.value?.end) return;
    isLoading.value = true;
    error.value = null;
    try {
      const startDate = period.value.start.toISOString();
      const endDate = period.value.end.toISOString();

      transactions.value = await fetchPeriodRows(startDate, endDate);

      const { data: rpcBalance, error: rpcError } =
        await fetchBalanceFromRpc(endDate);

      if (!rpcError) {
        allTimeBalance.value = rpcBalance;
      } else if (isMissingRpcError(rpcError)) {
        allTimeBalance.value = await fetchBalanceFallback(endDate);
      } else {
        throw rpcError;
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      transactions.value = [];
      allTimeBalance.value = 0;
      error.value =
        err?.message || "Gagal memuat data transaksi. Coba lagi sebentar lagi.";
    } finally {
      isLoading.value = false;
    }
  };

  // 🟢 SOLUSI ULTIMATE: Memantau teks string ISO (bukan objek Date) agar TIDAK LOOPING!
  watch(
    () => [
      period.value?.start?.toISOString(),
      period.value?.end?.toISOString(),
      user.value?.id
    ],
    () => {
      if (user.value) {
        fetchTransactions();
      } else {
        transactions.value = [];
        allTimeBalance.value = 0;
        error.value = null;
      }
    },
    { immediate: true }
  );

  const transactionGroupByDate = computed(() => {
    let grouped = {};
    for (const transaction of transactions.value) {
      const date = new Date(transaction.created_at).toISOString().split("T")[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(transaction);
    }
    return grouped;
  });

  const income = computed(() => {
    return (transactions.value || []).filter(
      (t) => t.type?.toLowerCase() === "income"
    );
  });

  const expense = computed(() => {
    return (transactions.value || []).filter(
      (t) => t.type?.toLowerCase() === "expense"
    );
  });

  const incomeTotal = computed(() => {
    return (transactions.value || [])
      .filter((t) => t.type?.toLowerCase() === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const expenseTotal = computed(() => {
    return (transactions.value || [])
      .filter((t) => t.type?.toLowerCase() === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  });

  const savingsTotal = computed(() => {
    return incomeTotal.value - expenseTotal.value;
  });

  const balanceTotal = computed(() => {
    return allTimeBalance.value;
  });

  return {
    transactions,
    isLoading,
    error,
    refreshTransactions: fetchTransactions,
    transactionGroupByDate,
    income,
    expense,
    incomeTotal,
    expenseTotal,
    savingsTotal,
    balanceTotal,
  };
};