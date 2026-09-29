alter table public.patients
  add column if not exists rg text not null default '';
