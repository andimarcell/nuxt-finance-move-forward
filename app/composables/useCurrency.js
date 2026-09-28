// app/composables/useCurrency.js (atau ditaruh di folder utils sesuai settingan lu)
import { computed, isRef } from "vue";

export const useCurrency = (amount) => {
  const currency = computed(() => {
    // 1. Format ke Rupiah tanpa desimal ,00 jika angka bulat
    const val = isRef(amount) ? amount.value : amount;
    const formatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(val || 0);

    // 2. Pecah string berdasarkan tanda koma jika ada desimal
    const parts = formatted.split(",");

    // 3. Return sebagai Object (fraction undefined jika tidak ada desimal)
    return {
      main: parts[0],
      fraction: parts[1] || null,
    };
  });

  return { currency };
};
