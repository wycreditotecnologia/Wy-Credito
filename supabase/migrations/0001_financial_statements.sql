CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.document_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  request_id text NOT NULL,
  doc_type text NOT NULL,
  storage_path text UNIQUE NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  extraction_status text NOT NULL DEFAULT 'pending',
  validation_score numeric,
  requires_human_review boolean NOT NULL DEFAULT false,
  error_message text
);

CREATE INDEX IF NOT EXISTS document_registry_user_req_idx ON public.document_registry (user_id, request_id);

CREATE TABLE IF NOT EXISTS public.financial_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  request_id text NOT NULL,
  statement_type text NOT NULL,
  period_year integer NOT NULL,
  label text NOT NULL,
  amount numeric(18,2) NOT NULL,
  level integer NOT NULL,
  path text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS financial_statements_req_year_idx ON public.financial_statements (request_id, period_year);
CREATE INDEX IF NOT EXISTS financial_statements_amount_idx ON public.financial_statements (amount);
CREATE INDEX IF NOT EXISTS financial_statements_path_gin ON public.financial_statements USING GIN (path);

