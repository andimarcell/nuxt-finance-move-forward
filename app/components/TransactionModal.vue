div
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
// Fungsi pembantu mengekstrak string murni dari objek Nuxt UI
const getCategoryValue = (cat) => {
  if (cat && typeof cat === "object") return cat.value;
  return cat;
};
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
      defaultCategories.map((d) => d.value).includes(originalCategory) &&
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
  category: z.any(), // Validasi kolom kategori // Mengizinkan string maupun objek agar tidak crash
  created_at: z.string().min(1, "Tanggal wajib diisi"),
});

// 2. TAMBAHKAN PARAMETER 'category' PADA STATE FORM
const state = reactive({
  description: "",
  amount: 0,
  type: "income",
  category: "", // State penampung kategori terpilih
  category_icon: "",
  created_at: format(new Date(), "yyyy-MM-dd"),
});

// Daftar pilihan kategori untuk diisi di dropdown UI
const defaultCategories = [
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
const customCategory = ref(""); // State untuk kategori kustom yang dimasukkan pengguna
const customCategories = ref([]); // State untuk kategori kustom yang diambil dari database

onMounted(() => {
  fetchUserCategories(); // Ambil kategori kustom sekali saja di awal saat halaman dimuat
});

const fetchUserCategories = async () => {
  if (!user.value) return;

  try {
    // Kueri Supabase: Ikut menarik kolom 'category_icon' dari database
    const { data, error } = await supabase
      .from("transactions")
      .select("category, category_icon"); // Tarik kedua kolom ini

    if (error) throw error;

    if (data) {
      const uniqueMap = {};

      data.forEach((t) => {
        const cat = t.category ? t.category.toLowerCase().trim() : "";
        if (
          cat &&
          !defaultCategories.map((d) => d.value).includes(cat) &&
          cat !== "lainnya"
        ) {
          // Petakan nama kategori dengan ikon aslinya dari DB (default: i-heroicons-tag)
          uniqueMap[cat] = t.category_icon || "i-heroicons-tag";
        }
      });

      // Masukkan ke customCategories sebagai array objek { name, icon }
      customCategories.value = Object.keys(uniqueMap).map((cat) => ({
        name: cat,
        icon: uniqueMap[cat],
      }));
    }
  } catch (err) {
    console.error("Gagal mengambil kategori pengguna:", err.message);
  }
};

const mergedCategories = computed(() => {
  // Petakan kategori kustom berdasarkan data objek kustom asli dari DB
  const mappedCustoms = customCategories.value.map((catObj) => ({
    label: catObj.name.charAt(0).toUpperCase() + catObj.name.slice(1),
    value: catObj.name,
    icon: catObj.icon, // Memakai ikon kustom asli dari DB objek
  }));
  // Satukan kategori default, kustom, dan pilihan lainnya
  return [
    ...defaultCategories,
    ...mappedCustoms,
    {
      label: "Lainnya",
      value: "lainnya",
      icon: "i-heroicons-ellipsis-horizontal",
    },
  ];
});

// Mengontrol kapan sisa kolom input lainnya boleh muncul di layar
const isCategoryFilled = computed(() => {
  // Jika ketegori belum dipilih sama sekali, jangan muncuulkan apa-apa
  if (!state.category) return false;
  // Jika pilih "lainnya", wajib ketik minimal 3 karakter (1 kata) baru boleh muncul kolom lain
  if (state.category === "lainnya") {
    return customCategory.value.trim().length >= 4;
  }
  // Jika memilih kategori default lainnya, langsung munculkan kolom lain
  return true;
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
    // Ekstraksi Aman: Ambil string value dari objek kategori Nuxt UI
    if (state.category && typeof state.category === "object") {
      payload.category = state.category.value;
    } else {
      payload.category = state.category;
    }

    // Jika memilih 'lainnya', gunakan ketikan kustom & simpan ikon kustom pilihan mereka
    if (payload.category === "lainnya" && customCategory.value) {
      payload.category = customCategory.value.toLowerCase().trim();
      payload.category_icon = customIcon.value; // SIMPAN IKON KUSTOM KE KOLOM BARU DATABASE
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

// Pilihan ikon-ikon indah yang bisa dipilih mandiri oleh pengguna
const iconOptions = [
  { label: "Tag", value: "i-heroicons-tag", icon: "i-heroicons-tag" },
  {
    label: "Tas",
    value: "i-heroicons-shopping-bag",
    icon: "i-heroicons-shopping-bag",
  },
  {
    label: "Makanan",
    value: "i-heroicons-sparkles",
    icon: "i-heroicons-sparkles",
  },
  { label: "Hati", value: "i-heroicons-heart", icon: "i-heroicons-heart" },
  {
    label: "Game",
    value: "i-heroicons-puzzle-piece",
    icon: "i-heroicons-puzzle-piece",
  },
  {
    label: "Roket",
    value: "i-heroicons-rocket-launch",
    icon: "i-heroicons-rocket-launch",
  },
];
const customIcon = ref("i-heroicons-tag"); // Ikon kustom default
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
        <UFormField label="Kategori" name="category">
          <USelectMenu
            v-model="state.category"
            :items="mergedCategories"
            value-attribute="value"
            option-attribute="label"
            placeholder="Pilih kategori transaksi..."
            class="w-full capitalize cursor-pointer"
            :ui="{
              trigger: 'capitalize',
              content:
                'w-[var(--radix-select-trigger-width)] min-w-[200px] capitalize',
            }"
          >
            <template #item="{ item }">
              <div class="flex items-center gap-2">
                <!-- Merender ikon dinamis di sebelah kiri teks kategori -->
                <UIcon
                  :name="item.icon"
                  class="w-4 h-4 shrink-0 text-gray-500 dark:text-gray-400"
                />
                <span>{{ item.label }}</span>
              </div>
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField
          v-if="getCategoryValue(state.category) === 'lainnya'"
          label="Nama Kategori Baru"
          required
        >
          <UInput
            v-model="customCategory"
            placeholder="Ketik nama kategori kustom baru Anda..."
            icon="i-heroicons-pencil-square"
            class="w-full"
          />
        </UFormField>

        <!-- PILIHAN IKON KUSTOM -->
        <UFormField
          v-if="getCategoryValue(state.category) === 'lainnya'"
          label="Pilih Ikon Kategori Baru"
          required
        >
          <!-- Tombol Bulat Row Interaktif murni menggunakan div -->
          <div class="flex items-center gap-3 mt-1.5 flex-wrap">
            <button
              v-for="opt in iconOptions"
              :key="opt.value"
              type="button"
              class="w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-150 cursor-pointer"
              :class="
                customIcon === opt.value
                  ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/50'
                  : 'border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
              "
              @click="customIcon = opt.value"
            >
              <UIcon
                :name="opt.icon"
                class="w-5 h-5 transition-colors duration-150"
                :class="
                  customIcon === opt.value
                    ? 'text-primary'
                    : 'text-gray-400 dark:text-gray-500'
                "
              />
            </button>
          </div>
        </UFormField>
        <div v-if="isCategoryFilled" class="space-y-4">
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

          <!-- Input Nominal -->
          <UFormField label="Nominal" name="amount">
            <UInput
              v-model.number="state.amount"
              type="number"
              class="w-full"
            />

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
              class="w-full cursor-pointer"
            />
          </UFormField>

          <!-- Input Tanggal -->
          <UFormField label="Tanggal" name="created_at">
            <UInput
              v-model="state.created_at"
              type="date"
              icon="i-heroicons-calendar-20-solid"
              class="w-full"
            />
          </UFormField>

          <!-- Tombol Simpan -->
          <div class="flex justify-between pt-4">
            <UButton
              type="submit"
              :label="isOverBudget ? 'Saldo Tidak Cukup' : 'Simpan Transaksi'"
              :disabled="isOverBudget"
              :color="isOverBudget ? 'red' : 'primary'"
              class="cursor-pointer"
            />
            <UButton
              variant="outline"
              @click="clearForm"
              class="cursor-pointer"
            >
              Bersihkan
            </UButton>
          </div>
        </div>
      </UForm>
    </template>
  </UModal>
</template>
