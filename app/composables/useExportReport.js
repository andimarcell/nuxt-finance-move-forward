import * as XLSX from 'xlsx'
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

  // 📊 1. EKSPOR KE EXCEL (.xlsx)
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
        formatRupiah(t.amount) // Formatted Rupiah
      ])

      const fullData = [...summaryData, ...tableHeader, ...tableRows]

      // Buat Sheet Excel
      const worksheet = XLSX.utils.aoa_to_sheet(fullData)

      // 🟢 FITUR BARU: AUTO LEBAR KOLOM (Mencegah Teks Terpotong di Excel)
      worksheet['!cols'] = [
        { wch: 15 }, // Kolom Tanggal
        { wch: 35 }, // Kolom Keterangan (Dilebarkan agar nama orang muat utuh)
        { wch: 20 }, // Kolom Kategori
        { wch: 18 }, // Kolom Tipe
        { wch: 20 }  // Kolom Nominal
      ]

      // Buat Workbook Excel
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan')

      const safeLabel = (periodLabel || 'Semua').replace(/\s+/g, '_')
      const fileName = `Laporan_Keuangan_${safeLabel}.xlsx`

      XLSX.writeFile(workbook, fileName)

      toast.add({
        title: 'Berhasil!',
        description: 'Berkas Laporan Excel berhasil diunduh.',
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