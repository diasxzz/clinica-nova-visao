-- Recepção e coordenador podem excluir pacientes e receitas da própria localidade.

CREATE POLICY patients_delete_reception
ON public.patients
FOR DELETE
TO authenticated
USING (
  private.is_admin()
  OR (
    private.staff_role() = 'reception'
    AND store_id = private.staff_store_id()
  )
);

CREATE POLICY prescriptions_delete_reception
ON public.prescriptions
FOR DELETE
TO authenticated
USING (
  private.is_admin()
  OR (
    private.staff_role() = 'reception'
    AND EXISTS (
      SELECT 1
      FROM public.patients p
      WHERE p.id = prescriptions.patient_id
        AND p.store_id = private.staff_store_id()
    )
  )
);
