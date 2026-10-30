-- Ringkasan saldo dihitung di database, bukan di browser.
--
-- Sebelumnya app/composables/useFetchTransactions.js mengunduh SELURUH riwayat
-- transaksi (kolom amount & type) lalu menjumlahkannya di sisi klien. Selain
-- boros bandwidth, Supabase/PostgREST memotong hasil di 1000 baris sehingga
-- Total Saldo bisa salah tanpa peringatan begitu riwayat melewati 1000 baris.
--
-- Fungsi ini menjawab persoalan tersebut: agregasi dilakukan di Postgres dan
-- hanya mengembalikan satu baris angka.
--
-- Cara memasang (pilih salah satu):
--   1. Supabase Dashboard -> SQL Editor -> tempel isi file ini -> Run
--   2. supabase db push   (bila memakai Supabase CLI)
--
-- Catatan: `security invoker` membuat RLS tetap berlaku, jadi fungsi ini hanya
-- menjumlahkan baris transaksi milik user yang sedang login.

create or replace function public.get_balance_summary(end_date timestamptz default now())
returns table (
  balance numeric,
  income_total numeric,
  expense_total numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(
      sum(
        case
          when lower(type) = 'income' then amount
          when lower(type) = 'expense' then -amount
          else 0
        end
      ),
      0
    )::numeric as balance,
    coalesce(
      sum(case when lower(type) = 'income' then amount else 0 end),
      0
    )::numeric as income_total,
    coalesce(
      sum(case when lower(type) = 'expense' then amount else 0 end),
      0
    )::numeric as expense_total
  from public.transactions
  where created_at <= end_date;
$$;

comment on function public.get_balance_summary(timestamptz) is
  'Total saldo kumulatif, pemasukan, dan pengeluaran sampai end_date untuk user yang sedang login.';

grant execute on function public.get_balance_summary(timestamptz) to authenticated;
