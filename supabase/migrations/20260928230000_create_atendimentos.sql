create table if not exists public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  store_id integer not null,
  data date not null default current_date,
  status text not null default 'aguardando'
    check (status in ('aguardando', 'em_atendimento', 'exame_concluido', 'finalizado')),
  chegada_em timestamptz not null default now(),
  atendimento_iniciado_em timestamptz,
  exame_concluido_em timestamptz,
  finalizado_em timestamptz,
  prescription_id uuid references public.prescriptions (id) on delete set null,
  profissional_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists atendimentos_patient_day_open_unique
  on public.atendimentos (patient_id, data)
  where status <> 'finalizado';

create index if not exists atendimentos_data_store_status_idx
  on public.atendimentos (data, store_id, status);

create index if not exists atendimentos_chegada_em_idx
  on public.atendimentos (chegada_em);

alter table public.prescriptions
  add column if not exists atendimento_id uuid references public.atendimentos (id) on delete set null;

create or replace function public.set_atendimentos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists atendimentos_set_updated_at on public.atendimentos;

create trigger atendimentos_set_updated_at
before update on public.atendimentos
for each row
execute function public.set_atendimentos_updated_at();

alter table public.atendimentos enable row level security;

create policy atendimentos_select_staff
on public.atendimentos
for select
to authenticated
using (
  private.is_admin()
  or store_id = private.staff_store_id()
);

create policy atendimentos_insert_staff
on public.atendimentos
for insert
to authenticated
with check (
  private.is_admin()
  or store_id = private.staff_store_id()
);

create policy atendimentos_update_staff
on public.atendimentos
for update
to authenticated
using (
  private.is_admin()
  or store_id = private.staff_store_id()
)
with check (
  private.is_admin()
  or store_id = private.staff_store_id()
);
