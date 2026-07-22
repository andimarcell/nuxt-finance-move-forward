<script setup>
import { format } from "date-fns";
import {
  useTemplateRef,
  reactive,
  computed,
  watch,
  ref,
  nextTick,
  onMounted,
} from "vue";
import { z } from "zod";
import { transactionTypes } from "~/utils/constants";

const formRef = useTemplateRef("form");
const textareaRef = ref(null);

const props = defineProps({
  modelValue: Boolean,
  transaction: Object,
  currentBalance: {
    type: Number,
    default: 0,
  },
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();
const isLoading = ref(false);

const emit = defineEmits(["update:modelValue", "saved"]);

const isModalOpen = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  },
});

const isEditing = computed(() => !!props.transaction);

const autoResize = () => {
  const el = textareaRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
};

const availableBalance = computed(() => {
  let available = props.currentBalance;

  if (isEditing.value && props.transaction?.type?.toLowerCase() === "expense") {
    available += props.transaction.amount;
  }
  return available;
});

const isOverBudget = computed(() => {
  if (state.type !== "expense") return false;
  return state.amount > availableBalance.value;
});

const formattedAvailableBalance = computed(() => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(availableBalance.value);
});

const fillForm = () => {
  if (props.transaction) {
    state.description = props.transaction.description;
    state.amount = props.transaction.amount;
    state.type = props.transaction.type.toLowerCase();
    state.created_at = props.transaction.created_at.split("T")[0];
    const originalCategory = props.transaction.category?.toLowerCase() || "";
    if (
      mergedCategories.value.includes(originalCategory) &&
      originalCategory !== "lainnya"
    ) {
      state.category = originalCategory;
      customCategory.value = originalCategory; // Simpan kategori asli jika valid
    } else {
      state.category = "lainnya"; // Set ke "lainnya" jika kategori tidak valid
      customCategory.value = originalCategory; // Simpan kategori kustom yang dimasukkan pengguna
    }
  } else {
    clearForm();
  }
};

watch(isModalOpen, (val) => {
  if (val) {
    fillForm();
    nextTick(() => {
      autoResize();
    });
  }
});

const clearForm = () => {
  formRef.value?.clear();
  state.description = "";
  state.amount = 0;
  state.type = "income";
  state.category = ""; // BERSIHKAN KATEGORI
  customCategory.value = ""; // BERSIHKAN KATEGORI KUSTOM
  state.created_at = format(new Date(), "yyyy-MM-dd");

  nextTick(() => {
    autoResize();
  });
};

// 1. TAMBAHKAN VALIDASI 'category' PADA SKEMA ZOD
const schema = z.object({
  description: z.string().min(1, "Keterangan wajib diisi"),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Kategori wajib dipilih"), // Validasi kolom kategori
  created_at: z.string().min(1, "Tanggal wajib diisi"),
});

// 2. TAMBAHKAN PARAMETER 'category' PADA STATE FORM
const state = reactive({
  description: "",
  amount: 0,
  type: "income",
  category: "", // State penampung kategori terpilih
  created_at: format(new Date(), "yyyy-MM-dd"),
});

// Daftar pilihan kategori untuk diisi di dropdown UI
const defaultCategories = [
  "gaji",
  "bonus",
  "transportasi",
  "hiburan",
  "pendidikan",
  "bulanan",
];
const customCategory = ref(""); // State untuk kategori kustom yang dimasukkan pengguna
const customCategories = ref([]); // State untuk kategori kustom yang diambil dari database

onMounted(() => {
  fetchUserCategories(); // Ambil kategori kustom sekali saja di awal saat halaman dimuat
});

const fetchUserCategories = async () => {
  if (!user.value) return;

  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("category");

    if (error) throw error;

    if (data) {
      const uniqueCategories = [
        ...new Set(
          data
            .map((t) => (t.category ? t.category.toLowerCase().trim() : ""))
            .filter(
              (cat) =>
                cat !== "" &&
                !defaultCategories.includes(cat) &&
                cat !== "lainnya",
            ),
        ),
      ];
      customCategories.value = uniqueCategories;
    }
  } catch (err) {
    console.error("Gagal mengambil kategori pengguna:", err.message);
  }
};

const mergedCategories = computed(() => {
  const combined = [...defaultCategories, ...customCategories.value];
  return [...new Set(combined), "lainnya"];
});

async function onSubmit(event) {
  if (isOverBudget.value) return;

  if (state.category === "lainnya" && !customCategory.value.trim()) {
    return toast.add({
      title: "Gagal",
      description: "Silahkan ketik nama kategori kustom Anda!",
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  }

  isLoading.value = true;
  try {
    let error;

    const payload = { ...state };
    if (state.category === "lainnya" && customCategory.value) {
      payload.category = customCategory.value.toLowerCase().trim(); // Gunakan kategori kustom yang dimasukkan pengguna
    }

    if (isEditing.value) {
      const { error: editError } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", props.transaction.id);
      error = editError;
    } else {
      const { error: insertError } = await supabase
        .from("transactions")
        .insert([payload]);
      error = insertError;
    }
    if (error) throw error;
    await fetchUserCategories();
    toast.add({
      title: "Sukses",
      description: isEditing.value
        ? "Transaksi berhasil diperbarui!"
        : "Transaksi berhasil ditambahkan!",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    isModalOpen.value = false;
    emit("saved");
  } catch (e) {
    toast.add({
      title: "Error",
      description: e.message,
      color: "error",
      icon: "i-heroicons-x-circle",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <UModal
    scrollable
    v-model:open="isModalOpen"
    title="Formulir Transaksi"
    :dismissible="false"
    :close="{ color: 'neutral', variant: 'ghost', class: 'cursor-pointer' }"
  >
    <template #body>
      <!-- <TransactionForm @submit="isModalOpen = false" />  -->
      <UForm
        ref="formRef"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
        class="space-y-4"
      >
        <UFormField label="Keterangan" name="description" v-slot="{ error }">
          <textarea
            ref="textareaRef"
            v-model="state.description"
            placeholder="Masukkan keterangan..."
            rows="1"
            @input="autoResize"
            :class="[
              'relative block w-full resize-none overflow-hidden focus:outline-none rounded-md placeholder-gray-400 dark:placeholder-gray-500 text-sm px-3 py-2 border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-150',
              error
                ? 'ring-1 ring-red-400 dark:ring-red-400 border-red-400 dark:border-red-400'
                : 'focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-400 border-gray-300 dark:border-gray-700',
            ]"
          ></textarea>
        </UFormField>

        <UFormField label="Nominal" name="amount">
          <UInput v-model.number="state.amount" type="number" />

          <div
            v-if="isOverBudget"
            class="flex items-start gap-1 mt-2 text-red-500 dark:text-red-400 text-sm font-medium"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="w-5 h-5 shrink-0"
            />
            <p>
              Saldo tidak mencukupi! Sisa saldo yang bisa Anda gunakan hanya
              <strong>{{ formattedAvailableBalance }}</strong>
            </p>
          </div>
        </UFormField>

        <UFormField label="Jenis Transaksi" name="type">
          <USelect
            v-model="state.type"
            :items="transactionTypes"
            option-attribute="label"
            value-attribute="value"
          />
        </UFormField>

        <!-- 3. TAMBAHKAN KOLOM INPUT PILIHAN KATEGORI DI TEMPLATE -->
        <UFormField label="Kategori" name="category">
          <USelectMenu
            v-model="state.category"
            :items="mergedCategories"
            placeholder="Pilih kategori transaksi..."
            class="w-[35%] capitalize cursor-pointer"
            :ui="{
              trigger: 'capitalize',
              content: 'w-[var(--radix-select-trigger-width)] min-w-[200px] capitalize'
            }"
          />
        </UFormField>

        <UFormField
          v-if="state.category === 'lainnya'"
          label="Nama Kategori Baru"
          required
        >
          <UInput
            v-model="customCategory"
            placeholder="Ketik nama kategori kustom baru Anda..."
            icon="i-heroicons-pencil-square"
          />
        </UFormField>

        <UFormField label="Tanggal" name="created_at">
          <UInput
            v-model="state.created_at"
            type="date"
            icon="i-heroicons-calendar-20-solid"
          />
        </UFormField>

        <div class="flex justify-between pt-4">
          <UButton
            type="submit"
            :label="isOverBudget ? 'Saldo Tidak Cukup' : 'Simpan Transaksi'"
            :disabled="isOverBudget"
            :color="isOverBudget ? 'red' : 'primary'"
            class="cursor-pointer"
          />
          <UButton variant="outline" @click="clearForm" class="cursor-pointer">
            Bersihkan
          </UButton>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
