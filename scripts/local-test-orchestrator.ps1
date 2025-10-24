$headers = @{ 'Content-Type'='application/json'; 'x-user-email'='dev@test.local' }
$startBody = @{ action = 'start' } | ConvertTo-Json
$startRes = Invoke-RestMethod -Uri http://localhost:3002/api/orchestrator -Method POST -Headers $headers -Body $startBody
Write-Host ("sessionId: " + $startRes.sessionId)

$payload = @{ currentStep = 2; stepData = @{ nit = '9016859886-0'; razon_social = 'Mi Empresa S.A.S.'; sitio_web = 'https://www.ejemplo.com'; redes_sociales = @{ linkedin = 'https://www.linkedin.com/company/miempresa'; instagram = 'https://www.instagram.com/miempresa'; facebook = 'https://www.facebook.com/miempresa' } } }
$submitBody = @{ action = 'submit_form_step'; sessionId = $startRes.sessionId; payload = $payload } | ConvertTo-Json -Depth 8
$submitRes = Invoke-RestMethod -Uri http://localhost:3002/api/orchestrator -Method POST -Headers @{ 'Content-Type'='application/json' } -Body $submitBody
Write-Host ("ok: " + $submitRes.ok + " nextStep: " + $submitRes.nextStep)