-- 0011: mensaje personalizado de la invitación (E-06 y E-16).
-- BORRADOR para la base de pruebas. Si es null, la invitación es "General".
-- Es un pedido al núcleo: columna nueva en contact_details.

alter table public.contact_details
  add column if not exists invite_message text
  check (invite_message is null or char_length(invite_message) <= 300);

notify pgrst, 'reload schema';
