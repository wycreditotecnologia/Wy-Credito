const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración de Supabase (usar las variables del .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEmpresasTable() {
  try {
    console.log('🚀 Creando tabla empresas...');
    
    // Crear la tabla directamente con SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: `
        -- Crear la nueva tabla empresas
        CREATE TABLE IF NOT EXISTS empresas (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            nit TEXT,
            razon_social TEXT,
            tipo_empresa TEXT,
            sitio_web TEXT,
            telefono_empresa TEXT,
            direccion_empresa TEXT,
            ciudad TEXT,
            departamento TEXT
        );
        
        -- Crear índices
        CREATE INDEX IF NOT EXISTS idx_empresas_solicitud_id ON empresas(solicitud_id);
        CREATE INDEX IF NOT EXISTS idx_empresas_nit ON empresas(nit);
        
        -- Habilitar RLS
        ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
        
        -- Política de acceso
        CREATE POLICY IF NOT EXISTS "Acceso público a empresas" 
            ON empresas FOR ALL 
            USING (true) 
            WITH CHECK (true);
      `
    });
    
    if (error) {
      console.error('❌ Error ejecutando SQL:', error);
      
      // Intentar crear la tabla de forma más simple
      console.log('🔄 Intentando método alternativo...');
      
      const { error: createError } = await supabase
        .from('empresas')
        .select('*')
        .limit(0);
      
      if (createError && createError.message.includes('does not exist')) {
        console.log('⚠️ La tabla no existe, necesita ser creada manualmente en Supabase');
        console.log('📋 SQL para ejecutar en Supabase:');
        console.log(`
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solicitud_id UUID NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    nit TEXT,
    razon_social TEXT,
    tipo_empresa TEXT,
    sitio_web TEXT,
    telefono_empresa TEXT,
    direccion_empresa TEXT,
    ciudad TEXT,
    departamento TEXT
);

CREATE INDEX idx_empresas_solicitud_id ON empresas(solicitud_id);
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acceso público a empresas" ON empresas FOR ALL USING (true) WITH CHECK (true);
        `);
      }
      return;
    }
    
    console.log('✅ Tabla empresas creada exitosamente');
    
    // Verificar que la tabla existe
    const { data: tableInfo, error: infoError } = await supabase
      .from('empresas')
      .select('*')
      .limit(0);
    
    if (infoError) {
      console.error('❌ Error verificando tabla:', infoError);
    } else {
      console.log('✅ Tabla empresas verificada correctamente');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createEmpresasTable();