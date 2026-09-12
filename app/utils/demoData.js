// app/utils/demoData.js
// Data sampel interaktif untuk mode demonstrasi FTracker

export const getDemoTransactions = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // Helper untuk membuat tanggal ISO di bulan berjalan
  const makeDate = (day, hour = 10, minute = 0) => {
    const d = new Date(year, month, Math.min(day, 28), hour, minute);
    return d.toISOString();
  };

  // Helper untuk membuat tanggal di bulan sebelumnya
  const makePrevDate = (day, hour = 11, minute = 30) => {
    const d = new Date(year, month - 1, Math.min(day, 28), hour, minute);
    return d.toISOString();
  };

  return [
    // Periode Bulan Berjalan
    {
      id: "demo-tx-1",
      amount: 4500000,
      type: "income",
      description: "Kas Warga RT 04 (Iuran Bulanan)",
      category: "kas warga",
      category_icon: "i-heroicons-user-group",
      created_at: makeDate(2, 9, 30),
    },
    {
      id: "demo-tx-2",
      amount: 1500000,
      type: "income",
      description: "Dana Donasi & Sponsor Komunitas",
      category: "donasi",
      category_icon: "i-heroicons-gift",
      created_at: makeDate(5, 14, 15),
    },
    {
      id: "demo-tx-3",
      amount: 850000,
      type: "expense",
      description: "Konsumsi & Perlengkapan Kerja Bakti",
      category: "konsumsi",
      category_icon: "i-heroicons-cake",
      created_at: makeDate(8, 16, 0),
    },
    {
      id: "demo-tx-4",
      amount: 600000,
      type: "expense",
      description: "Perbaikan Lampu Jalan Gang 3",
      category: "fasilitas",
      category_icon: "i-heroicons-wrench-screwdriver",
      created_at: makeDate(12, 11, 45),
    },
    {
      id: "demo-tx-5",
      amount: 350000,
      type: "expense",
      description: "Langganan WiFi Sekretariat",
      category: "bulanan",
      category_icon: "i-heroicons-wifi",
      created_at: makeDate(15, 10, 0),
    },
    {
      id: "demo-tx-6",
      amount: 2500000,
      type: "income",
      description: "Bantuan Hibah Lingkungan Kelurahan",
      category: "hibah",
      category_icon: "i-heroicons-banknotes",
      created_at: makeDate(18, 13, 20),
    },
    {
      id: "demo-tx-7",
      amount: 420000,
      type: "expense",
      description: "Cetak Banner Peringatan Kemerdekaan",
      category: "hiburan",
      category_icon: "i-heroicons-ticket",
      created_at: makeDate(20, 15, 30),
    },

    // Periode Bulan Sebelumnya (untuk kalkulasi delta tren akurat)
    {
      id: "demo-prev-1",
      amount: 4000000,
      type: "income",
      description: "Kas Warga RT 04 (Bulan Lalu)",
      category: "kas warga",
      category_icon: "i-heroicons-user-group",
      created_at: makePrevDate(3, 9, 0),
    },
    {
      id: "demo-prev-2",
      amount: 1200000,
      type: "income",
      description: "Dana Kas Sampah & Kebersihan",
      category: "kas warga",
      category_icon: "i-heroicons-user-group",
      created_at: makePrevDate(7, 10, 30),
    },
    {
      id: "demo-prev-3",
      amount: 1450000,
      type: "expense",
      description: "Honor Petugas Kebersihan & Jaga Malam",
      category: "operasional",
      category_icon: "i-heroicons-briefcase",
      created_at: makePrevDate(10, 14, 0),
    },
    {
      id: "demo-prev-4",
      amount: 750000,
      type: "expense",
      description: "Pengadaan Tempat Sampah Organik",
      category: "fasilitas",
      category_icon: "i-heroicons-trash",
      created_at: makePrevDate(17, 11, 15),
    },
  ];
};

let sharedDemoStore = null;

export const getSharedDemoStore = () => {
  if (!sharedDemoStore) {
    sharedDemoStore = getDemoTransactions();
  }
  return sharedDemoStore;
};

export const addDemoTransaction = (transaction) => {
  const store = getSharedDemoStore();
  const newTx = {
    ...transaction,
    id: `demo-tx-${Date.now()}`,
    created_at: transaction.created_at || new Date().toISOString(),
  };
  store.unshift(newTx);
  return newTx;
};

export const updateDemoTransaction = (id, payload) => {
  const store = getSharedDemoStore();
  const index = store.findIndex((t) => t.id === id);
  if (index !== -1) {
    store[index] = {
      ...store[index],
      ...payload,
    };
    return store[index];
  }
  return null;
};

export const deleteDemoTransaction = (id) => {
  const store = getSharedDemoStore();
  const index = store.findIndex((t) => t.id === id);
  if (index !== -1) {
    store.splice(index, 1);
    return true;
  }
  return false;
};

