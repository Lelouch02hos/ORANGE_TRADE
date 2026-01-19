# PowerShell script to fix quote mismatches

$files = Get-ChildItem -Path "src" -Recurse -Include *.jsx, *.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix the pattern: `${API_URL}/api/something' (backtick...single quote mismatch)
    if ($content -match '\`\$\{API_URL\}/.*?''') {
        Write-Host "Fixing $($file.Name)..." -ForegroundColor Yellow
        
        # Replace backtick...single quote with backtick...backtick
        $newContent = $content -replace "(\`\$\{API_URL\}/[^'`]*)'", '$1`'
        
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Fixed $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Done fixing quotes!" -ForegroundColor Cyan
