import XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const useExportReport = () => {
  const toast = useToast();

  const formatRupiah = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  // FUNGSI PEMBANTU PINTAR: Dual-Role Matrix (Murni Kas Pemasukan untuk Member, Full untuk Admin)
  const buildMatrixData = (transactions, includeExcluded = false) => {
    const monthsMap = new Map();
    const rowsMap = new Map();

    // TAHAP 1: Deteksi Anggota Keluar (Hanya untuk Mode Member)
    const excludedMembers = new Set();
    if (!includeExcluded) {
      transactions.forEach((t) => {
        const desc = t.description ? t.description.toLowerCase() : "";
        const cat = t.category ? t.category.toLowerCase() : "";
        if (desc.includes("keluar") || cat.includes("keluar")) {
          const nameClean = t.description
            ? t.description
                .replace(/\(.*\)/gi, "")
                .replace(/keluar/gi, "")
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase()
            : "";
          if (nameClean) excludedMembers.add(nameClean);
        }
      });
    }

    // TAHAP 2: Buat Tabel Matriks
    transactions.forEach((t) => {
      if (!t.created_at) return;

      const desc = t.description ? t.description.toLowerCase() : "";
      const cat = t.category ? t.category.toLowerCase() : "";
      const type = t.type ? t.type.toLowerCase() : "";

      // ATURAN KHUSUS DOWNLOAD MEMBER (jika includeExcluded === false):
      if (!includeExcluded) {
        // 1. HARUS PEMASUKAN SAJA (Abaikan Pengeluaran seperti Hadiah, Bensin, Billing, dll)
        if (type !== "income") {
          return;
        }

        // 2. HARUS KAS ANGGOTA SAJA (Abaikan Talangan, Marketing, Operasional, dll)
        const isKasCategory =
          cat.includes("kas") ||
          cat.includes("iuran") ||
          cat.includes("lunas") ||
          cat.includes("tunggak") ||
          cat.includes("kurang");

        if (!isKasCategory) {
          return; // Abaikan transaksi non-kas!
        }
      }

      let nameStr = t.description ? t.description : "Tanpa Keterangan";

      if (!includeExcluded) {
        nameStr = nameStr
          .replace(/\(.*\)/gi, "")
          .replace(/keluar/gi, "")
          .replace(/\s+/g, " ")
          .trim();
      } else {
        nameStr = nameStr.trim();
      }

      if (!nameStr)
        nameStr = t.description ? t.description.trim() : "Tanpa Keterangan";

      const cleanKey = nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
      const checkKey = nameStr.toLowerCase();

      // JIKA MODE MEMBER DAN NAMA TERDAFTAR KELUAR -> ABAIKAN
      if (!includeExcluded && excludedMembers.has(checkKey)) {
        return;
      }

      const dateObj = new Date(t.created_at);
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = dateObj.toLocaleDateString("id-ID", {
        month: "short",
        year: "numeric",
      });

      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, monthLabel);
      }

      if (!rowsMap.has(cleanKey)) {
        rowsMap.set(cleanKey, {
          category: t.category ? t.category.toUpperCase() : "-",
          type:
            t.type?.toLowerCase() === "income" ? "Pemasukan" : "Pengeluaran",
          months: {},
        });
      }

      const rowData = rowsMap.get(cleanKey);
      rowData.months[monthKey] =
        (rowData.months[monthKey] || 0) + Number(t.amount);
    });

    const sortedMonthKeys = Array.from(monthsMap.keys()).sort();
    const monthHeaders = sortedMonthKeys.map((k) => monthsMap.get(k));

    return { sortedMonthKeys, monthHeaders, rowsMap };
  };

  // 📊 1. EXCEL DETAIL TRANSAKSI
  const exportToExcel = (transactions, periodLabel, totals) => {
    try {
      if (!transactions || transactions.length === 0) return;
      const summaryData = [
        ["FTRACKER - LAPORAN KEUANGAN RESMI"],
        [`PERIODE: ${periodLabel?.toUpperCase() || "-"}`],
        [`TANGGAL CETAK: ${new Date().toLocaleDateString("id-ID")}`],
        [],
        ["--- RINGKASAN SALDO ---"],
        ["Total Pemasukan", formatRupiah(totals?.incomeTotal)],
        ["Total Pengeluaran", formatRupiah(totals?.expenseTotal)],
        ["Sisa Saldo Kas", formatRupiah(totals?.balanceTotal)],
        [],
        ["--- DETAIL TRANSAKSI ---"],
      ];
      const tableHeader = [
        [
          "Tanggal",
          "Keterangan / Nama",
          "Kategori",
          "Tipe Transaksi",
          "Nominal (IDR)",
        ],
      ];
      const tableRows = transactions.map((t) => [
        t.created_at ? t.created_at.split("T")[0] : "-",
        t.description || "-",
        t.category ? t.category.toUpperCase() : "-",
        t.type?.toLowerCase() === "income" ? "Pemasukan" : "Pengeluaran",
        formatRupiah(t.amount),
      ]);

      const worksheet = XLSX.utils.aoa_to_sheet([
        ...summaryData,
        ...tableHeader,
        ...tableRows,
      ]);
      const headerRowIndex = 10;
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) continue;
          if (R === headerRowIndex) {
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: "10B981" } },
              font: {
                name: "Arial",
                sz: 11,
                bold: true,
                color: { rgb: "FFFFFF" },
              },
              alignment: { vertical: "center", horizontal: "center" },
            };
          } else if (R > headerRowIndex) {
            const isEven = R % 2 === 0;
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: isEven ? "F8FAFC" : "FFFFFF" } },
              font: { name: "Arial", sz: 10, color: { rgb: "0F172A" } },
              alignment: {
                vertical: "center",
                horizontal: C === 4 ? "right" : C === 0 ? "center" : "left",
              },
              border: {
                top: { style: "thin", color: { rgb: "E2E8F0" } },
                bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                left: { style: "thin", color: { rgb: "E2E8F0" } },
                right: { style: "thin", color: { rgb: "E2E8F0" } },
              },
            };
          }
        }
      }
      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 38 },
        { wch: 22 },
        { wch: 18 },
        { wch: 22 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Detail Transaksi");
      XLSX.writeFile(
        workbook,
        `Laporan_Detail_${(periodLabel || "Semua").replace(/\s+/g, "_")}.xlsx`,
      );
      toast.add({
        title: "Berhasil!",
        description: "Excel Detail diunduh.",
        color: "success",
      });
    } catch (e) {
      toast.add({ title: "Gagal", description: e.message, color: "error" });
    }
  };

  // 📄 2. PDF DETAIL TRANSAKSI
  const exportToPDF = (transactions, periodLabel, totals) => {
    try {
      if (!transactions || transactions.length === 0) return;
      const doc = new jsPDF();
      doc
        .setFont("helvetica", "bold")
        .setFontSize(18)
        .setTextColor(15, 23, 42)
        .text("FTracker - LAPORAN KEUANGAN", 14, 20);
      doc.setFontSize(10).setFont("helvetica", "normal").setTextColor(100);
      doc.text(`Periode : ${periodLabel || "-"}`, 14, 27);
      doc.text(`Dicetak : ${new Date().toLocaleDateString("id-ID")}`, 14, 32);
      doc.setLineWidth(0.5).setDrawColor(226, 232, 240).line(14, 36, 196, 36);
      doc
        .setFont("helvetica", "bold")
        .setFontSize(11)
        .setTextColor(15, 23, 42)
        .text("Ringkasan Kas Periode Ini:", 14, 44);
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(
        `• Total Pemasukan   : ${formatRupiah(totals?.incomeTotal)}`,
        14,
        51,
      );
      doc.text(
        `• Total Pengeluaran : ${formatRupiah(totals?.expenseTotal)}`,
        14,
        57,
      );
      doc.text(
        `• Sisa Saldo Kas     : ${formatRupiah(totals?.balanceTotal)}`,
        14,
        63,
      );

      const headers = [
        ["Tanggal", "Keterangan", "Kategori", "Tipe", "Nominal"],
      ];
      const rows = transactions.map((t) => [
        t.created_at ? t.created_at.split("T")[0] : "-",
        t.description || "-",
        t.category ? t.category.toUpperCase() : "-",
        t.type?.toLowerCase() === "income" ? "Pemasukan" : "Pengeluaran",
        formatRupiah(t.amount),
      ]);

      autoTable(doc, {
        startY: 70,
        head: headers,
        body: rows,
        theme: "striped",
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
      });
      doc.save(
        `Laporan_Detail_${(periodLabel || "Semua").replace(/\s+/g, "_")}.pdf`,
      );
      toast.add({
        title: "Berhasil!",
        description: "PDF Detail diunduh.",
        color: "success",
      });
    } catch (e) {
      toast.add({ title: "Gagal", description: e.message, color: "error" });
    }
  };

  //  EXCEL REKAPITULASI MATRIKS (Menerima parameter includeExcluded)
  const exportToMatrixExcel = (
    transactions,
    periodLabel,
    includeExcluded = false,
  ) => {
    try {
      if (!transactions || transactions.length === 0) return;
      const { sortedMonthKeys, monthHeaders, rowsMap } = buildMatrixData(
        transactions,
        includeExcluded,
      );

      const summaryData = [
        ["REKAPITULASI PEMBAYARAN KAS ANGGOTA (MATRIKS)"],
        [`PERIODE LAPORAN: ${periodLabel?.toUpperCase() || "-"}`],
        [`TANGGAL CETAK: ${new Date().toLocaleDateString("id-ID")}`],
        [],
        ["--- REKAPITULASI SAMPING-BERDAMPINGAN (SIDE-BY-SIDE) ---"],
      ];

      const tableHeader = [
        [
          "No",
          "Nama Anggota / Keterangan",
          "Kategori Terakhir",
          "Tipe",
          ...monthHeaders,
          "Total Kumulatif",
        ],
      ];

      // URUTKAN NAMA ANGGOTA SESUAI ABJAD (A ke Z)
      const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) =>
        a.localeCompare(b, "id", { sensitivity: "base" }),
      );

      let no = 1;
      const tableRows = [];
      sortedRowKeys.forEach((rowKey) => {
        const data = rowsMap.get(rowKey);
        let rowTotal = 0;
        const monthCells = sortedMonthKeys.map((mKey) => {
          const amt = data.months[mKey] || 0;
          rowTotal += amt;
          return amt > 0 ? formatRupiah(amt) : "-";
        });

        tableRows.push([
          no++,
          rowKey,
          data.category,
          data.type,
          ...monthCells,
          formatRupiah(rowTotal),
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet([
        ...summaryData,
        ...tableHeader,
        ...tableRows,
      ]);
      const headerRowIndex = 5;
      const range = XLSX.utils.decode_range(worksheet["!ref"]);

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) continue;

          if (R === headerRowIndex) {
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: "1E3A8A" } },
              font: {
                name: "Arial",
                sz: 11,
                bold: true,
                color: { rgb: "FFFFFF" },
              },
              alignment: { vertical: "center", horizontal: "center" },
            };
          } else if (R > headerRowIndex) {
            const isEven = R % 2 === 0;
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: isEven ? "F1F5F9" : "FFFFFF" } },
              font: { name: "Arial", sz: 10, color: { rgb: "0F172A" } },
              alignment: {
                vertical: "center",
                horizontal: C >= 4 ? "center" : C === 0 ? "center" : "left",
              },
              border: {
                top: { style: "thin", color: { rgb: "CBD5E1" } },
                bottom: { style: "thin", color: { rgb: "CBD5E1" } },
                left: { style: "thin", color: { rgb: "CBD5E1" } },
                right: { style: "thin", color: { rgb: "CBD5E1" } },
              },
            };
          }
        }
      }

      worksheet["!cols"] = [
        { wch: 6 }, // No
        { wch: 30 }, // Nama Anggota (Bersih)
        { wch: 20 }, // Kategori
        { wch: 15 }, // Tipe
        ...monthHeaders.map(() => ({ wch: 18 })), // Kolom Bulan
        { wch: 22 }, // Total
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Rekapitulasi Matriks");
      XLSX.writeFile(
        workbook,
        `Rekapitulasi_Matriks_Kas_${(periodLabel || "Semua").replace(/\s+/g, "_")}.xlsx`,
      );
      toast.add({
        title: "Berhasil!",
        description: "Excel Matriks Nama Kegabung berhasil diunduh.",
        color: "success",
      });
    } catch (e) {
      toast.add({ title: "Gagal", description: e.message, color: "error" });
    }
  };

  // PDF REKAPITULASI MATRIKS (Menerima parameter includeExcluded)
  const exportToMatrixPDF = (
    transactions,
    periodLabel,
    includeExcluded = false,
  ) => {
    try {
      if (!transactions || transactions.length === 0) return;
      const { sortedMonthKeys, monthHeaders, rowsMap } = buildMatrixData(
        transactions,
        includeExcluded,
      );

      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(15, 23, 42);
      doc.text("FTracker - REKAPITULASI MATRIKS PEMBAYARAN KAS", 14, 18);
      doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
      doc.text(
        `Periode: ${periodLabel || "-"} | Dicetak: ${new Date().toLocaleDateString("id-ID")}`,
        14,
        24,
      );
      doc.setLineWidth(0.5).setDrawColor(226, 232, 240).line(14, 28, 283, 28);

      const headers = [
        [
          "No",
          "Nama Anggota / Keterangan",
          "Kategori Terakhir",
          ...monthHeaders,
          "Total",
        ],
      ];
      // URUTKAN NAMA ANGGOTA SESUAI ABJAD (A ke Z) UNTUK PDF
      const sortedRowKeys = Array.from(rowsMap.keys()).sort((a, b) =>
        a.localeCompare(b, "id", { sensitivity: "base" }),
      );

      let no = 1;
      const rows = [];
      sortedRowKeys.forEach((rowKey) => {
        const data = rowsMap.get(rowKey);
        let rowTotal = 0;
        const monthCells = sortedMonthKeys.map((mKey) => {
          const amt = data.months[mKey] || 0;
          rowTotal += amt;
          return amt > 0 ? formatRupiah(amt) : "-";
        });

        rows.push([
          no++,
          rowKey,
          data.category,
          ...monthCells,
          formatRupiah(rowTotal),
        ]);
      });

      autoTable(doc, {
        startY: 32,
        head: headers,
        body: rows,
        theme: "grid",
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: { fontSize: 8, cellPadding: 2.5, halign: "center" },
        columnStyles: { 1: { halign: "left" }, 2: { halign: "left" } },
      });

      doc.save(
        `Rekapitulasi_Matriks_Kas_${(periodLabel || "Semua").replace(/\s+/g, "_")}.pdf`,
      );
      toast.add({
        title: "Berhasil!",
        description: "PDF Matriks Nama Kegabung berhasil diunduh.",
        color: "success",
      });
    } catch (e) {
      toast.add({ title: "Gagal", description: e.message, color: "error" });
    }
  };

  return {
    exportToExcel,
    exportToPDF,
    exportToMatrixExcel,
    exportToMatrixPDF,
  };
};
