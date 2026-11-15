-- Run once in the Supabase SQL editor AFTER deploying the export-expenses function
-- and setting its EXPORT_CRON_SECRET (see CLAUDE.md "Daily CSV export").
-- Replace <SECRET> with the same random string in both places.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Private bucket for the CSVs.
insert into storage.buckets (id, name, public)
values ('expense-exports', 'expense-exports', false)
on conflict (id) do nothing;

-- Keep the secret out of cron.job's command text.
select vault.create_secret('<SECRET>', 'export_cron_secret');

-- 16:59 UTC = 23:59 Vietnam (UTC+7), on 19-26 November. pg_cron has no year field,
-- so this would repeat every November; the function itself only acts inside the 2026
-- window, and the job should be removed after the trip (unschedule below).
select cron.schedule(
  'export-expenses-daily',
  '59 16 19-26 11 *',
  $$
  select net.http_post(
    url := 'https://jysgnkufiqafkmayhnog.supabase.co/functions/v1/export-expenses',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'export_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- After the trip:
-- select cron.unschedule('export-expenses-daily');
