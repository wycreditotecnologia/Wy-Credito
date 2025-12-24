import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Default fallback
  let next = '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // --- 🚪 EL PORTERO INTELIGENTE (Doorman Logic) ---

          // Consultar estados de solicitudes del usuario
          const { data: solicitudes } = await supabase
            .from('solicitudes')
            .select('estado')
            .eq('user_id', user.id)

          // Definir qué estados se consideran "Proceso Activo"
          // Incluimos variaciones comunes (borrador, en_revision, aprobado...)
          const activeStates = ['borrador', 'submitted', 'en_revision', 'en_estudio', 'aprobado']

          const hasHistory = solicitudes && solicitudes.length > 0
          const hasActiveRequest = solicitudes?.some((s: any) => activeStates.includes(s.estado))

          if (!hasHistory) {
            // ESCENARIO A: Nuevo Usuario (0 solicitudes) -> Wizard (Directo al grano)
            next = '/solicitud'
          } else if (hasActiveRequest) {
            // ESCENARIO B: Trámite en Curso -> Dashboard (Tracking)
            next = '/dashboard'
          } else {
            // ESCENARIO C: Todo Finalizado/Rechazado -> Wizard (Pedir nuevo cupo)
            next = '/solicitud'
          }

          console.log(`[AUTH DOORMAN] User: ${user.id} | Active: ${hasActiveRequest} -> Redirect: ${next}`)
        }
      } catch (err) {
        console.error("[AUTH DOORMAN] Error checking requests:", err)
        // En caso de error, fallback seguro al Dashboard
        next = '/dashboard'
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=AuthCallbackError`)
}
