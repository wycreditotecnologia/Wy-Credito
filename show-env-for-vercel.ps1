# Script para mostrar las variables de entorno que necesitas configurar en Vercel
# NO COMPARTAS LA SALIDA DE ESTE SCRIPT - Contiene información sensible

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Variables de Entorno para Vercel" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ADVERTENCIA: Esta información es SENSIBLE" -ForegroundColor Yellow
Write-Host "NO la compartas públicamente" -ForegroundColor Yellow
Write-Host ""

$envFile = ".env.local"

if (Test-Path $envFile) {
    Write-Host "Archivo .env.local encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "Copia estas variables a Vercel:" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.+)$') {
            $key = $matches[1]
            $value = $matches[2]
            
            # Mostrar la variable
            Write-Host "Variable: " -NoNewline -ForegroundColor Yellow
            Write-Host $key -ForegroundColor White
            Write-Host "Valor:    " -NoNewline -ForegroundColor Yellow
            Write-Host $value -ForegroundColor Green
            Write-Host ""
        }
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
    Write-Host "Después de configurar, haz un nuevo deploy desde Vercel" -ForegroundColor Green
    
}
else {
    Write-Host "Archivo .env.local no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio correcto del proyecto"
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
