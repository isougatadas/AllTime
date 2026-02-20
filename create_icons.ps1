# WorldSync Clock - Icon Generator Script
# Resizes icon.png (placed in the same folder as this script) into
# icons/icon16.png, icons/icon48.png, and icons/icon128.png.
#
# Usage:
#   1. Place your source icon (any size PNG) next to this script and name it icon.png
#   2. Right-click this script -> "Run with PowerShell"
#      OR in PowerShell:  .\create_icons.ps1

Add-Type -AssemblyName System.Drawing

# ── Paths ──────────────────────────────────────────────────────────────────
$ScriptDir = $PSScriptRoot
$SourcePath = Join-Path $ScriptDir "icon.png"
$OutputDir = Join-Path $ScriptDir "icons"

# ── Validate source file ────────────────────────────────────────────────────
if (-not (Test-Path $SourcePath)) {
    Write-Error "Source icon not found: $SourcePath`nPlease place your source PNG next to this script and name it 'icon.png'."
    exit 1
}

# ── Create output folder if needed ─────────────────────────────────────────
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory $OutputDir | Out-Null
}

# ── Load source image ───────────────────────────────────────────────────────
$src = [System.Drawing.Image]::FromFile($SourcePath)

# ── Resize and save each size ──────────────────────────────────────────────
foreach ($size in @(16, 48, 128)) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)

    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Draw source image scaled to fill the target size
    $g.DrawImage($src, 0, 0, $size, $size)

    $outPath = Join-Path $OutputDir "icon${size}.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()

    Write-Host "Created: $outPath"
}

$src.Dispose()

Write-Host ""
Write-Host "All icons generated successfully in: $OutputDir"
Write-Host "You can now load the extension in Chrome or Edge."
