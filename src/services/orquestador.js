import { supabase } from '../lib/supabaseClient';

// --- FUNCIÓN DE EXTRACCIÓN CON IA (AHORA VIA BACKEND) ---
export async function extractDataWithGemini(fileUrl, fileType, tipoDocumento) {
  console.log(`Iniciando extracción con IA (backend) para el archivo: ${fileUrl}`);

  try {
    // Determinar tipo MIME a partir del argumento o extensión
    let mimeType = 'application/pdf';
    if (fileType && fileType.includes('/')) {
      mimeType = fileType;
    } else if (typeof fileUrl === 'string') {
      const lower = fileUrl.toLowerCase();
      if (lower.endsWith('.png')) mimeType = 'image/png';
      else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
      else if (lower.endsWith('.pdf')) mimeType = 'application/pdf';
    }

    // Llamada al endpoint seguro en Vercel
    const resp = await fetch('/api/gemini-extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl, fileType: mimeType, tipo_documento: tipoDocumento })
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      throw new Error(`Error del backend (${resp.status}): ${errText}`);
    }

    const payload = await resp.json();
    const extractedData = payload?.data || {};
    console.log('Datos extraídos por Gemini (backend):', extractedData);
    return extractedData;
  } catch (error) {
    console.error('Error en la extracción con Gemini (backend):', error);
    // Fallback para no detener el flujo del usuario
    return {};
  }
}

export class OrquestadorWally {
  constructor() {
    this.solicitudActual = null;
    this.pasoActual = 'BIENVENIDA';
  }

  // MAPEO COMPLETO DE CAMPOS A TABLAS - ARQUITECTURA FINAL
  get fieldToTableMap() {
    return {
      // Campos que van a la tabla 'solicitudes'
      'nombre_solicitante': 'solicitudes',
      'apellidos_solicitante': 'solicitudes', 
      'email': 'solicitudes',
      'password': 'solicitudes',
      'nombre_rl': 'solicitudes',
      'documento_rl': 'solicitudes',
      'telefono_rl': 'solicitudes',
      'email_rl': 'solicitudes',
      'tipo_documento_rl': 'solicitudes',
      'monto_solicitado': 'solicitudes',
      'plazo_solicitado': 'solicitudes',
      'destino_credito': 'solicitudes',
      'ingresos_mensuales': 'solicitudes',
      'egresos_mensuales': 'solicitudes',
      'patrimonio': 'solicitudes',
      'declaracion_veracidad': 'solicitudes',
      'consentimiento_datos': 'solicitudes',
      'declaracion_origen_fondos': 'solicitudes',
      'aceptacion_productiva': 'solicitudes',
      'aceptacion_no_personal': 'solicitudes',
      'aceptacion_habeas_data': 'solicitudes',

      // Campos que van a la nueva tabla 'solicitantes'
      'solicitante_nombre_completo': 'solicitantes',
      'solicitante_email': 'solicitantes',
      'solicitante_telefono': 'solicitantes',
      'consentimiento_guardado_progresivo': 'solicitantes',
      
      // Campos que van a la tabla 'empresas'
      'nit': 'empresas',
      'razon_social': 'empresas',
      'tipo_empresa': 'empresas',
      'sitio_web': 'empresas',
      'telefono_empresa': 'empresas',
      'direccion_empresa': 'empresas',
      'ciudad': 'empresas',
      'departamento': 'empresas',
      'nombre_representante_legal': 'empresas',
      'documento_representante_legal': 'empresas',
      'celular_representante_legal': 'empresas',
      'proposito_recursos': 'empresas',
      'detalle_activos_fijos': 'empresas',
      'nombre_referencia_1': 'empresas',
      'telefono_referencia_1': 'empresas',
      'nombre_referencia_2': 'empresas',
      'telefono_referencia_2': 'empresas',
      'nombre_referencia_3': 'empresas',
      'telefono_referencia_3': 'empresas',
      'nombre_referencia_4': 'empresas',
      'telefono_referencia_4': 'empresas',
      
      // URLs de documentos que van a la tabla 'documentos'
      'url_doc_identidad': 'documentos',
      'url_certificado_existencia': 'documentos',
      'url_composicion_accionaria': 'documentos',
      'url_declaracion_renta': 'documentos',
      'url_estados_financieros': 'documentos',
      
      // Campos de garantía que van a la tabla 'garantias'
      'descripcion_garantia': 'garantias',
      'valor_estimado_garantia': 'garantias',
      'url_foto_garantia': 'garantias'
      };
  }

  // FUNCIÓN ENRUTADORA DE DATOS - Arquitectura Multi-tabla FINAL
  async saveData(solicitudId, field, value) {
    try {
      // Primero, busca si ya existe una empresa asociada a esta solicitud
      const { data: empresaData, error: findError } = await supabase
        .from('empresas')
        .select('id')
        .eq('solicitud_id', solicitudId)
        .single();

      const targetTable = this.fieldToTableMap[field];

      if (targetTable === 'solicitudes') {
        // Lógica para actualizar la tabla 'solicitudes'
        const { error } = await supabase
          .from('solicitudes')
          .update({ [field]: value })
          .eq('id', solicitudId);
        
        if (error) throw new Error(`Error actualizando solicitudes: ${error.message}`);
        console.log(`✅ Campo '${field}' guardado en solicitudes:`, value);

      } else if (targetTable === 'empresas') {
        if (empresaData) {
          // Si la empresa ya existe, la actualiza
          const { error } = await supabase
            .from('empresas')
            .update({ [field]: value })
            .eq('id', empresaData.id);
          
          if (error) throw new Error(`Error actualizando empresas: ${error.message}`);
          console.log(`✅ Campo '${field}' actualizado en empresas:`, value);
        } else {
          // Si no existe, la crea (caso del primer dato de la empresa)
          const { error } = await supabase
            .from('empresas')
            .insert({ [field]: value, solicitud_id: solicitudId });
          
          if (error) throw new Error(`Error insertando en empresas: ${error.message}`);
          console.log(`✅ Nueva empresa creada con campo '${field}':`, value);
        }
      } else if (targetTable === 'documentos') {
        // Lógica para guardar URLs de documentos en la tabla 'documentos'
        const tipoDocumentoMap = {
          'url_doc_identidad': 'identidad_rl',
          'url_certificado_existencia': 'certificado_existencia',
          'url_composicion_accionaria': 'composicion_accionaria',
          'url_declaracion_renta': 'declaracion_renta',
          'url_estados_financieros': 'estados_financieros'
        };
        
        const tipoDocumento = tipoDocumentoMap[field];
        const nombreArchivo = value.split('/').pop();
        
        const { error } = await supabase
          .from('documentos')
          .insert({
            solicitud_id: solicitudId,
            tipo_documento: tipoDocumento,
            url_storage: value,
            nombre_archivo: nombreArchivo
          });
        
        if (error) throw new Error(`Error insertando documento: ${error.message}`);
        console.log(`✅ Documento '${tipoDocumento}' guardado en documentos:`, value);
        
      } else if (targetTable === 'garantias') {
        // Lógica para guardar datos de garantía en la tabla 'garantias'
        // Mapear campos de garantía a nombres de columna correctos
        const garantiaFieldMap = {
          'descripcion_garantia': 'descripcion',
          'valor_estimado_garantia': 'valor_estimado',
          'url_foto_garantia': 'url_foto'
        };
        
        const dbField = garantiaFieldMap[field] || field;
        
        // Verificar si ya existe una garantía para esta empresa
        let garantiaData = null;
        if (empresaData) {
          const { data: garantia, error: findGarantiaError } = await supabase
            .from('garantias')
            .select('id')
            .eq('empresa_id', empresaData.id)
            .single();
          
          if (!findGarantiaError) {
            garantiaData = garantia;
          }
        }

        if (garantiaData) {
          // Si la garantía ya existe, la actualiza
          const { error } = await supabase
            .from('garantias')
            .update({ [dbField]: value })
            .eq('id', garantiaData.id);
          
          if (error) throw new Error(`Error actualizando garantía: ${error.message}`);
          console.log(`✅ Campo '${dbField}' actualizado en garantías:`, value);
        } else {
          // Si no existe, la crea (necesita empresa_id)
          if (!empresaData) {
            throw new Error('No se puede crear garantía sin empresa asociada');
          }
          
          const { error } = await supabase
            .from('garantias')
            .insert({ [dbField]: value, empresa_id: empresaData.id });
          
          if (error) throw new Error(`Error insertando garantía: ${error.message}`);
          console.log(`✅ Nueva garantía creada con campo '${dbField}':`, value);
        }
      } else if (targetTable === 'solicitantes') {
        // Crear o actualizar registro del solicitante vinculado a la solicitud
        const { data: solicitanteData, error: solicitanteFindError } = await supabase
          .from('solicitantes')
          .select('id')
          .eq('solicitud_id', solicitudId)
          .single();

        if (solicitanteFindError && solicitanteFindError.code !== 'PGRST116') {
          console.warn('No se pudo buscar solicitante:', solicitanteFindError.message);
        }

        if (solicitanteData) {
          const { error } = await supabase
            .from('solicitantes')
            .update({ [field]: value })
            .eq('id', solicitanteData.id);
          if (error) throw new Error(`Error actualizando solicitantes: ${error.message}`);
          console.log(`✅ Campo '${field}' actualizado en solicitantes:`, value);
        } else {
          const { error } = await supabase
            .from('solicitantes')
            .insert({ [field]: value, solicitud_id: solicitudId });
          if (error) throw new Error(`Error insertando en solicitantes: ${error.message}`);
          console.log(`✅ Nuevo solicitante creado con campo '${field}':`, value);
        }
      } else {
        console.warn(`⚠️ Campo "${field}" no tiene una tabla de destino definida.`);
        // Fallback: guardar en solicitudes como antes
        const { error } = await supabase
          .from('solicitudes')
          .update({ [field]: value })
          .eq('id', solicitudId);
        
        if (error) throw new Error(`Error en fallback a solicitudes: ${error.message}`);
        console.log(`⚠️ Campo '${field}' guardado en solicitudes (fallback):`, value);
      }

    } catch (error) {
      console.error(`❌ Error en saveData para campo '${field}':`, error);
      throw error;
    }
  }

  // NUEVO: procesarFormulario - guarda datos del paso y calcula siguiente paso
  async procesarFormulario(sessionId, { currentStep, stepData } = {}) {
    console.log(`Procesando paso ${currentStep} para la sesión ${sessionId}`, stepData);
    try {
      // Guardar los datos del paso actual usando el enrutador de datos existente
      for (const field in stepData) {
        if (!field) continue;
        const value = stepData[field];
        // Usa el map y la función saveData para enrutar a la tabla correcta
        await this.saveData(sessionId, field, value);
      }

      // Lógica lineal para determinar el siguiente paso (puede evolucionar)
      const nextStep = currentStep + 1;

      return { success: true, nextStep };
    } catch (error) {
      console.error('Error en procesarFormulario:', error);
      return { success: false, error: 'Hubo un error al procesar tu información.' };
    }
  }

  // Validacion robusta de email
  validarEmail(email) {
    if (!email || typeof email !== 'string') {
      return { esValido: false, mensaje: 'El email es requerido.' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { esValido: false, mensaje: 'El formato del email no es valido.' };
    }

    return { esValido: true, mensaje: 'Email valido.' };
  }

  // Validacion robusta de contraseña
  validarContrasenaRobusta(contrasena) {
    if (!contrasena || typeof contrasena !== 'string') {
      return { esValido: false, mensaje: 'La contraseña es requerida.' };
    }

    if (contrasena.length < 8) {
      return { esValido: false, mensaje: 'La contraseña debe tener al menos 8 caracteres.' };
    }

    if (!/[A-Z]/.test(contrasena)) {
      return { esValido: false, mensaje: 'La contraseña debe contener al menos una letra mayuscula.' };
    }

    if (!/[a-z]/.test(contrasena)) {
      return { esValido: false, mensaje: 'La contraseña debe contener al menos una letra minuscula.' };
    }

    if (!/[0-9]/.test(contrasena)) {
      return { esValido: false, mensaje: 'La contraseña debe contener al menos un numero.' };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena)) {
      return { esValido: false, mensaje: 'La contraseña debe contener al menos un simbolo especial.' };
    }

    return { esValido: true, mensaje: 'Contraseña valida.' };
  }

  // Validacion de NIT
  validarNIT(nit) {
    if (!nit || typeof nit !== 'string') {
      return { esValido: false, mensaje: 'El NIT es requerido.' };
    }

    const nitLimpio = nit.replace(/[^0-9]/g, '');
    if (nitLimpio.length < 8 || nitLimpio.length > 10) {
      return { esValido: false, mensaje: 'El NIT debe tener entre 8 y 10 digitos.' };
    }

    return { esValido: true, mensaje: 'NIT valido.' };
  }

  // (Eliminado) procesarMensaje: lógica del chat retirada en Fase 2

  // FUNCIÓN FINAL: Obtener todos los datos del resumen
  async getSummaryData(sessionId) {
    try {
      // Obtener datos de la solicitud
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (solicitudError) throw new Error(`Error obteniendo solicitud: ${solicitudError.message}`);

      // Obtener datos de la empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('solicitud_id', sessionId)
        .single();

      // Obtener documentos
      const { data: documentosData, error: documentosError } = await supabase
        .from('documentos')
        .select('*')
        .eq('solicitud_id', sessionId);

      // Obtener garantía (si existe)
      let garantiaData = null;
      if (empresaData) {
        const { data: garantia, error: garantiaError } = await supabase
          .from('garantias')
          .select('*')
          .eq('empresa_id', empresaData.id)
          .single();
        
        if (!garantiaError) {
          garantiaData = garantia;
        }
      }

      return {
        success: true,
        data: {
          solicitud: solicitudData,
          empresa: empresaData,
          documentos: documentosData || [],
          garantia: garantiaData
        }
      };

    } catch (error) {
      console.error("Error obteniendo datos del resumen:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // FUNCIÓN FINAL: Completar el envío de la solicitud
  async completeSubmission(sessionId) {
    try {
      // Generar código de seguimiento único
      const trackingCode = `WY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Actualizar el estado de la solicitud
      const { error: updateError } = await supabase
        .from('solicitudes')
        .update({ 
          status: 'pendiente_revision',
          codigo_seguimiento: trackingCode,
          fecha_envio: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) throw new Error(`Error actualizando solicitud: ${updateError.message}`);

      // Obtener datos del solicitante para el email
      const { data: solicitudData, error: solicitudError } = await supabase
        .from('solicitudes')
        .select('email, nombre_solicitante, apellidos_solicitante')
        .eq('id', sessionId)
        .single();

      if (solicitudError) throw new Error(`Error obteniendo datos del solicitante: ${solicitudError.message}`);

      // TODO: Aquí se enviaría el email de confirmación
      // Por ahora solo simulamos el envío
      console.log(`📧 Email de confirmación enviado a: ${solicitudData.email}`);
      console.log(`📋 Código de seguimiento: ${trackingCode}`);

      return {
        success: true,
        trackingCode: trackingCode,
        message: 'Solicitud enviada exitosamente'
      };

    } catch (error) {
      console.error("Error completando el envío:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default OrquestadorWally;
