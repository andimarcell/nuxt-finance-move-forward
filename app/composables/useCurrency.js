// app/composables/useCurrency.js (atau ditaruh di folder utils sesuai settingan lu)
import { computed, isRef } from "vue";

export const useCurrency = (amount) => {
  const currency = computed(() => {
    // Format ke Rupiah tanpa desimal (Rupiah tidak menggunakan sen)
    const val = isRef(amount) ? amount.value : amount;
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(val || 0));

    const parts = formatted.split(",");

    return {
      main: parts[0],
      fraction: parts[1] || null,
    };
  });

  return { currency };
};
