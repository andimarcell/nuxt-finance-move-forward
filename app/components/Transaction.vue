<script setup>
const props = defineProps({
  transaction: Object,
  totalAmount: {
    type: Number,
    default: 1, // Untuk menghindari pembagian dengan angka 0
  },
  // 🟢 TAMBAHAN BARU: Menerima status read-only dari dashboard utama
  readOnly: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["delete", "edit"]);

// Fungsi penghitung persentase bar secara presisi
const percentOfTotal = computed(() => {
  if (!props.totalAmount || props.totalAmount === 0) return 0;
  const ratio = (props.transaction?.amount || 0) / props.totalAmount * 100;
  return Math.round(ratio);
});

const amountComputed = computed(() => props.transaction.amount);
const { currency: amount } = useCurrency(amountComputed);

const isIncome = computed(() => props.transaction.type === "income");
const defaultIcons = {
  gaji: "i-heroicons-banknotes",
  bonus: "i-heroicons-gift",
  transportasi: "i-heroicons-truck",
  hiburan: "i-heroicons-ticket",
  pendidikan: "i-heroicons-academic-cap",
  bulanan: "i-heroicons-calendar-days",
};
const icon = computed(() => {
  const cat = props.transaction.category?.toLowerCase() || "";

  if (props.transaction.category_icon) {
    return props.transaction.category_icon;
  }

  if (defaultIcons[cat]) {
    return defaultIcons[cat];
  }

  return "i-heroicons-tag";
});

const supabase = useSupabaseClient();
const toast = useToast();
const { requestRefresh } = useTransactionsRefresh();
const isLoading = ref(false);
const isConfirmOpen = ref(false);

// Hapus itu permanen, jadi selalu minta konfirmasi dulu
const requestDelete = () => {
  if (props.readOnly) return;
  isConfirmOpen.value = true;
};

// Kembalikan transaksi yang baru dihapus memakai id & data aslinya
const undoDelete = async (snapshot) => {
  isLoading.value = true;
  try {
    const { error: insertError } = await supabase
      .from("transactions")
      .insert(snapshot);

    if (insertError) throw insertError;

    toast.add({
      title: "Transaksi dikembalikan",
      description: "Data sudah tercatat kembali seperti semula.",
      icon: "i-heroicons-arrow-uturn-left",
      color: "success",
    });
    // Baris ini biasanya sudah unmount saat tombol Urungkan diklik,
    // jadi minta refresh lewat sinyal global, bukan lewat emit ke parent
    requestRefresh();
  } catch (error) {
    console.error("Error restoring transaction:", error);
    toast.add({
      title: "Gagal mengembalikan",
      description:
        error?.message || "Transaksi tidak bisa dipulihkan, silakan catat ulang.",
      icon: "i-heroicons-exclamation-circle",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const deleteTransaction = async () => {
  // Guard tambahan untuk keamanan sisi script
  if (props.readOnly) return;

  isConfirmOpen.value = false;
  isLoading.value = true;

  // Simpan salinan baris sebelum dihapus supaya tombol Urungkan bisa bekerja
  const snapshot = { ...props.transaction };

  try {
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", snapshot.id);

    if (deleteError) throw deleteError;

    toast.add({
      title: "Transaksi dihapus",
      description: snapshot.description || "Data transaksi sudah dihapus.",
      icon: "i-heroicons-trash",
      color: "neutral",
      duration: 10000,
      actions: [
        {
          label: "Urungkan",
          icon: "i-heroicons-arrow-uturn-left",
          color: "primary",
          variant: "solid",
          onClick: () => undoDelete(snapshot),
        },
      ],
    });
    emit("delete", snapshot.id);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    toast.add({
      title: "Gagal menghapus",
      description: error?.message || "Terjadi kesalahan, coba lagi sebentar lagi.",
      icon: "i-heroicons-exclamation-circle",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const actions = computed(() => [
  [
    {
      label: "Ubah",
      icon: "i-heroicons-pencil-square",
      class: "cursor-pointer duration-75",
      onSelect: () => {
        emit("edit", props.transaction);
      },
    },
    {
      label: "Hapus",
      icon: "i-heroicons-trash",
      class: "cursor-pointer duration-75",
      onSelect: requestDelete,
    },
  ],
]);
// Format nama kategori agar huruf pertamanya Kapital
const categoryLabel = computed(() => {
  const cat = props.transaction.category?.trim() || "Lainnya";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
});
</script>

<template>
  <div
    v-if="props.transaction"
    class="border-b border-gray-100 dark:border-gray-800/80 py-3.5 px-3 rounded-xl hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors duration-150 flex sm:grid sm:grid-cols-2 items-center justify-between sm:justify-stretch gap-4"
  >
    <div
      class="flex items-start sm:items-center justify-between min-w-0 flex-1 sm:flex-none"
    >
      <div class="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-transform hover:scale-105"
          :class="isIncome ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'"
        >
          <UIcon
            :name="icon"
            class="w-5 h-5"
          />
        </div>

        <div class="flex flex-col min-w-0">
          <UTooltip
            :text="transaction.description"
            :content="{ side: 'top', align: 'center' }"
          >
            <div
              class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white wrap-break-word sm:truncate sm:max-w-64 md:max-w-md cursor-help"
            >
              {{ transaction.description }}
            </div>
          </UTooltip>

          <div
            class="w-36 sm:w-48 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2"
          >
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="isIncome ? 'bg-green-500' : 'bg-red-500'"
              :style="{ width: `${percentOfTotal}%` }"
            ></div>
          </div>

          <div class="mt-1.5 flex items-center gap-1.5 sm:hidden flex-wrap">
            <UBadge
              color="neutral"
              variant="subtle"
              class="text-[10px] px-1.5 py-0.5 font-medium rounded capitalize"
            >
              {{ categoryLabel }}
            </UBadge>
            <UBadge
              :color="isIncome ? 'success' : 'error'"
              variant="subtle"
              class="text-[10px] px-1.5 py-0.5 font-medium rounded"
            >
              {{ isIncome ? "Pemasukan" : "Pengeluaran" }}
            </UBadge>
          </div>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-1.5 shrink-0 ml-4">
        <UBadge
          color="neutral"
          variant="subtle"
          class="text-xs px-2 py-0.5 font-medium rounded-md capitalize"
        >
          {{ categoryLabel }}
        </UBadge>
        <UBadge
          :color="isIncome ? 'success' : 'error'"
          variant="subtle"
          class="text-xs px-2 py-0.5 font-medium rounded-md"
        >
          {{ isIncome ? "Pemasukan" : "Pengeluaran" }}
        </UBadge>
      </div>
    </div>

    <div class="flex items-center justify-end shrink-0 sm:w-full">
      <div class="flex items-center gap-2">
        <div class="flex items-start text-right">
          <span
            class="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white"
          >
            {{ amount.main }}
          </span>
          <sup
            v-if="amount.fraction"
            class="text-[0.65rem] sm:text-[0.75rem] font-bold ml-0.5 mt-0.5 sm:mt-1 opacity-70 text-gray-500 dark:text-gray-400"
          >
            {{ amount.fraction }}
          </sup>
        </div>

        <div v-if="!readOnly" class="z-50">
          <UDropdownMenu
            :items="actions"
            :content="{ side: 'bottom', align: 'end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              class="cursor-pointer transition-transform duration-150 active:scale-90 hover:scale-105"
              trailing-icon="i-heroicons-ellipsis-horizontal"
              :loading="isLoading"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>

    <!-- Konfirmasi sebelum menghapus: hapus bersifat permanen -->
    <UModal
      v-model:open="isConfirmOpen"
      title="Hapus transaksi ini?"
      description="Transaksi akan dihapus permanen. Kalau salah hapus, masih bisa dikembalikan lewat tombol Urungkan pada notifikasi."
      :dismissible="false"
      :close="{ color: 'neutral', variant: 'ghost', class: 'cursor-pointer' }"
    >
      <template #body>
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 shrink-0 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
          </div>
          <div class="min-w-0 text-left">
            <p
              class="text-sm font-semibold text-gray-900 dark:text-white wrap-break-word"
            >
              {{ transaction?.description }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ categoryLabel }} &middot; {{ amount.main }}
            </p>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            label="Batal"
            color="neutral"
            variant="ghost"
            class="cursor-pointer font-semibold"
            @click="isConfirmOpen = false"
          />
          <UButton
            label="Hapus"
            icon="i-heroicons-trash"
            color="error"
            variant="solid"
            class="cursor-pointer font-semibold"
            :loading="isLoading"
            @click="deleteTransaction"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
