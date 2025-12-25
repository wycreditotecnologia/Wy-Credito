# Script para mostrar las variables de entorno que necesitas configurar en Vercel
# NO COMPARTAS LA SALIDA DE ESTE SCRIPT - Contiene información sensible

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Variables de Entorno para Vercel" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ADVERTENCIA: Esta información es SENSIBLE" -ForegroundColor Yellow
Write-Host "NO la compartas públicamente" -ForegroundColor Yellow
Write-Host ""

# Variables requeridas
$requiredVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY"
)

$envFile = ".env.local"

if (Test-Path $envFile) {
    Write-Host "Archivo .env.local encontrado" -ForegroundColor Green
    Write-Host ""
    
    # Leer todas las variables del archivo
    $envVars = @{}
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.+)$') {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    Write-Host "VARIABLES REQUERIDAS EN VERCEL:" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($varName in $requiredVars) {
        Write-Host "Variable: " -NoNewline -ForegroundColor Yellow
        Write-Host $varName -ForegroundColor White
        
        if ($envVars.ContainsKey($varName)) {
            Write-Host "Valor:    " -NoNewline -ForegroundColor Yellow
            Write-Host $envVars[$varName] -ForegroundColor Green
            Write-Host "Estado:   " -NoNewline -ForegroundColor Yellow
            Write-Host "CONFIGURADA" -ForegroundColor Green
        }
        else {
            Write-Host "Estado:   " -NoNewline -ForegroundColor Yellow
            Write-Host "FALTA - DEBES AGREGARLA" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Instrucciones:" -ForegroundColor Cyan
    Write-Host "1. Ve a Vercel Dashboard -> Tu Proyecto -> Settings -> Environment Variables"
    Write-Host "2. Para cada variable arriba, haz click en Add New"
    Write-Host "3. Copia el nombre y valor exactamente como aparecen"
    Write-Host "4. Selecciona Production, Preview y Development"
    Write-Host "5. Click en Save"
    Write-Host ""
    
    # Verificar si faltan variables de Turnstile
    if (-not $envVars.ContainsKey("NEXT_PUBLIC_TURNSTILE_SITE_KEY") -or -not $envVars.ContainsKey("TURNSTILE_SECRET_KEY")) {
        Write-Host "IMPORTANTE: Faltan variables de Cloudflare Turnstile" -ForegroundColor Red
        Write-Host ""
        Write-Host "Para obtener las claves de Turnstile:" -ForegroundColor Yellow
        Write-Host "1. Ve a: https://dash.cloudflare.com/?to=/:account/turnstile"
        Write-Host "2. Crea un nuevo sitio o selecciona el existente"
        Write-Host "3. Copia el Site Key y Secret Key"
        Write-Host "4. Agregalo a tu .env.local y a Vercel"
        Write-Host ""
    }
    
    Write-Host "Después de configurar, haz un nuevo deploy desde Vercel" -ForegroundColor Green
    
}
else {
    Write-Host "Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio correcto del proyecto"
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
