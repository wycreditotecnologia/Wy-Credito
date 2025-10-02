-- TABLA PARA GARANTÍAS MOBILIARIAS
CREATE TABLE IF NOT EXISTS public.garantias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    valor_estimado NUMERIC NOT NULL,
    url_foto TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción anónima
CREATE POLICY "Permitir acceso anónimo para inserción" ON public.garantias 
FOR INSERT TO anon WITH CHECK (true);

-- Política para permitir lectura a usuarios de servicio
CREATE POLICY "Permitir acceso de lectura a usuarios de servicio" ON public.garantias 
FOR SELECT TO service_role USING (true);