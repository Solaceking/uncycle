# Define the source directory where your images are
$sourceDir = "src\static\images\logos"

# Rename mapping
$renameMap = @{
    # Academic
    "univie*" = "logo-univie.png"
    "boku*" = "logo-boku.png"
    "university-vienna*" = "logo-univie.png"
    
    # Government
    "austria*" = "logo-austria-gov.png"
    "vienna*" = "logo-vienna-city.png"
    "wien*" = "logo-vienna-city.png"
    
    # International
    "un*" = "logo-un.png"
    "united-nations*" = "logo-un.png"
    "unep*" = "logo-unep.png"
}

# Rename files
foreach ($pattern in $renameMap.Keys) {
    Get-ChildItem -Path $sourceDir -Filter "$pattern.*" | ForEach-Object {
        $newName = Join-Path $_.Directory.FullName $renameMap[$pattern]
        if ($_.FullName -ne $newName) {
            Move-Item -Path $_.FullName -Destination $newName -Force
            Write-Host "Renamed $($_.Name) to $($renameMap[$pattern])"
        }
    }
} 