import { getSharedDemoStore } from "~/utils/demoData";

export const useFetchTransactions = (period, options = {}) => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const route = useRoute();
  const transactions = ref([]);
  const isLoading = ref(false);
  const allTimeBalance = ref(0);

  const isDemo = computed(() => {
    if (options?.isDemo !== undefined) return Boolean(options.isDemo);
    return !user.value && route.query.demo === "true";
  });

  const fetchTransactions = async () => {
    if (!period.value?.start || !period.value?.end) return;

    if (isDemo.value) {
      isLoading.value = true;
      const allDemo = getSharedDemoStore();
      const startTime = period.value.start.getTime();
      const endTime = period.value.end.getTime();

      transactions.value = allDemo
        .filter((t) => {
          const time = new Date(t.created_at).getTime();
          return time >= startTime && time <= endTime;
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      allTimeBalance.value = allDemo
        .filter((t) => new Date(t.created_at).getTime() <= endTime)
        .reduce((acc, t) => {
          const type = t.type?.toLowerCase();
          const amount = Number(t.amount);
          return type === "income" ? acc + amount : acc - amount;
        }, 0);

      isLoading.value = false;
      return;
    }

    if (!user.value) return;
    isLoading.value = true;
    try {
      const startDate = period.value.start.toISOString();
      const endDate = period.value.end.toISOString();

      const { data, error } = await supabase
        .from("transactions")
        .select()
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      transactions.value = data || [];

      const { data: allData, error: allTimeError } = await supabase
        .from("transactions")
        .select("amount, type")
        .lte("created_at", endDate);

      if (allTimeError) throw allTimeError;

      allTimeBalance.value = (allData || []).reduce((acc, transaction) => {
        const type = transaction.type?.toLowerCase();
        const amount = Number(transaction.amount);

        if (type === "income") {
          return acc + amount;
        } else if (type === "expense") {
          return acc - amount;
        }
        return acc;
      }, 0);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      transactions.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  // 🟢 SOLUSI ULTIMATE: Memantau teks string ISO (bukan objek Date) agar TIDAK LOOPING!
  watch(
    () => [
      period.value?.start?.toISOString(),
      period.value?.end?.toISOString(),
      user.value?.id,
      isDemo.value,
    ],
    () => {
      if (user.value || isDemo.value) {
        fetchTransactions();
      } else {
        transactions.value = [];
        allTimeBalance.value = 0;
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