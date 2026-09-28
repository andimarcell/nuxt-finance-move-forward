// Sinyal refresh global antar komponen.
//
// Dipakai misalnya oleh tombol "Urungkan" pada toast setelah transaksi dihapus:
// saat tombol itu diklik, komponen barisnya sudah unmount, sehingga `emit` ke
// parent tidak lagi terkirim (Vue menghentikan emit pada instance yang sudah
// unmount). State dari useState tetap hidup, jadi sinyal ini aman dipakai.
export const useTransactionsRefresh = () => {
  const refreshToken = useState("transactions-refresh-token", () => 0);

  const requestRefresh = () => {
    refreshToken.value += 1;
  };

  return { refreshToken, requestRefresh };
};
