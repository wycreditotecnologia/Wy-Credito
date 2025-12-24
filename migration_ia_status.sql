-- Migración para soportar la funcionalidad de IA y corrección de nombres
-- Ejecuta esto en el Editor SQL de Supabase

-- 1. Añadir columna de estado de IA a la tabla de documentos
ALTER TABLE application_documents 
ADD COLUMN IF NOT EXISTS ia_status VARCHAR(50) DEFAULT 'pendiente'; -- pendiente, procesando, completado, error

-- 2. Asegurar que el bucket de storage 'documentos' sea público o accesible (esto se hace en la UI de Supabase, pero aquí dejo constancia)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', true) ON CONFLICT DO NOTHING;

-- 3. Política para permitir que los usuarios actualicen sus propios documentos (necesario para el uploader)
CREATE POLICY application_documents_update_own ON application_documents
    FOR UPDATE USING (user_id = uid());
