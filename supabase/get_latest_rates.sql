-- Returns: bank_id, bank_name, eur_rate, previous_rate, trend (array of last 7 rates)
create or replace function public.get_latest_rates()
returns table (
  bank_id uuid,
  bank_name text,
  eur_rate numeric(12,4),
  previous_rate numeric(12,4),
  trend numeric(12,4)[]
) as $$
begin
  return query
    select
      b.id as bank_id,
      b.name as bank_name,
      r.eur_rate,
      (
        select r2.eur_rate from public.rates r2
        where r2.bank_id = b.id and r2.rate_date < r.rate_date
        order by r2.rate_date desc limit 1
      ) as previous_rate,
      (
        select array_agg(r3.eur_rate order by r3.rate_date desc)
        from (
          select r3.eur_rate
          from public.rates r3
          where r3.bank_id = b.id
          order by r3.rate_date desc
          limit 7
        ) r3
      ) as trend
    from public.banks b
    join lateral (
      select * from public.rates r1
      where r1.bank_id = b.id
      order by r1.rate_date desc
      limit 1
    ) r on true;
end;
$$ language plpgsql security definer; 