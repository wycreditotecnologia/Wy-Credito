$headers = @{ 'Content-Type'='application/json'; 'x-user-email'='dev@test.local' }
$startBody = @{ action = 'start' } | ConvertTo-Json
$startRes = Invoke-RestMethod -Uri http://localhost:3000/api/orchestrator -Method POST -Headers $headers -Body $startBody
Write-Host ("sessionId: " + $startRes.sessionId)

$payload = @{ currentStep = 1; stepData = @{ nit = '901685988-0'; razon_social = 'Empresa de Prueba S.A.S.'; tipo_empresa = 'SAS'; sitio_web = 'https://www.ejemplo.com' } }
$submitBody = @{ action = 'submit_form_step'; sessionId = $startRes.sessionId; payload = $payload } | ConvertTo-Json -Depth 5
$submitRes = Invoke-RestMethod -Uri http://localhost:3000/api/orchestrator -Method POST -Headers @{ 'Content-Type'='application/json' } -Body $submitBody
Write-Host ("submit ok: " + $submitRes.ok)

node scripts/query-tipo-empresa.js $startRes.sessionId