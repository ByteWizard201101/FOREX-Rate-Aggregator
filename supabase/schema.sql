-- Banks table
create table if not exists public.banks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pdf_page_url text not null,
  created_at timestamp default now()
);

-- Daily rates table
create table if not exists public.rates (
  id bigint generated always as identity primary key,
  bank_id uuid references public.banks(id) on delete cascade,
  rate_date date not null,
  eur_rate numeric(12,4) not null,
  fetched_at timestamp default now(),
  constraint uniq_rate unique (bank_id, rate_date)
); 