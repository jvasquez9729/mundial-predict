# Script para generar links de prueba
$body = @{
    cantidad = 10
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/links/generate" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
    $json = $response.Content | ConvertFrom-Json
    
    if ($json.success) {
        Write-Host "✅ Links generados exitosamente" -ForegroundColor Green
        Write-Host "Total: $($json.links.Count) links" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Lista de links generados:" -ForegroundColor Yellow
        Write-Host ""
        
        foreach ($link in $json.links) {
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
            Write-Host "URL: $($link.url)" -ForegroundColor White
            Write-Host "Token: $($link.token)" -ForegroundColor DarkGray
            Write-Host "Expira: $($link.expira_en)" -ForegroundColor DarkGray
            Write-Host ""
        }
        
        Write-Host "✅ Todos los links han sido guardados en la base de datos" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: $($json.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al generar links: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}
