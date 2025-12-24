
-- Tabla de perfiles de usuario extendidos
CREATE TABLE user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(200),
    phone VARCHAR(20),
    document_type VARCHAR(50),
    document_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar perfil por defecto para el admin (user_id=1)
INSERT INTO user_profiles (user_id) VALUES (1);

-- Tabla principal de solicitudes de crédito
CREATE TABLE credit_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    
    -- Paso 1: Información de Empresa
    company_nit VARCHAR(50),
    company_name VARCHAR(200),
    company_type VARCHAR(50),
    company_website VARCHAR(500),
    company_social_media TEXT,
    data_authorization BOOLEAN DEFAULT false,
    
    -- Paso 2: Documentación Legal (nombres de archivos se guardan en application_documents)
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
    status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, under_review, approved, rejected
    current_step INTEGER DEFAULT 1,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para guardar progreso de cada paso
CREATE TABLE application_steps (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    step_number INTEGER NOT NULL,
    step_data JSONB NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, step_number)
);

-- Tabla para documentos adjuntos
CREATE TABLE application_documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- id_document, representation_cert, shareholder_composition, tax_return, financial_statements, guarantee_photo
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para referencias comerciales
CREATE TABLE application_references (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL,
    reference_number INTEGER NOT NULL, -- 1 or 2
    reference_name VARCHAR(200) NOT NULL,
    reference_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, reference_number)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_references ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY user_profiles_select_policy ON user_profiles
    FOR SELECT USING (user_id = uid());

CREATE POLICY user_profiles_insert_policy ON user_profiles
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY user_profiles_update_policy ON user_profiles
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY user_profiles_delete_policy ON user_profiles
    FOR DELETE USING (user_id = uid());

-- Políticas RLS para credit_applications
CREATE POLICY credit_applications_select_policy ON credit_applications
    FOR SELECT USING (user_id = uid());

CREATE POLICY credit_applications_insert_policy ON credit_applications
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY credit_applications_update_policy ON credit_applications
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY credit_applications_delete_policy ON credit_applications
    FOR DELETE USING (user_id = uid());

-- Políticas RLS para application_steps
CREATE POLICY application_steps_select_policy ON application_steps
    FOR SELECT USING (user_id = uid());

CREATE POLICY application_steps_insert_policy ON application_steps
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY application_steps_update_policy ON application_steps
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY application_steps_delete_policy ON application_steps
    FOR DELETE USING (user_id = uid());

-- Políticas RLS para application_documents
CREATE POLICY application_documents_select_policy ON application_documents
    FOR SELECT USING (user_id = uid());

CREATE POLICY application_documents_insert_policy ON application_documents
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY application_documents_update_policy ON application_documents
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY application_documents_delete_policy ON application_documents
    FOR DELETE USING (user_id = uid());

-- Políticas RLS para application_references
CREATE POLICY application_references_select_policy ON application_references
    FOR SELECT USING (user_id = uid());

CREATE POLICY application_references_insert_policy ON application_references
    FOR INSERT WITH CHECK (user_id = uid());

CREATE POLICY application_references_update_policy ON application_references
    FOR UPDATE USING (user_id = uid()) WITH CHECK (user_id = uid());

CREATE POLICY application_references_delete_policy ON application_references
    FOR DELETE USING (user_id = uid());

-- Índices para mejorar el rendimiento
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_credit_applications_user_id ON credit_applications(user_id);
CREATE INDEX idx_credit_applications_status ON credit_applications(status);
CREATE INDEX idx_application_steps_user_id ON application_steps(user_id);
CREATE INDEX idx_application_steps_application_id ON application_steps(application_id);
CREATE INDEX idx_application_documents_user_id ON application_documents(user_id);
CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX idx_application_references_user_id ON application_references(user_id);
CREATE INDEX idx_application_references_application_id ON application_references(application_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_applications_updated_at BEFORE UPDATE ON credit_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_steps_updated_at BEFORE UPDATE ON application_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_documents_updated_at BEFORE UPDATE ON application_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_references_updated_at BEFORE UPDATE ON application_references
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
