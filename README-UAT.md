# README UAT (v9.4)

1. URL de Acceso
- https://<staging-domain>

2. Credenciales (Magic Link)
- Acceder a `https://<staging-domain>/login`
- Ingresar un correo de prueba (ej. qa@tudominio.com) y solicitar Magic Link
- Abrir el enlace recibido en el correo para iniciar sesión

3. Escenario de Prueba 1 (Legal - "El Momento Mágico")
- Ir a Paso 2 (Legal)
- Subir un PDF de "Certificado de Existencia" (solo `application/pdf`, ≤10MB)
- Verificar (A): La IA extrae NIT y Razón Social en el formulario
- Verificar (B): El ChatWidget envía un mensaje proactivo confirmando el NIT

4. Escenario de Prueba 2 (Financiero - "El Cerebro")
- Ir a Paso 3 (Finanzas)
- Subir un PDF de "Estados Financieros" (solo `application/pdf`, ≤10MB)
- Verificar (A): La IA extrae el JSON (ej. `balance_sheet`) y se muestra en el formulario
- Verificar (B): El ChatWidget envía un mensaje proactivo confirmando la extracción

