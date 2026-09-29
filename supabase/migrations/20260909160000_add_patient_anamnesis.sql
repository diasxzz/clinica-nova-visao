alter table public.patients
  add column if not exists anamnesis jsonb not null default '{}'::jsonb;
