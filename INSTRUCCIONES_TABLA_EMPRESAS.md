# 🏢 INSTRUCCIONES PARA CREAR TABLA EMPRESAS

## 📋 Resumen
Este documento contiene las instrucciones para crear la nueva tabla `empresas` como parte de la refactorización del Orquestador hacia una arquitectura multi-tabla.

## 🎯 Objetivo
Separar los datos de la empresa de la tabla `solicitudes` para mejorar la organización y escalabilidad de la base de datos.

## 🔧 Instrucciones de Ejecución

### Paso 1: Acceder a Supabase
1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Seleccionar el proyecto de Wy Crédito
3. Ir a la sección **SQL Editor**

### Paso 2: Ejecutar el SQL
Copiar y pegar el siguiente código SQL en el editor:

```sql
-- =====================================================
-- CREAR TABLA EMPRESAS - ARQUITECTURA MULTI-TABLA
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
```

### Paso 3: Verificar la Creación
Ejecutar esta consulta para verificar que la tabla se creó correctamente:

```sql
-- Verificar estructura de la tabla
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;
```

## ✅ Cambios Implementados en el Código

### 🔧 Orquestador Refactorizado
El archivo `src/services/orquestador.js` ha sido refactorizado con:

1. **Nueva función `saveData()`**: Enruta automáticamente los datos a la tabla correcta
2. **Mapeo de campos**: Define qué campos van a `solicitudes` vs `empresas`
3. **Lógica inteligente**: Crea la empresa en el primer dato empresarial y actualiza en los siguientes

### 📊 Mapeo de Campos

#### Tabla `solicitudes`:
- `nombre_solicitante`
- `apellidos_solicitante` 
- `email`
- `password`
- `nombre_rl`
- `documento_rl`
- `telefono_rl`
- `email_rl`
- `monto_solicitado`
- `plazo_solicitado`
- `destino_credito`
- `ingresos_mensuales`
- `egresos_mensuales`
- `patrimonio`
- `confirmacion_final`

#### Tabla `empresas`:
- `nit`
- `razon_social`
- `tipo_empresa`
- `sitio_web`
- `telefono_empresa`
- `direccion_empresa`
- `ciudad`
- `departamento`

## 🚀 Beneficios de la Refactorización

1. **Separación de Responsabilidades**: Datos de solicitud vs datos de empresa
2. **Escalabilidad**: Facilita futuras expansiones
3. **Mantenimiento**: Código más organizado y fácil de mantener
4. **Relaciones**: Mantiene la integridad referencial con `solicitud_id`
5. **Flexibilidad**: Permite múltiples empresas por solicitud en el futuro

## 🔍 Verificación de Funcionamiento

Una vez creada la tabla, el sistema automáticamente:

1. **Primer dato empresarial** (ej: NIT): Crea un nuevo registro en `empresas`
2. **Datos siguientes** (ej: razón social): Actualiza el registro existente
3. **Datos de solicitud**: Continúan guardándose en `solicitudes`
4. **Logs detallados**: Se muestran en la consola del navegador

## 📞 Soporte

Si hay algún problema con la creación de la tabla:
1. Verificar permisos en Supabase
2. Revisar logs en la consola del navegador
3. Consultar la documentación de Supabase

---

*Documento creado para la refactorización del Orquestador - Wy Crédito Tecnología*