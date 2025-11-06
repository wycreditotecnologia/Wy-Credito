import { supabase } from '../lib/supabaseClient';
import { geminiModel } from '../lib/geminiClient';
import { conversationFlow } from '../lib/conversationFlow';
import { logger } from '../lib/logger';

// --- FUNCIÓN DE EXTRACCIÓN CON IA (VERSIÓN FRONTEND) ---
async function extractDataWithGemini(fileUrl, fileType) {
  logger.log(`Iniciando extracción con IA para el archivo: ${fileUrl}`);
  
  try {
    // 1. Descargar el archivo desde la URL pública de Supabase
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const fileBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    // 2. Determinar el prompt de workflow correcto según el tipo de documento
    let extractionPrompt;
    if (fileType === 'doc_certificado_existencia') {
      extractionPrompt = `Actúa como un analista de datos experto. Extrae el NIT (incluyendo dígito de verificación) y la Razón Social completa de este Certificado de Existencia y Representación Legal. Responde únicamente con un objeto JSON válido con las claves "nit" y "razon_social".`;
    } else {
      // Aquí añadiríamos prompts para otros tipos de documentos (balances, RUT, etc.)
      extractionPrompt = `Analiza este documento y extrae la información relevante. Responde solo en formato JSON.`;
    }

    // 3. Preparar el request para la API de Gemini
    const generativePart = {
      inlineData: {
        mimeType: 'application/pdf', // Asumimos PDF por ahora
        data: fileBase64,
      },
    };

    // 4. Llamar a la API de Gemini
    const result = await geminiModel.generateContent([extractionPrompt, generativePart]);
    const geminiResponseText = result.response.text();

    // 5. Limpiar y parsear la respuesta JSON para asegurar que sea válida
    const jsonString = geminiResponseText.replace(/```json|```/g, '').trim();
    const extractedData = JSON.parse(jsonString);

    logger.log("Datos extraídos por Gemini:", extractedData);
    return extractedData;

  } catch (error) {
    logger.error("Error en la extracción con Gemini:", error);
    // Si la IA falla, devolvemos un objeto vacío para no detener el flujo
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
      'monto_solicitado': 'solicitudes',
      'plazo_solicitado': 'solicitudes',
      'destino_credito': 'solicitudes',
      'ingresos_mensuales': 'solicitudes',
      'egresos_mensuales': 'solicitudes',
      'patrimonio': 'solicitudes',
      'confirmacion_final': 'solicitudes',
      'aceptacion_productiva': 'solicitudes',
      'aceptacion_no_personal': 'solicitudes',
      'aceptacion_habeas_data': 'solicitudes',
      
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
      const { data: empresaData } = await supabase
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
        logger.log(`✅ Campo '${field}' guardado en solicitudes:`, value);

      } else if (targetTable === 'empresas') {
        if (empresaData) {
          // Si la empresa ya existe, la actualiza
          const { error } = await supabase
            .from('empresas')
            .update({ [field]: value })
            .eq('id', empresaData.id);
          
          if (error) throw new Error(`Error actualizando empresas: ${error.message}`);
          logger.log(`✅ Campo '${field}' actualizado en empresas:`, value);
        } else {
          // Si no existe, la crea (caso del primer dato de la empresa)
          const { error } = await supabase
            .from('empresas')
            .insert({ [field]: value, solicitud_id: solicitudId });
          
          if (error) throw new Error(`Error insertando en empresas: ${error.message}`);
          logger.log(`✅ Nueva empresa creada con campo '${field}':`, value);
        }
      } else if (targetTable === 'documentos') {
        // Lógica para guardar URLs de documentos en la tabla 'documentos'
        const tipoDocumentoMap = {
          'url_doc_identidad': 'documento_identidad_representante',
          'url_certificado_existencia': 'certificado_existencia_representacion',
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
            url_archivo: value,
            nombre_archivo: nombreArchivo
          });
        
        if (error) throw new Error(`Error insertando documento: ${error.message}`);
        logger.log(`✅ Documento '${tipoDocumento}' guardado en documentos:`, value);
        
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
          logger.log(`✅ Campo '${dbField}' actualizado en garantías:`, value);
        } else {
          // Si no existe, la crea (necesita empresa_id)
          if (!empresaData) {
            throw new Error('No se puede crear garantía sin empresa asociada');
          }
          
          const { error } = await supabase
            .from('garantias')
            .insert({ [dbField]: value, empresa_id: empresaData.id });
          
          if (error) throw new Error(`Error insertando garantía: ${error.message}`);
          logger.log(`✅ Nueva garantía creada con campo '${dbField}':`, value);
        }
      } else {
        logger.warn(`⚠️ Campo "${field}" no tiene una tabla de destino definida.`);
        // Fallback: guardar en solicitudes como antes
        const { error } = await supabase
          .from('solicitudes')
          .update({ [field]: value })
          .eq('id', solicitudId);
        
        if (error) throw new Error(`Error en fallback a solicitudes: ${error.message}`);
        logger.log(`⚠️ Campo '${field}' guardado en solicitudes (fallback):`, value);
      }

    } catch (error) {
      logger.error(`❌ Error en saveData para campo '${field}':`, error);
      throw error;
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

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(contrasena)) {
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

  // FUNCIÓN PRINCIPAL: Procesar mensaje completo (migrada desde API)
  async procesarMensaje({ messages, currentStep, sessionId, isFileUpload }) {
    try {
      if (!sessionId) {
        throw new Error("ID de sesión no proporcionado.");
      }
      
      const userMessage = messages[messages.length - 1].text;
      const currentLogic = conversationFlow.find(step => step.step === currentStep);
      
      if (!currentLogic) {
        return { 
          reply: "Ya ha completado todos los pasos.", 
          nextStep: currentStep 
        };
      }

      // Obtener datos de la solicitud
      const { data: solicitudData, error: fetchError } = await supabase
          .from('solicitudes').select('*').eq('id', sessionId).single();
      
      if (fetchError) throw fetchError;

      const nombreSolicitante = solicitudData?.nombre_solicitante?.split(' ')[0] || '';

      // --- LÓGICA FINAL DE ENVÍO ---
      if (currentLogic.field === 'confirmacion_final') {
        if (userMessage.toLowerCase().includes('sí')) {
          // 1. Actualizar el estado de la solicitud en la BD
          await supabase.from('solicitudes').update({ estado: 'pendiente' }).eq('id', sessionId);

          // 2. Obtener todos los datos necesarios para el correo
          const { data: solicitudCompleta } = await supabase.from('solicitudes').select('*').eq('id', sessionId).single();

          // 3. Llamar a nuestra propia API para enviar el correo (esto necesitará ser adaptado)
          const emailPayload = {
            emailTo: solicitudCompleta.email,
            nombreSolicitante: solicitudCompleta.nombre_solicitante,
            montoSolicitado: solicitudCompleta.monto_solicitado,
            plazo: solicitudCompleta.plazo_seleccionado,
            solicitudId: sessionId,
          };

          // Por ahora, solo logueamos el payload del email
      logger.log("Email payload preparado:", emailPayload);

          return {
            reply: "¡Solicitud enviada con éxito! Recibirá un correo de confirmación con todos los detalles. Gracias por confiar en Wy Credito.",
            nextStep: currentLogic.nextStep
          };
        } else {
          // Lógica si el usuario cancela
          await supabase.from('solicitudes').update({ estado: 'cancelada' }).eq('id', sessionId);
          return { 
            reply: "Entendido. Su solicitud ha sido cancelada. Puede cerrar esta ventana.", 
            nextStep: currentStep 
          };
        }
      }

      // --- Manejo de archivos ---
      if (isFileUpload) {
          const fileUrl = userMessage;
          const fileType = currentLogic.field;
          
          // --- Llamada a la nueva función de IA ---
          const extractedData = await extractDataWithGemini(fileUrl, fileType);
          
          // Guardar los datos extraídos por la IA usando la función enrutadora
          for (const [field, value] of Object.entries(extractedData)) {
            await this.saveData(sessionId, field, value);
          }
          await supabase.from('documentos').insert({ 
            solicitud_id: sessionId, 
            tipo_documento: fileType, 
            url_archivo: fileUrl, 
            nombre_archivo: fileUrl.split('/').pop() 
          });
          
          let reply = currentLogic.prompt.replace('{nombre_solicitante}', nombreSolicitante);
          return { 
            reply: `¡Perfecto! He procesado el documento y extraje los datos. ${reply}`, 
            nextStep: currentLogic.nextStep 
          };
      }
      
      // --- Flujo normal de validación de texto ---
      let isValid = false;
      
      // Validación para preguntas con opciones
      if (currentLogic.options) {
        isValid = currentLogic.options.map(opt => opt.toLowerCase()).includes(userMessage.toLowerCase().trim());
      } else if (currentLogic.validation.type === 'text') {
        isValid = userMessage.trim().length >= (currentLogic.validation.minLength || 1);
  } else if (currentLogic.validation.type === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userMessage);
  } else if (currentLogic.validation.type === 'phone') {
        isValid = /^\d{10}$/.test(userMessage.replace(/\D/g, ''));
      } else if (currentLogic.validation.type === 'cedula') {
        isValid = /^\d{8,10}$/.test(userMessage.replace(/\D/g, ''));
      } else if (currentLogic.validation.type === 'confirmation') {
        isValid = true; // Para confirmaciones, siempre es válido
      }

      if (!isValid) {
          let errorMessage = currentLogic.errorMessage.replace('{nombre_solicitante}', nombreSolicitante);
          return { 
            reply: errorMessage, 
            nextStep: currentStep 
          };
      }

      // Guardar la respuesta del usuario usando la nueva función enrutadora
      await this.saveData(sessionId, currentLogic.field, userMessage);

      // Si acabamos de capturar el email, disparamos envío de código OTP
      if (currentLogic.field === 'email') {
        try {
          const nombreCompleto = solicitudData?.nombre_solicitante || '';
          // Llamar API OTP para enviar el código
          await fetch('/api/email-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'send_code', sessionId, email: userMessage, nombre: nombreCompleto })
          });
        } catch (e) { logger.warn('Fallo al enviar código OTP:', e); }
      }
      
      // --- Flujo normal de la conversación ---
      const nextLogic = conversationFlow.find(step => step.step === currentLogic.nextStep);
      const nextMessage = nextLogic ? (nextLogic.question || nextLogic.prompt).replace('{nombre_solicitante}', nombreSolicitante) : "Ya hemos completado la solicitud.";

      // Si estamos en el paso de verificación de código, validar contra la API
      if (currentLogic.field === 'email_verification_code') {
        try {
          const { data: solicitudRow } = await supabase.from('solicitudes').select('email, nombre_solicitante').eq('id', sessionId).single();
          const verifyRes = await fetch('/api/email-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_code', sessionId, email: solicitudRow?.email || solicitudRow?.email_solicitante, code: userMessage })
          });
          const verifyJson = await verifyRes.json();
          if (!verifyJson?.ok) {
            const errorMap = {
              expired: 'El código ha expirado. Te envié uno nuevo a tu correo.',
              invalid_code: 'El código ingresado no es válido. Intenta nuevamente.',
              not_found: 'No encontramos un código activo. Te envié uno nuevo a tu correo.',
            };
            // Si expiró o no existe, volver a enviar
            if (verifyJson?.error === 'expired' || verifyJson?.error === 'not_found') {
              try { await fetch('/api/email-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'send_code', sessionId, email: solicitudRow?.email || solicitudRow?.email_solicitante, nombre: solicitudRow?.nombre_solicitante }) }); } catch (e) { logger.warn('Fallo al reenviar código OTP:', e); }
            }
            return { reply: errorMap[verifyJson?.error] || 'No pudimos verificar el código. Revisa tu correo e intenta de nuevo.', nextStep: currentStep };
          }
          // Éxito: avanzamos al siguiente paso (contraseña)
          return { reply: '✅ Correo verificado correctamente. Continuemos.', nextStep: currentLogic.nextStep };
        } catch (e) {
          return { reply: 'Ocurrió un error verificando tu código. Intenta de nuevo.', nextStep: currentStep };
        }
      }
      
      // Construir respuesta base
      const response = { 
        reply: nextMessage, 
        nextStep: currentLogic.nextStep 
      };
      
      // Añadir uiType y options si existen en la definición del paso siguiente
      if (nextLogic && nextLogic.uiType) {
        response.uiType = nextLogic.uiType;
      }
      if (nextLogic && nextLogic.options) {
        response.options = nextLogic.options;
      }
      
      return response;

    } catch (error) {
      logger.error("Error en el Orquestador:", error);
      return { 
        error: "Hubo un error procesando su solicitud." 
      };
    }
  }

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
      const { data: empresaData } = await supabase
        .from('empresas')
        .select('*')
        .eq('solicitud_id', sessionId)
        .single();

      // Obtener documentos
      const { data: documentosData } = await supabase
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
      logger.error("Error obteniendo datos del resumen:", error);
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
      logger.log(`📧 Email de confirmación enviado a: ${solicitudData.email}`);
      logger.log(`📋 Código de seguimiento: ${trackingCode}`);

      return {
        success: true,
        trackingCode: trackingCode,
        message: 'Solicitud enviada exitosamente'
      };

    } catch (error) {
      logger.error("Error completando el envío:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default OrquestadorWally;
