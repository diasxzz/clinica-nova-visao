-- Equipe autenticada pode atualizar pacientes da própria localidade (coordenador em todas).

create policy patients_update_staff
on public.patients
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
