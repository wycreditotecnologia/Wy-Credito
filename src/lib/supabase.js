import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Modo de desarrollo - usar cliente mock si no hay configuración
const isDevelopment = import.meta.env.DEV || !supabaseUrl || !supabaseAnonKey

let supabase = null
let supabaseAdmin = null

if (!isDevelopment && supabaseUrl && supabaseAnonKey) {
  // Cliente público (anon key)
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Cliente administrativo (service role key) - solo si está configurado
  if (supabaseServiceRoleKey) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    logger.log('✅ Cliente administrativo de Supabase configurado')
  }
} else {
  logger.warn('Modo desarrollo: Usando cliente Supabase simulado')
  // Cliente mock para desarrollo
  const mockClient = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null })
    })
  }
  supabase = mockClient
  supabaseAdmin = mockClient
}

export { supabase, supabaseAdmin }

/**
 * Verifica si el cliente administrativo está disponible
 * @returns {boolean} - True si está configurado
 */
export function isAdminAvailable() {
  return supabaseAdmin !== null && supabaseServiceRoleKey && supabaseServiceRoleKey !== 'your-service-role-key-here'
}

/**
 * Obtiene el cliente apropiado según el tipo de operación
 * @param {boolean} requiresAdmin - Si requiere permisos administrativos
 * @returns {Object} - Cliente de Supabase
 */
export function getSupabaseClient(requiresAdmin = false) {
  if (requiresAdmin && isAdminAvailable()) {
    return supabaseAdmin
  }
  return supabase
}

// Funciones auxiliares para el manejo de datos

/**
 * Operaciones administrativas que requieren service role key
 */

/**
 * Obtener estadísticas administrativas (requiere service role)
 * @returns {Promise<Object>} - Estadísticas del sistema
 */
export async function obtenerEstadisticasAdmin() {
  if (!isAdminAvailable()) {
    logger.warn('Service Role Key no configurada - usando datos simulados')
    return {
      success: true,
      data: {
        total_solicitudes: 0,
        solicitudes_pendientes: 0,
        solicitudes_aprobadas: 0,
        solicitudes_rechazadas: 0
      }
    }
  }

  try {
    const client = getSupabaseClient(true) // Usar cliente administrativo
    
    const { data, error } = await client
      .from('solicitudes_credito')
      .select('estado')
    
    if (error) throw error
    
    const stats = data.reduce((acc, solicitud) => {
      acc.total_solicitudes++
      acc[`solicitudes_${solicitud.estado}`] = (acc[`solicitudes_${solicitud.estado}`] || 0) + 1
      return acc
    }, { total_solicitudes: 0 })
    
    return { success: true, data: stats }
  } catch (error) {
    logger.error('Error obteniendo estadísticas:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Crear una nueva solicitud de crédito
 * @param {Object} solicitudData - Datos de la solicitud
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function crearSolicitud(solicitudData) {
  try {
    // En modo desarrollo, simular la creación
    if (import.meta.env.DEV) {
      const solicitudSimulada = {
        id: Date.now(),
        ...solicitudData,
        codigo_seguimiento: await generarCodigoSeguimiento(),
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        estado: solicitudData.estado || 'incompleta'
      }
      
      logger.log('Solicitud simulada creada:', solicitudSimulada)
      return { success: true, data: solicitudSimulada }
    }

    const { data, error } = await supabase
      .from('solicitudes')
      .insert([{
        ...solicitudData,
        codigo_seguimiento: await generarCodigoSeguimiento(),
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    logger.error('Error al crear solicitud:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Actualizar una solicitud existente
 * @param {string} id - ID de la solicitud
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function actualizarSolicitud(id, updateData) {
  try {
    // En modo desarrollo, simular la actualización
    if (import.meta.env.DEV) {
      const solicitudActualizada = {
        id,
        ...updateData,
        fecha_actualizacion: new Date().toISOString()
      }
      
      logger.log('Solicitud simulada actualizada:', solicitudActualizada)
      return { success: true, data: solicitudActualizada }
    }

    const { data, error } = await supabase
      .from('solicitudes')
      .update({
        ...updateData,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    logger.error('Error al actualizar solicitud:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene una solicitud por email
 * @param {string} email - Email del solicitante
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const obtenerSolicitudPorEmail = async (email) => {
  try {
    // En modo desarrollo, simular búsqueda
    if (import.meta.env.DEV) {
      logger.log('Buscando solicitud simulada para email:', email)
      // Simular que no hay solicitud existente para permitir crear nueva
      return { success: true, data: null }
    }

    const { data, error } = await supabase
      .from('solicitudes')
      .select('*')
      .eq('email_solicitante', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
    return { success: true, data: data || null }
  } catch (error) {
    logger.error('Error al obtener solicitud:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Guardar mensaje en la conversación
 * @param {string} solicitudId - ID de la solicitud
 * @param {Object} mensajeData - Datos del mensaje
 * @returns {Promise<Object>} - Resultado de la operación
 */
export async function guardarMensaje(solicitudId, mensajeData) {
  try {
    // En modo desarrollo, simular guardado
    if (import.meta.env.DEV) {
      const mensajeSimulado = {
        id: Date.now(),
        solicitud_id: solicitudId,
        ...mensajeData,
        fecha_mensaje: new Date().toISOString()
      }
      
      logger.log('Mensaje simulado guardado:', mensajeSimulado)
      return { success: true, data: mensajeSimulado }
    }

    const { data, error } = await supabase
      .from('conversaciones')
      .insert([{
        solicitud_id: solicitudId,
        ...mensajeData,
        fecha_mensaje: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

  return { success: true, data }
  } catch (error) {
    logger.error('Error al guardar mensaje:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtiene los campos faltantes de una solicitud
 * @param {Object} solicitud - Datos de la solicitud
 * @returns {Array} - Array de campos faltantes
 */
export const obtenerCamposFaltantes = (solicitud) => {
  const camposRequeridos = [
    { campo: 'email_solicitante', nombre: 'Email del solicitante', categoria: 'contacto' },
    { campo: 'nit', nombre: 'NIT de la empresa', categoria: 'empresa' },
    { campo: 'razon_social', nombre: 'Razón social', categoria: 'empresa' },
    { campo: 'tipo_empresa', nombre: 'Tipo de empresa', categoria: 'empresa' },
    { campo: 'telefono_empresa', nombre: 'Teléfono de la empresa', categoria: 'empresa' },
    { campo: 'direccion_empresa', nombre: 'Dirección de la empresa', categoria: 'empresa' },
    { campo: 'ciudad', nombre: 'Ciudad', categoria: 'empresa' },
    { campo: 'departamento', nombre: 'Departamento', categoria: 'empresa' },
    { campo: 'nombre_representante', nombre: 'Nombre del representante legal', categoria: 'representante' },
    { campo: 'apellido_representante', nombre: 'Apellido del representante legal', categoria: 'representante' },
    { campo: 'tipo_documento_rl', nombre: 'Tipo de documento del representante legal', categoria: 'representante' },
    { campo: 'numero_documento_rl', nombre: 'Número de documento del representante legal', categoria: 'representante' },
    { campo: 'telefono_rl', nombre: 'Teléfono del representante legal', categoria: 'representante' },
    { campo: 'email_rl', nombre: 'Email del representante legal', categoria: 'representante' },
    { campo: 'monto_solicitado', nombre: 'Monto solicitado', categoria: 'financiera' },
    { campo: 'plazo_solicitado', nombre: 'Plazo solicitado', categoria: 'financiera' },
    { campo: 'destino_credito', nombre: 'Destino del crédito', categoria: 'financiera' },
    { campo: 'ingresos_mensuales', nombre: 'Ingresos mensuales', categoria: 'financiera' },
    { campo: 'egresos_mensuales', nombre: 'Egresos mensuales', categoria: 'financiera' },
    { campo: 'patrimonio', nombre: 'Patrimonio', categoria: 'financiera' }
  ]

  return camposRequeridos.filter(campo => !solicitud[campo.campo] || solicitud[campo.campo] === '')
}

/**
 * Genera un código de seguimiento único
 * @returns {Promise<string>} - Código de seguimiento
 */
const generarCodigoSeguimiento = async () => {
  const año = new Date().getFullYear()
  const numero = Math.floor(Math.random() * 999999).toString().padStart(6, '0')
  return `WY-${año}-${numero}`
}