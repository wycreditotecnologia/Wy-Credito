$headers = @{ 'Content-Type'='application/json'; 'x-user-email'='dev@test.local' }
$startBody = @{ action = 'start' } | ConvertTo-Json
$startRes = Invoke-RestMethod -Uri http://localhost:3003/api/orchestrator -Method POST -Headers $headers -Body $startBody
Write-Host ("sessionId: " + $startRes.sessionId)

$payload = @{ currentStep = 2; stepData = @{ nit = '9016859886-0'; razon_social = 'Mi Empresa S.A.S.'; tipo_empresa = 'SAS'; sitio_web = 'https://www.ejemplo.com'; redes_sociales = @{ linkedin = 'https://www.linkedin.com/company/miempresa'; instagram = 'https://www.instagram.com/miempresa'; facebook = 'https://www.facebook.com/miempresa' } } }
$submitBody = @{ action = 'submit_form_step'; sessionId = $startRes.sessionId; payload = $payload } | ConvertTo-Json -Depth 8

try {
  $submitRes = Invoke-WebRequest -Uri http://localhost:3003/api/orchestrator -Method POST -Headers @{ 'Content-Type'='application/json' } -Body $submitBody -UseBasicParsing
  Write-Host ("submit status: " + $submitRes.StatusCode)
  Write-Host ("submit body: " + $submitRes.Content)
} catch {
  Write-Host ("submit error: " + $_.Exception.Message)
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host ("submit error body: " + $body)
  }
}

node scripts/query-tipo-empresa.js $startRes.sessionId