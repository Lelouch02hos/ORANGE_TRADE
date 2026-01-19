# PowerShell script to replace all hardcoded localhost:5000 URLs with API_URL variable

$files = Get-ChildItem -Path "src" -Recurse -Include *.jsx,*.js

$apiUrlDef = "const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has API_URL definition
    if ($content -match "const API_URL") {
        Write-Host "Skipping $($file.Name) - already has API_URL"
        continue
    }
    
    # Check if file has localhost:5000
    if ($content -match "http://localhost:5000") {
        Write-Host "Processing $($file.Name)..."
        
        # Replace all occurrences of 'http://localhost:5000' with ${API_URL}
        $newContent = $content -replace "'http://localhost:5000/api/", '`${API_URL}/api/'
        $newContent = $newContent -replace '"http://localhost:5000/api/', '`${API_URL}/api/'
        $newContent = $newContent -replace "'http://localhost:5000'", 'API_URL'
        $newContent = $newContent -replace '"http://localhost:5000"', 'API_URL'
        
        # Add API_URL definition after imports (before first const or function)
        if ($newContent -match "(?s)(import.*?;[\r\n]+)[\r\n]+(const|function|class|export)") {
            $newContent = $newContent -replace "(?s)(import.*?;[\r\n]+)([\r\n]+)(const|function|class|export)", "`$1`r`n$apiUrlDef`r`n`r`n`$3"
        }
        
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Done!" -ForegroundColor Cyan
