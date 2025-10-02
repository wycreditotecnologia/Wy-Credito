-- =====================================================
-- SCRIPT PARA CREAR TABLA EMPRESAS - ARQUITECTURA MULTI-TABLA
-- Wy Crédito Tecnología - Wally
-- =====================================================

-- Crear la nueva tabla empresas
CREATE TABLE IF NOT EXISTS empresas (
    -- Identificadores y metadatos
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
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
    departamento TEXT
);

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_empresas_solicitud_id ON empresas(solicitud_id);
CREATE INDEX IF NOT EXISTS idx_empresas_nit ON empresas(nit);
CREATE INDEX IF NOT EXISTS idx_empresas_razon_social ON empresas(razon_social);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at_empresas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_updated_at_empresas
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at_empresas();

-- Habilitar Row Level Security
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Crear política de acceso público para desarrollo
CREATE POLICY "Acceso público a empresas" 
    ON empresas FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE empresas IS 'Tabla para almacenar información específica de las empresas, separada de la tabla solicitudes';
COMMENT ON COLUMN empresas.solicitud_id IS 'Referencia a la solicitud principal - mantiene la relación';
COMMENT ON COLUMN empresas.nit IS 'Número de Identificación Tributaria de la empresa';
COMMENT ON COLUMN empresas.razon_social IS 'Razón social completa de la empresa';
COMMENT ON COLUMN empresas.tipo_empresa IS 'Tipo de empresa: SAS, LTDA, SA, Persona Natural, etc.';

-- =====================================================
-- MIGRACIÓN DE DATOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Migrar datos de empresas existentes desde la tabla solicitudes
-- NOTA: Ejecutar solo si hay datos existentes que migrar
/*
INSERT INTO empresas (solicitud_id, nit, razon_social, tipo_empresa, sitio_web, telefono_empresa, direccion_empresa, ciudad, departamento)
SELECT 
    id as solicitud_id,
    nit,
    razon_social,
    tipo_empresa,
    sitio_web,
    telefono_empresa,
    direccion_empresa,
    ciudad,
    departamento
FROM solicitudes 
WHERE nit IS NOT NULL OR razon_social IS NOT NULL
ON CONFLICT (solicitud_id) DO NOTHING;
*/

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;