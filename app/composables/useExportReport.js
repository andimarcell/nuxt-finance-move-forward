import XLSX from 'xlsx-js-style'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const useExportReport = () => {
  const toast = useToast()

  // Format Rupiah resmi untuk laporan
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(val || 0)
  }

  // 📊 1. EKSPOR KE EXCEL BERWARNA (.xlsx)
  const exportToExcel = (transactions, periodLabel, totals) => {
    try {
      if (!transactions || transactions.length === 0) {
        toast.add({
          title: 'Gagal',
          description: 'Tidak ada data transaksi untuk diekspor!',
          color: 'error',
          icon: 'i-heroicons-x-circle'
        })
        return
      }

      // Header Ringkasan Atas
      const summaryData = [
        ['FTRACKER - LAPORAN KEUANGAN RESMI'],
        [`PERIODE: ${periodLabel?.toUpperCase() || '-'}`],
        [`TANGGAL CETAK: ${new Date().toLocaleDateString('id-ID')}`],
        [],
        ['--- RINGKASAN SALDO ---'],
        ['Total Pemasukan', formatRupiah(totals?.incomeTotal)],
        ['Total Pengeluaran', formatRupiah(totals?.expenseTotal)],
        ['Sisa Saldo Kas', formatRupiah(totals?.balanceTotal)],
        [],
        ['--- DETAIL TRANSAKSI ---']
      ]

      // Header Tabel Data
      const tableHeader = [['Tanggal', 'Keterangan / Nama', 'Kategori', 'Tipe Transaksi', 'Nominal (IDR)']]

      // Isi Data Transaksi
      const tableRows = transactions.map((t) => [
        t.created_at ? t.created_at.split('T')[0] : '-',
        t.description || '-',
        t.category ? t.category.toUpperCase() : '-',
        t.type?.toLowerCase() === 'income' ? 'Pemasukan' : 'Pengeluaran',
        formatRupiah(t.amount)
      ])

      const fullData = [...summaryData, ...tableHeader, ...tableRows]

      // Buat Sheet Excel
      const worksheet = XLSX.utils.aoa_to_sheet(fullData)

      // 🟢 FITUR PEWARNAAN & STYLING EXCEL (MEWARNAI TABEL)
      const headerRowIndex = 10 // Baris Header Tabel
      const range = XLSX.utils.decode_range(worksheet['!ref'])

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
          if (!worksheet[cellAddress]) continue

          // 1. Warna Header Tabel (Hijau Emerald + Teks Putih Tebal)
          if (R === headerRowIndex) {
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: '10B981' } }, // Hijau Primary FTracker
              font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
              alignment: { vertical: 'center', horizontal: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: '059669' } },
                bottom: { style: 'medium', color: { rgb: '059669' } }
              }
            }
          }
          // 2. Warna Baris Data Transaksi (Baris Selang-Seling + Border Tipis)
          else if (R > headerRowIndex) {
            const isEven = R % 2 === 0
            worksheet[cellAddress].s = {
              fill: { fgColor: { rgb: isEven ? 'F8FAFC' : 'FFFFFF' } }, // Abu-abu muda selang-seling
              font: { name: 'Arial', sz: 10, color: { rgb: '0F172A' } },
              alignment: {
                vertical: 'center',
                horizontal: C === 4 ? 'right' : (C === 0 ? 'center' : 'left') // Nominal rata kanan, tanggal rata tengah
              },
              border: {
                top: { style: 'thin', color: { rgb: 'E2E8F0' } },
                bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
                left: { style: 'thin', color: { rgb: 'E2E8F0' } },
                right: { style: 'thin', color: { rgb: 'E2E8F0' } }
              }
            }
          }
          // 3. Warna Judul Atas
          else {
            if (R === 0) {
              worksheet[cellAddress].s = {
                font: { name: 'Arial', sz: 14, bold: true, color: { rgb: '0F172A' } }
              }
            } else if (R === 4 || R === 9) {
              worksheet[cellAddress].s = {
                font: { name: 'Arial', sz: 11, bold: true, color: { rgb: '10B981' } }
              }
            }
          }
        }
      }

      // Lebar Kolom Otomatis
      worksheet['!cols'] = [
        { wch: 15 }, // Tanggal
        { wch: 38 }, // Keterangan
        { wch: 36 }, // Kategori
        { wch: 18 }, // Tipe
        { wch: 22 }  // Nominal
      ]

      // Buat Workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan')

      const safeLabel = (periodLabel || 'Semua').replace(/\s+/g, '_')
      const fileName = `Laporan_Keuangan_${safeLabel}.xlsx`

      XLSX.writeFile(workbook, fileName)

      toast.add({
        title: 'Berhasil!',
        description: 'Berkas Laporan Excel Berwarna berhasil diunduh.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    } catch (error) {
      console.error('Error export excel:', error)
      toast.add({
        title: 'Gagal Ekspor',
        description: error.message,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
    }
  }

  // 📄 2. EKSPOR KE PDF LAPORAN RESMI (.pdf)
  const exportToPDF = (transactions, periodLabel, totals) => {
    try {
      if (!transactions || transactions.length === 0) {
        toast.add({
          title: 'Gagal',
          description: 'Tidak ada data transaksi untuk diekspor!',
          color: 'error',
          icon: 'i-heroicons-x-circle'
        })
        return
      }

      const doc = new jsPDF()

      // Header Laporan PDF
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(15, 23, 42)
      doc.text('FTracker - LAPORAN KEUANGAN', 14, 20)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100)
      doc.text(`Periode Laporan : ${periodLabel || '-'}`, 14, 27)
      doc.text(`Tanggal Dicetak : ${new Date().toLocaleDateString('id-ID')}`, 14, 32)

      // Garis Pembatas Header
      doc.setLineWidth(0.5)
      doc.setDrawColor(226, 232, 240)
      doc.line(14, 36, 196, 36)

      // Ringkasan Keuangan Box
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(15, 23, 42)
      doc.text('Ringkasan Kas Periode Ini:', 14, 44)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`• Total Pemasukan   : ${formatRupiah(totals?.incomeTotal)}`, 14, 51)
      doc.text(`• Total Pengeluaran : ${formatRupiah(totals?.expenseTotal)}`, 14, 57)
      doc.text(`• Sisa Saldo Kas     : ${formatRupiah(totals?.balanceTotal)}`, 14, 63)

      // Tabel Transaksi AutoTable PDF
      const headers = [['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Nominal']]
      const rows = transactions.map((t) => [
        t.created_at ? t.created_at.split('T')[0] : '-',
        t.description || '-',
        t.category ? t.category.toUpperCase() : '-',
        t.type?.toLowerCase() === 'income' ? 'Pemasukan' : 'Pengeluaran',
        formatRupiah(t.amount)
      ])

      autoTable(doc, {
        startY: 70,
        head: headers,
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: [16, 185, 129], // Warna Hijau Primary
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      })

      const safeLabel = (periodLabel || 'Semua').replace(/\s+/g, '_')
      const fileName = `Laporan_Keuangan_${safeLabel}.pdf`
      doc.save(fileName)

      toast.add({
        title: 'Berhasil!',
        description: 'Berkas Laporan PDF berhasil diunduh.',
        color: 'success',
        icon: 'i-heroicons-check-circle'
      })
    } catch (error) {
      console.error('Error export pdf:', error)
      toast.add({
        title: 'Gagal Ekspor',
        description: error.message,
        color: 'error',
        icon: 'i-heroicons-exclamation-circle'
      })
    }
  }

  return {
    exportToExcel,
    exportToPDF
  }
}