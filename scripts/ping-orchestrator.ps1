try {
  $r = Invoke-WebRequest -Uri http://localhost:3000/api/orchestrator -Method GET -TimeoutSec 5
  Write-Host ("status: " + $r.StatusCode)
  Write-Host ("content-type: " + $r.Headers['Content-Type'])
  Write-Host ("length: " + ($r.Content.Length))
} catch {
  Write-Host ("error: " + $_.Exception.Message)
}