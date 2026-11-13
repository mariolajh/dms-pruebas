-- 0010: datos extra del flujo de quien emite. RLS activado.
-- BORRADOR reconstruido a partir de NOTA_DISENADOR.md (el archivo oficial del núcleo no está en el repo).
-- Sirve para la base de pruebas. Cuando el núcleo suba su 0010, usar esa y descartar esta.
--
--   notice_extras   mensaje y días elegidos de un aviso
--   notice_steps    pasos a seguir de un aviso (R6)
--   contact_details relación con el contacto y cuándo salió la invitación
--   get_alert_steps función para que quien recibe la alerta lea los pasos con su token

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

create table if not exists public.notice_extras (
  notice_id uuid primary key references public.notices (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  message text check (message is null or char_length(message) <= 300),
  -- 0 = domingo ... 6 = sábado. Solo con recurrence = 'weekly' (lo vigila el trigger).
  weekdays smallint[] check (weekdays is null or weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  updated_at timestamptz not null default now()
);

create table if not exists public.notice_steps (
  notice_id uuid not null references public.notices (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  position smallint not null check (position between 1 and 10),
  body text not null check (char_length(body) between 1 and 200),
  primary key (notice_id, position)
);

create index if not exists notice_steps_issuer_idx on public.notice_steps (issuer_id);

create table if not exists public.contact_details (
  contact_id uuid primary key references public.contacts (id) on delete cascade,
  issuer_id uuid not null references public.profiles (id) on delete cascade,
  relationship text check (relationship is null or char_length(relationship) <= 40),
  -- Solo se rellena cuando el correo salió de verdad.
  invite_sent_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists contact_details_issuer_idx on public.contact_details (issuer_id);

-- ---------------------------------------------------------------------------
-- Triggers: el aviso o el contacto tienen que ser de quien emite
-- ---------------------------------------------------------------------------

create or replace function public.check_notice_owner()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.notices n
    where n.id = new.notice_id and n.issuer_id = new.issuer_id
  ) then
    raise exception 'El aviso no pertenece a este usuario';
  end if;
  return new;
end;
$$;

-- Los días solo tienen sentido en avisos semanales (solo para notice_extras).
create or replace function public.check_extras_weekdays()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.weekdays is not null and cardinality(new.weekdays) > 0 and
     (select n.recurrence from public.notices n where n.id = new.notice_id) <> 'weekly' then
    raise exception 'Los días solo se guardan en avisos semanales';
  end if;
  return new;
end;
$$;

drop trigger if exists notice_extras_weekdays on public.notice_extras;
create trigger notice_extras_weekdays
  before insert or update on public.notice_extras
  for each row execute function public.check_extras_weekdays();

create or replace function public.check_contact_owner()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.contacts c
    where c.id = new.contact_id and c.issuer_id = new.issuer_id
  ) then
    raise exception 'El contacto no pertenece a este usuario';
  end if;
  return new;
end;
$$;

drop trigger if exists notice_extras_owner on public.notice_extras;
create trigger notice_extras_owner
  before insert or update on public.notice_extras
  for each row execute function public.check_notice_owner();

drop trigger if exists notice_steps_owner on public.notice_steps;
create trigger notice_steps_owner
  before insert or update on public.notice_steps
  for each row execute function public.check_notice_owner();

drop trigger if exists contact_details_owner on public.contact_details;
create trigger contact_details_owner
  before insert or update on public.contact_details
  for each row execute function public.check_contact_owner();

-- ---------------------------------------------------------------------------
-- RLS: cada persona solo toca lo suyo
-- ---------------------------------------------------------------------------

alter table public.notice_extras enable row level security;
alter table public.notice_steps enable row level security;
alter table public.contact_details enable row level security;

create policy "notice_extras_own" on public.notice_extras
  for all using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);

create policy "notice_steps_own" on public.notice_steps
  for all using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);

create policy "contact_details_own" on public.contact_details
  for all using (auth.uid() = issuer_id) with check (auth.uid() = issuer_id);

-- ---------------------------------------------------------------------------
-- Pasos para quien recibe la alerta (R6)
-- ---------------------------------------------------------------------------
-- El servidor guarda en alert_recipients.token_hash el SHA-256 en hexadecimal del token.
-- Aquí se compara igual. Si el token no coincide, o la alerta ya no está abierta, no devuelve nada.
-- Las columnas se llaman step_position y step_body porque "position" es palabra reservada.

create or replace function public.get_alert_steps(p_alert_id uuid, p_token text)
returns table (step_position smallint, step_body text)
language sql
stable
security definer set search_path = ''
as $$
  select s.position, s.body
  from public.alert_recipients r
  join public.alerts a on a.id = r.alert_id
  join public.notice_steps s on s.notice_id = a.notice_id
  where r.alert_id = p_alert_id
    and r.token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex')
    and a.outcome = 'open'
    and (a.expires_at is null or a.expires_at > now())
  order by s.position;
$$;

revoke all on function public.get_alert_steps(uuid, text) from public;
grant execute on function public.get_alert_steps(uuid, text) to anon, authenticated;

-- Para que la API vea las tablas nuevas sin esperar.
notify pgrst, 'reload schema';
