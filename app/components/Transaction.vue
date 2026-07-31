<script setup>
import { computed } from "vue";

const props = defineProps({
  transaction: Object,
  // Properti totalAmount
  totalAmount: {
    type: Number,
    default: 1, // Untuk menghindari pembagian dengan angka 0
  },
});
const emit = defineEmits(["delete", "edit"]);

// Fungsi penghitung persentase bar secara presisi
const percentOfTotal = computed(() => {
  if (!props.totalAmount || props.totalAmount === 0) return 0;
  const ratio = (props.transaction.amount / props.totalAmount) * 100;
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
  bulanan: "i-heroicons-calendar-days"
}
const icon = computed(() => {
  const cat = props.transaction.category?.toLowerCase() || ""
  
  // 1. Jika ada ikon kustom tersimpan di database, gunakan itu!
  if (props.transaction.category_icon) {
    return props.transaction.category_icon
  }
  
  // 2. Jika tidak ada, cek apakah masuk kategori bawaan (default)
  if (defaultIcons[cat]) {
    return defaultIcons[cat]
  }

  // 3. Jika benar-benar kosong, gunakan ikon penanda tag default
  return "i-heroicons-tag"
})

const iconColor = computed(() => {
  if (isIncome.value) {
    return "text-green-500";
  } else {
    return "text-red-500";
  }
});

const supabase = useSupabaseClient();
const toast = useToast();
const isLoading = ref(false);

const deleteTransaction = async () => {
  isLoading.value = true;
  try {
    await supabase.from("transactions").delete().eq("id", props.transaction.id);
    toast.add({
      title: "Transaksi berhasil dihapus!",
      icon: "i-heroicons-check-circle-20-solid",
      color: "success",
    });
    emit("delete", props.transaction.id);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    toast.add({
      title: "Error",
      icon: "i-heroicons-exclamation-circle",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

const actions = [
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
      onSelect: deleteTransaction,
    },
  ],
];
</script>

<template>
  <!-- Container Utama:
       - Di HP: Menggunakan Flexbox biasa (flex justify-between) agar layout samping kiri-kanan nempel rapi.
       - Di Laptop: Menggunakan Grid 2 Kolom (sm:grid sm:grid-cols-2) agar lurus vertikal di tengah.
  -->
  <div
    class="border-b border-gray-100 dark:border-gray-800 py-3.5 mt-1 flex sm:grid sm:grid-cols-2 items-center justify-between sm:justify-stretch gap-4"
  >
    <!-- ======================================================== -->
    <!-- SISI KIRI (Kolom 1 di Desktop [50%], Flex-Row di Mobile) -->
    <!-- ======================================================== -->
    <div
      class="flex items-start sm:items-center justify-between min-w-0 flex-1 sm:flex-none"
    >
      <div class="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
        <!-- Ikon: Menempel di atas pada HP (items-start), di tengah pada Laptop (sm:items-center) -->
        <UIcon
          :name="icon"
          :class="[iconColor, 'shrink-0 mt-0.5 sm:mt-0 w-5 h-5']"
        />

        <div class="flex flex-col min-w-0">
          <!-- Deskripsi:
               - Di HP: Bisa patah baris (break-words).
               - Di Laptop: Dipotong jika sangat panjang agar rapi (sm:truncate sm:max-w-[180px] md:max-w-[240px]).
          -->
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

          <!-- Progress bar -->
          <div
            class="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2 max-w-50 sm:max-w-xs"
          >
            <div
              class="h-full rounded-full transition-all duration-300"
              :class="isIncome ? 'bg-green-500' : 'bg-red-500'"
              :style="{ width: `${percentOfTotal}%` }"
            ></div>
          </div>
          <!-- Badge Khusus HP (Muncul di bawah deskripsi) -->
          <div class="mt-1 block sm:hidden">
            <UBadge
              color="neutral"
              variant="outline"
              class="text-[9px] px-1.5 py-0.5 font-medium rounded-md"
            >
              {{ transaction.type === "income" ? "Pemasukan" : "Pengeluaran" }}
            </UBadge>
          </div>
        </div>
      </div>

      <!-- Badge Khusus Laptop: 
           - Muncul di paling kanan Kolom 1 (Sehingga berada pas di TENGAH-TENGAH BARIS [50% mark])
      -->
      <div class="hidden sm:block shrink-0 ml-4">
        <UBadge
          color="neutral"
          variant="outline"
          class="text-[10px] sm:text-xs px-2 py-0.5 font-medium rounded-md"
        >
          {{ transaction.type === "income" ? "Pemasukan" : "Pengeluaran" }}
        </UBadge>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- SISI KANAN (Kolom 2 di Desktop [50%], Flex-Row di Mobile) -->
    <!-- ======================================================== -->
    <div class="flex items-center justify-end space-x-2 shrink-0 sm:w-full">
      <div class="flex items-start text-right">
        <span
          class="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white"
        >
          {{ amount.main }}
        </span>
        <sup
          class="text-[0.65rem] sm:text-[0.75rem] font-bold ml-0.5 mt-0.5 sm:mt-1 opacity-70 text-gray-500 dark:text-gray-400"
        >
          {{ amount.fraction }}
        </sup>
      </div>

      <div>
        <UDropdownMenu
          :items="actions"
          :content="{ side: 'bottom', align: 'end' }"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="cursor-pointer duration-75"
            trailing-icon="i-heroicons-ellipsis-horizontal"
            :loading="isLoading"
          />
        </UDropdownMenu>
      </div>
    </div>
  </div>
</template>
