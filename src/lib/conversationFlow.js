// src/lib/conversationFlow.js
export const conversationFlow = [
  // FASE 1: Onboarding Personal (Pasos 0-3) - Sin cambios
  { 
    step: 0, 
    field: 'nombre_solicitante', 
    prompt: '¡Hola! Soy Wally, su asistente de crédito de Wy Crédito.\n\nVeo que deseas solicitar un crédito por un monto de {monto_formateado} COP.\n\nPara dar inicio a tu solicitud, voy a realizarte una serie de preguntas y a solicitarte algunos documentos. ¿Estás listo para empezar? Primero, ¿cuál es tu nombre completo?',
    validation: { type: 'text', minLength: 2 },
    errorMessage: 'Por favor, ingrese un nombre válido con al menos 2 caracteres.',
    nextStep: 1 
  },
  { 
    step: 1, 
    field: 'apellidos_solicitante', 
    prompt: 'Perfecto, {nombre_solicitante}. ¿Cuáles son sus apellidos?',
    validation: { type: 'text', minLength: 2 },
    errorMessage: 'Por favor, ingrese apellidos válidos con al menos 2 caracteres.',
    nextStep: 2 
  },
  { 
    step: 2, 
    field: 'email', 
    prompt: 'Excelente. ¿Cuál es su correo electrónico?',
    validation: { type: 'email' },
    errorMessage: 'Por favor, ingrese un correo electrónico válido.',
    nextStep: 3 
  },
  { 
    step: 3, 
    field: 'password', 
    prompt: 'Gracias. Para proteger su información, cree una contraseña segura (mínimo 6 caracteres):',
    validation: { type: 'text', minLength: 6 },
    errorMessage: 'La contraseña debe tener al menos 6 caracteres.',
    nextStep: 4 
  },
  // FASE 2: Info. Empresa (Pasos 4-6) - Sin cambios
  { 
    step: 4, 
    field: 'nit', 
    prompt: 'Ahora hablemos de su empresa, {nombre_solicitante}. ¿Cuál es el NIT de su empresa?',
    validation: { type: 'text', minLength: 5 },
    errorMessage: 'Por favor, ingrese un NIT válido (mínimo 5 caracteres).',
    nextStep: 5 
  },
  { 
    step: 5, 
    field: 'razon_social', 
    prompt: '¿Cuál es la razón social de su empresa?',
    validation: { type: 'text', minLength: 3 },
    errorMessage: 'Por favor, ingrese una razón social válida.',
    nextStep: 6 
  },
  { 
    step: 6, 
    field: 'tipo_empresa', 
    question: 'Perfecto. Ahora, ¿qué tipo de empresa es?',
    uiType: 'buttons', // Clave para que el frontend sepa qué renderizar
    options: ['SAS', 'LTDA', 'SA', 'Persona Natural', 'Otro'], // Las opciones para los botones
    validation: { 
      type: 'enum', // La validación ahora es contra una lista predefinida
      values: ['SAS', 'LTDA', 'SA', 'Persona Natural', 'Otro'],
      error: 'Por favor, selecciona una de las opciones válidas.'
    },
    nextStep: 7 
  },
  // FASE 3: Doc. Legal (Pasos 7-9) - Sin cambios
  { 
    step: 7, 
    field: 'nombre_rl', 
    prompt: 'Perfecto. Ahora necesitamos información del representante legal. ¿Cuál es el nombre completo del representante legal?',
    validation: { type: 'text', minLength: 3 },
    errorMessage: 'Por favor, ingrese el nombre completo del representante legal.',
    nextStep: 8 
  },
  { 
    step: 8, 
    field: 'documento_rl', 
    prompt: '¿Cuál es el número de documento del representante legal?',
    validation: { type: 'text', minLength: 6 },
    errorMessage: 'Por favor, ingrese un número de documento válido.',
    nextStep: 9 
  },
  { 
    step: 9, 
    field: 'doc_certificado_existencia', 
    prompt: 'Ahora necesito que adjunte el **Certificado de Existencia y Representación Legal** de su empresa. 📎 Use el botón de adjuntar archivo para subir el documento en formato PDF.',
    validation: { type: 'file', allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 },
    errorMessage: '{nombre_solicitante}, hubo un problema con el archivo. Asegúrese de que sea un PDF y no pese más de 10MB.',
    nextStep: 10 
  },
  
  // === FASE 4: INFORMACIÓN FINANCIERA (NUEVO) ===
  { 
    step: 10, 
    field: 'doc_declaracion_renta', 
    prompt: "Ahora, por favor, adjunte la Declaración de Renta más reciente de la empresa.", 
    validation: { type: 'file', allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 }, 
    errorMessage: "{nombre_solicitante}, hubo un problema con el archivo. Asegúrese de que sea un PDF y no pese más de 10MB.", 
    nextStep: 11, 
  }, 
  { 
    step: 11, 
    field: 'doc_estados_financieros', 
    prompt: "Muy bien. Adjunte ahora los Estados Financieros de los últimos dos años.", 
    validation: { type: 'file', allowedTypes: ['application/pdf'], maxSize: 10 * 1024 * 1024 }, 
    errorMessage: "{nombre_solicitante}, hubo un problema con el archivo. Asegúrese de que sea un PDF y no pese más de 10MB.", 
    nextStep: 12, 
  }, 

  // === FASE 5: REVISIÓN FINAL (NUEVO) ===
  { 
    step: 12, 
    field: 'confirmacion_final', 
    prompt: "¡Hemos llegado al final, {nombre_solicitante}! Hemos recolectado toda la información. ¿Confirma que desea enviar la solicitud para estudio?", 
    options: ["Sí, enviar solicitud", "No, cancelar"], 
    validation: { type: 'confirmation' }, 
    errorMessage: "Debe confirmar para poder enviar la solicitud.", 
    nextStep: 13, // El último paso 
  } 
];