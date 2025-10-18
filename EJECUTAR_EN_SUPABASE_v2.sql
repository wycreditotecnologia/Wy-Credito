-- =====================================================
-- EJECUTAR_EN_SUPABASE_v2.sql
-- Maestro idempotente: Empresas, Garantías, Referencias, Vistas y CHECKs
-- Ejecutar este archivo en el SQL Editor de la MISMA instancia de Supabase
-- que usa la aplicación (variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
-- Requisito: Debe existir `public.solicitudes` (ver database/setup_database.sql).
-- =====================================================

-- =====================================================
-- 0) EXTENSIONES REQUERIDAS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1) CREATE TABLE IF NOT EXISTS empresas (completa)
--    Incluye TODAS las columnas usadas por el orquestador.
--    + Índices, trigger updated_at y políticas RLS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES public.solicitudes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Información de la empresa
    nit TEXT,
    razon_social TEXT,
    tipo_empresa TEXT,
    sitio_web TEXT,
    telefono_empresa TEXT,
    direccion_empresa TEXT,
    ciudad TEXT,
    departamento TEXT,

    -- Representante legal (según orquestador)
    nombre_representante_legal TEXT,
    documento_representante_legal TEXT,
    celular_representante_legal TEXT,

    -- Campos adicionales de negocio
    redes_sociales JSONB,
    proposito_recursos TEXT,
    adquisicion_activos_fijos BOOLEAN DEFAULT FALSE,
    detalle_activos_fijos TEXT,

    -- Referencias (compatibilidad con flujo actual del orquestador)
    nombre_referencia_1 TEXT,
    telefono_referencia_1 TEXT,
    nombre_referencia_2 TEXT,
    telefono_referencia_2 TEXT,
    nombre_referencia_3 TEXT,
    telefono_referencia_3 TEXT,
    nombre_referencia_4 TEXT,
    telefono_referencia_4 TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_empresas_solicitud_id ON public.empresas(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_empresas_nit ON public.empresas(nit);
CREATE INDEX IF NOT EXISTS idx_empresas_razon_social ON public.empresas(razon_social);

-- Trigger y función updated_at (idempotente)
CREATE OR REPLACE FUNCTION public.actualizar_updated_at_empresas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_updated_at_empresas ON public.empresas;
CREATE TRIGGER trigger_actualizar_updated_at_empresas
    BEFORE UPDATE ON public.empresas
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_updated_at_empresas();

-- RLS y políticas (desarrollo; idempotentes)
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso público a empresas" ON public.empresas;
CREATE POLICY "Acceso público a empresas"
    ON public.empresas FOR ALL
    USING (true)
    WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE public.empresas IS 'Tabla para información de empresas vinculada a solicitudes (maestro v2)';
COMMENT ON COLUMN public.empresas.solicitud_id IS 'FK a solicitudes.id';
COMMENT ON COLUMN public.empresas.nit IS 'Número de Identificación Tributaria';
COMMENT ON COLUMN public.empresas.razon_social IS 'Razón social';
COMMENT ON COLUMN public.empresas.tipo_empresa IS 'Tipo de empresa (SAS, LTDA, SA, etc.)';
COMMENT ON COLUMN public.empresas.redes_sociales IS 'JSON con enlaces: web, LinkedIn, Facebook, Instagram, etc.';
COMMENT ON COLUMN public.empresas.proposito_recursos IS 'Propósito del uso de recursos del crédito';
COMMENT ON COLUMN public.empresas.adquisicion_activos_fijos IS 'Si contempla adquisición de activos fijos';
COMMENT ON COLUMN public.empresas.detalle_activos_fijos IS 'Detalle de los activos fijos a adquirir';

-- =====================================================
-- 1A) COMPATIBILIDAD: asegurar columnas si la tabla ya existía sin ellas
--     (evita errores 42703: columna no existe)
-- =====================================================
ALTER TABLE public.empresas
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    ADD COLUMN IF NOT EXISTS nit TEXT,
    ADD COLUMN IF NOT EXISTS razon_social TEXT,
    ADD COLUMN IF NOT EXISTS tipo_empresa TEXT,
    ADD COLUMN IF NOT EXISTS sitio_web TEXT,
    ADD COLUMN IF NOT EXISTS telefono_empresa TEXT,
    ADD COLUMN IF NOT EXISTS direccion_empresa TEXT,
    ADD COLUMN IF NOT EXISTS ciudad TEXT,
    ADD COLUMN IF NOT EXISTS departamento TEXT,

    ADD COLUMN IF NOT EXISTS nombre_representante_legal TEXT,
    ADD COLUMN IF NOT EXISTS documento_representante_legal TEXT,
    ADD COLUMN IF NOT EXISTS celular_representante_legal TEXT,

    ADD COLUMN IF NOT EXISTS redes_sociales JSONB,
    ADD COLUMN IF NOT EXISTS proposito_recursos TEXT,
    ADD COLUMN IF NOT EXISTS adquisicion_activos_fijos BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS detalle_activos_fijos TEXT,

    ADD COLUMN IF NOT EXISTS nombre_referencia_1 TEXT,
    ADD COLUMN IF NOT EXISTS telefono_referencia_1 TEXT,
    ADD COLUMN IF NOT EXISTS nombre_referencia_2 TEXT,
    ADD COLUMN IF NOT EXISTS telefono_referencia_2 TEXT,
    ADD COLUMN IF NOT EXISTS nombre_referencia_3 TEXT,
    ADD COLUMN IF NOT EXISTS telefono_referencia_3 TEXT,
    ADD COLUMN IF NOT EXISTS nombre_referencia_4 TEXT,
    ADD COLUMN IF NOT EXISTS telefono_referencia_4 TEXT;

-- =====================================================
-- 2) CREATE TABLE IF NOT EXISTS garantias (múltiples por empresa)
--    + Índice y RLS + compatibilidad
-- =====================================================
CREATE TABLE IF NOT EXISTS public.garantias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    descripcion TEXT NOT NULL,
    valor_estimado NUMERIC NOT NULL,
    url_foto TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_garantias_empresa_id ON public.garantias(empresa_id);

ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso público a garantias" ON public.garantias;
CREATE POLICY "Acceso público a garantias"
    ON public.garantias FOR ALL
    USING (true)
    WITH CHECK (true);

-- Compatibilidad: asegurar columna created_at si la tabla ya existía sin ella
ALTER TABLE public.garantias
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- =====================================================
-- 3) CREATE TABLE IF NOT EXISTS referencias_comerciales (múltiples por empresa)
--    + Índice y RLS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.referencias_comerciales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    contacto TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referencias_empresa ON public.referencias_comerciales(empresa_id);

ALTER TABLE public.referencias_comerciales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso público a referencias_comerciales" ON public.referencias_comerciales;
CREATE POLICY "Acceso público a referencias_comerciales"
    ON public.referencias_comerciales FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 4) CHECK recomendado para documentos.tipo_documento (robustez)
--    Idempotente: crea el constraint solo si no existe.
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_type = 'CHECK'
          AND table_name = 'documentos'
          AND constraint_name = 'documentos_tipo_documento_check'
    ) THEN
        ALTER TABLE public.documentos
            ADD CONSTRAINT documentos_tipo_documento_check
            CHECK (
                tipo_documento IN (
                    'identidad_rl',
                    'certificado_existencia',
                    'composicion_accionaria',
                    'estados_financieros',
                    'declaracion_renta',
                    'foto_garantia'
                )
            );
    END IF;
END $$;

-- =====================================================
-- 5) Vista útil: vista_empresas_completa (idempotente con CREATE OR REPLACE)
--    Incluye conteos y tipos de documentos relacionados.
-- =====================================================
CREATE OR REPLACE VIEW public.vista_empresas_completa AS
SELECT
    e.*,
    COUNT(DISTINCT g.id) AS total_garantias,
    COUNT(DISTINCT r.id) AS total_referencias,
    ARRAY_AGG(DISTINCT d.tipo_documento) FILTER (WHERE d.tipo_documento IS NOT NULL) AS tipos_documentos
FROM public.empresas e
LEFT JOIN public.solicitudes s ON s.id = e.solicitud_id
LEFT JOIN public.documentos d ON d.solicitud_id = s.id
LEFT JOIN public.garantias g ON g.empresa_id = e.id
LEFT JOIN public.referencias_comerciales r ON r.empresa_id = e.id
GROUP BY e.id;

-- =====================================================
-- 6) (Opcional) Migración referencias JSONB -> tabla normalizada
--    Ejecutar si existen datos previos en solicitudes.referencias
-- =====================================================
/*
INSERT INTO public.referencias_comerciales (empresa_id, nombre, contacto)
SELECT e.id, ref->>'nombre', ref->>'contacto'
FROM public.solicitudes s
JOIN public.empresas e ON e.solicitud_id = s.id
CROSS JOIN LATERAL jsonb_array_elements(s.referencias) AS ref
WHERE s.referencias IS NOT NULL;
*/

-- =====================================================
-- FIN DEL SCRIPT v2
-- Ejecutar completo para crear/actualizar tablas, RLS, triggers y vista.
-- =====================================================