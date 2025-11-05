-- Tabla para verificación de email mediante códigos OTP
create table if not exists public.email_verifications (
  id bigint generated always as identity primary key,
  session_id uuid not null,
  email text not null,
  code_hash text not null,
  attempts int default 0,
  expires_at timestamp with time zone not null,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Índices útiles
create index if not exists idx_email_verifications_session on public.email_verifications(session_id);
create index if not exists idx_email_verifications_email on public.email_verifications(email);

-- RLS (opcional): normalmente se consulta con service role; deshabilitado para simplicidad
alter table public.email_verifications disable row level security;