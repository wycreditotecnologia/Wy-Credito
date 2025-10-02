-- =====================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS - WALLY
-- Wy Crédito Tecnología
-- =====================================================

-- Habilitar la extensión para UUIDs si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA PRINCIPAL: SOLICITUDES DE CRÉDITO
-- =====================================================

CREATE TABLE solicitudes (
    -- Identificadores y metadatos
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_solicitante TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'incompleta', 
    -- Estados: incompleta, pendiente, en_revision, aprobada, rechazada
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
    
    -- Información del representante legal
    nombre_representante TEXT,
    apellido_representante TEXT,
    tipo_documento_rl TEXT,
    numero_documento_rl TEXT,
    telefono_rl TEXT,
    email_rl TEXT,
    
    -- Información financiera
    monto_solicitado DECIMAL(15,2),
    plazo_solicitado INTEGER, -- en meses
    destino_credito TEXT,
    ingresos_mensuales DECIMAL(15,2),
    egresos_mensuales DECIMAL(15,2),
    patrimonio DECIMAL(15,2),
    
    -- Información de garantía
    tipo_garantia TEXT,
    descripcion_garantia TEXT,
    valor_garantia DECIMAL(15,2),
    
    -- Consentimientos y declaraciones
    consentimiento_datos BOOLEAN DEFAULT false,
    declaracion_veracidad BOOLEAN DEFAULT false,
    declaracion_origen_fondos BOOLEAN DEFAULT false,
    
    -- Referencias (almacenadas como JSONB para flexibilidad)
    referencias JSONB,
    
    -- Código de seguimiento único
    codigo_seguimiento TEXT UNIQUE,
    
    -- Notas internas (para uso del equipo de Wy)
    notas_internas TEXT
);

-- =====================================================
-- TABLA DE DOCUMENTOS
-- =====================================================

CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL, 
    -- Tipos: 'identidad_rl', 'certificado_existencia', 'composicion_accionaria', 
    --        'estados_financieros', 'declaracion_renta', 'foto_garantia'
    nombre_archivo TEXT NOT NULL,
    url_storage TEXT NOT NULL,
    tamaño_archivo INTEGER, -- en bytes
    tipo_mime TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA DE CONVERSACIONES (PARA TRACKING DEL CHAT)
-- =====================================================

CREATE TABLE conversaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    tipo_mensaje TEXT NOT NULL, -- 'user', 'assistant', 'system'
    paso_flujo TEXT, -- Para tracking del flujo: 'bienvenida', 'pide_correo', etc.
    metadata JSONB, -- Para información adicional del mensaje
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TABLA DE LOGS DEL ORQUESTADOR
-- =====================================================

CREATE TABLE orquestador_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID REFERENCES solicitudes(id) ON DELETE CASCADE,
    accion TEXT NOT NULL,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    datos_validados JSONB,
    errores JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_solicitudes_email ON solicitudes(email_solicitante);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_codigo ON solicitudes(codigo_seguimiento);
CREATE INDEX idx_solicitudes_created_at ON solicitudes(created_at);

CREATE INDEX idx_documentos_solicitud ON documentos(solicitud_id);
CREATE INDEX idx_documentos_tipo ON documentos(tipo_documento);

CREATE INDEX idx_conversaciones_solicitud ON conversaciones(solicitud_id);
CREATE INDEX idx_conversaciones_created_at ON conversaciones(created_at);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para obtener métricas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_applications', (SELECT COUNT(*) FROM solicitudes),
        'pending_applications', (SELECT COUNT(*) FROM solicitudes WHERE estado = 'pendiente'),
        'approved_applications', (SELECT COUNT(*) FROM solicitudes WHERE estado = 'aprobada'),
        'rejected_applications', (SELECT COUNT(*) FROM solicitudes WHERE estado = 'rechazada'),
        'average_amount', (SELECT COALESCE(AVG(monto_solicitado), 0) FROM solicitudes WHERE monto_solicitado IS NOT NULL),
        'total_amount', (SELECT COALESCE(SUM(monto_solicitado), 0) FROM solicitudes WHERE monto_solicitado IS NOT NULL),
        'applications_today', (SELECT COUNT(*) FROM solicitudes WHERE DATE(created_at) = CURRENT_DATE),
        'applications_this_week', (SELECT COUNT(*) FROM solicitudes WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
        'applications_this_month', (SELECT COUNT(*) FROM solicitudes WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)),
        'status_distribution', (
            SELECT json_agg(
                json_build_object(
                    'status', estado,
                    'count', count
                )
            )
            FROM (
                SELECT estado, COUNT(*) as count
                FROM solicitudes
                GROUP BY estado
            ) status_counts
        ),
        'monthly_applications', (
            SELECT json_agg(
                json_build_object(
                    'month', month_name,
                    'count', count
                )
            )
            FROM (
                SELECT 
                    TO_CHAR(created_at, 'Mon YYYY') as month_name,
                    COUNT(*) as count
                FROM solicitudes
                WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon YYYY')
                ORDER BY DATE_TRUNC('month', created_at)
            ) monthly_counts
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Función para generar código de seguimiento único
CREATE OR REPLACE FUNCTION generar_codigo_seguimiento()
RETURNS TEXT AS $$
BEGIN
    RETURN 'WY-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
           LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_actualizar_updated_at
    BEFORE UPDATE ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_updated_at();

-- Trigger para generar código de seguimiento al crear solicitud
CREATE OR REPLACE FUNCTION asignar_codigo_seguimiento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.codigo_seguimiento IS NULL THEN
        NEW.codigo_seguimiento = generar_codigo_seguimiento();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_asignar_codigo
    BEFORE INSERT ON solicitudes
    FOR EACH ROW
    EXECUTE FUNCTION asignar_codigo_seguimiento();

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar Row Level Security
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orquestador_logs ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (acceso público por ahora)
-- NOTA: En producción, se recomienda implementar autenticación más robusta

CREATE POLICY "Acceso público a solicitudes" 
    ON solicitudes FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Acceso público a documentos" 
    ON documentos FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Acceso público a conversaciones" 
    ON conversaciones FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Acceso público a logs" 
    ON orquestador_logs FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para solicitudes con conteo de documentos
CREATE VIEW vista_solicitudes_completa AS
SELECT 
    s.*,
    COUNT(d.id) as total_documentos,
    ARRAY_AGG(d.tipo_documento) FILTER (WHERE d.tipo_documento IS NOT NULL) as tipos_documentos
FROM solicitudes s
LEFT JOIN documentos d ON s.id = d.solicitud_id
GROUP BY s.id;

-- Vista para dashboard de administración
CREATE VIEW vista_dashboard AS
SELECT 
    estado,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as hoy,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as esta_semana
FROM solicitudes
GROUP BY estado;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- =====================================================

/*
-- Insertar una solicitud de ejemplo
INSERT INTO solicitudes (
    email_solicitante, 
    nit, 
    razon_social, 
    estado
) VALUES (
    'ejemplo@empresa.com',
    '900123456-7',
    'Empresa de Ejemplo S.A.S.',
    'incompleta'
);
*/

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Este script crea la estructura completa de la base de datos para Wally
-- Incluye:
-- 1. Tablas principales para solicitudes, documentos, conversaciones y logs
-- 2. Índices para optimización de consultas
-- 3. Funciones auxiliares para automatización
-- 4. Triggers para mantener datos consistentes
-- 5. Políticas de seguridad básicas
-- 6. Vistas útiles para consultas complejas

-- Para ejecutar este script:
-- 1. Accede al editor SQL de tu proyecto Supabase
-- 2. Copia y pega este código completo
-- 3. Ejecuta el script
-- 4. Verifica que todas las tablas se hayan creado correctamente