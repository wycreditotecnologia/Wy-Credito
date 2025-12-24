-- SCRIPT MAESTRO DE INICIALIZACIÓN (V2)
-- Ejecuta esto en el Editor SQL de Supabase para crear todas las tablas necesarias.
-- Este script crea las tablas con los tipos de datos correctos (UUID) desde el principio.

-- 1. Limpieza (Opcional: descomentar si quieres reiniciar todo)
-- DROP TABLE IF EXISTS application_references CASCADE;
-- DROP TABLE IF EXISTS application_documents CASCADE;
-- DROP TABLE IF EXISTS application_steps CASCADE;
-- DROP TABLE IF EXISTS credit_applications CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Corregido a UUID
    full_name VARCHAR(200),
    phone VARCHAR(20),
    document_type VARCHAR(50),
    document_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla principal de solicitudes de crédito
CREATE TABLE IF NOT EXISTS credit_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Corregido a UUID
    
    -- Paso 1: Información de Empresa
    company_nit VARCHAR(50),
    company_name VARCHAR(200),
    company_type VARCHAR(50),
    company_website VARCHAR(500),
    company_social_media TEXT,
    data_authorization BOOLEAN DEFAULT false,
    
    -- Paso 2: Documentación Legal
    legal_rep_name VARCHAR(200),
    legal_rep_doc_type VARCHAR(50),
    legal_rep_doc_number VARCHAR(50),
    legal_rep_phone VARCHAR(20),
    
    -- Paso 3: Información Financiera
    resource_purpose TEXT,
    acquire_fixed_assets BOOLEAN,
    fixed_assets_description TEXT,
    
    -- Paso 5: Declaraciones
    declaration_productive_use BOOLEAN DEFAULT false,
    declaration_no_personal_use BOOLEAN DEFAULT false,
    declaration_terms_accepted BOOLEAN DEFAULT false,
    
    -- Paso 6: Garantía
    guarantee_description TEXT,
    guarantee_value DECIMAL(15, 2),
    
    -- Estado de la solicitud
    status VARCHAR(50) DEFAULT 'draft',
    current_step INTEGER DEFAULT 1,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla para guardar progreso de cada paso
CREATE TABLE IF NOT EXISTS application_steps (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Corregido a UUID
    application_id BIGINT NOT NULL,
    step_number INTEGER NOT NULL,
    step_data JSONB NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, step_number)
);

-- 5. Tabla para documentos adjuntos (Incluye soporte IA)
CREATE TABLE IF NOT EXISTS application_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Corregido a UUID
    application_id BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    ia_status VARCHAR(50) DEFAULT 'pendiente', -- Agregado para IA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla para referencias comerciales
CREATE TABLE IF NOT EXISTS application_references (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL, -- Corregido a UUID
    application_id BIGINT NOT NULL,
    reference_number INTEGER NOT NULL,
    reference_name VARCHAR(200) NOT NULL,
    reference_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, reference_number)
);

-- 7. Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_references ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS (Simplificadas para permitir acceso propio)

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Credit Applications
CREATE POLICY "Users can view own applications" ON credit_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON credit_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON credit_applications FOR UPDATE USING (auth.uid() = user_id);

-- Application Steps
CREATE POLICY "Users can view own steps" ON application_steps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own steps" ON application_steps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own steps" ON application_steps FOR UPDATE USING (auth.uid() = user_id);

-- Application Documents
CREATE POLICY "Users can view own documents" ON application_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON application_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON application_documents FOR UPDATE USING (auth.uid() = user_id);

-- Application References
CREATE POLICY "Users can view own references" ON application_references FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own references" ON application_references FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own references" ON application_references FOR UPDATE USING (auth.uid() = user_id);

-- 9. Índices
CREATE INDEX IF NOT EXISTS idx_credit_applications_user_id ON credit_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);

-- 10. Función para actualizar timestamp (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_credit_applications_updated_at ON credit_applications;
CREATE TRIGGER update_credit_applications_updated_at BEFORE UPDATE ON credit_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_application_documents_updated_at ON application_documents;
CREATE TRIGGER update_application_documents_updated_at BEFORE UPDATE ON application_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
