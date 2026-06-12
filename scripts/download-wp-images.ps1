# ============================================================
# download-wp-images.ps1
# Downloads ALL images from rankuplus.com WordPress media library
# Preserves folder structure under public\wp-content\uploads\
# Run from project root: .\scripts\download-wp-images.ps1
# ============================================================

$BaseDir   = "$PSScriptRoot\..\public\wp-content\uploads"
$ApiBase   = "https://rankuplus.com/wp-json/wp/v2/media"
$PerPage   = 100
$MaxPages  = 30   # safety cap (100 * 30 = 3000 images max)
$allUrls   = @{}  # deduplicated url -> local relative path

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RankUp WordPress Image Downloader" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Collect all source_url from all pages ─────────────────────────────
Write-Host "📡 Fetching media list from WordPress API..." -ForegroundColor Yellow

$page = 1
$totalCollected = 0

while ($page -le $MaxPages) {
    $url = "$ApiBase`?per_page=$PerPage&page=$page&_fields=source_url&orderby=date&order=desc"
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -ErrorAction Stop
        $items = $resp.Content | ConvertFrom-Json
        
        if ($items.Count -eq 0) {
            Write-Host "  ✅ No more pages after page $($page - 1)" -ForegroundColor Green
            break
        }

        foreach ($item in $items) {
            $srcUrl = $item.source_url
            if ($srcUrl -and !$allUrls.ContainsKey($srcUrl)) {
                # Extract path after /wp-content/uploads/
                if ($srcUrl -match "wp-content/uploads/(.+)$") {
                    $relPath = $matches[1] -replace "/", "\"
                    $allUrls[$srcUrl] = $relPath
                    $totalCollected++
                }
            }
        }

        Write-Host "  Page $page : $($items.Count) items collected (total so far: $totalCollected)"
        
        # Check if there are more pages via X-WP-TotalPages header
        $totalPages = $resp.Headers["X-WP-TotalPages"]
        if ($totalPages -and $page -ge [int]$totalPages) {
            Write-Host "  ✅ All $totalPages pages fetched." -ForegroundColor Green
            break
        }

        $page++
        Start-Sleep -Milliseconds 300  # be polite to the server
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  ✅ Reached end of pages at page $page" -ForegroundColor Green
            break
        }
        Write-Host "  ⚠️  Error on page ${page}: $_" -ForegroundColor Red
        break
    }
}

Write-Host ""
Write-Host "📦 Total unique images found: $($allUrls.Count)" -ForegroundColor Cyan
Write-Host ""

# ── Step 2: Download each image ───────────────────────────────────────────────
$downloaded = 0
$skipped    = 0
$failed     = 0
$i          = 0

foreach ($entry in $allUrls.GetEnumerator()) {
    $i++
    $srcUrl   = $entry.Key
    $relPath  = $entry.Value
    $destPath = Join-Path $BaseDir $relPath
    $destDir  = Split-Path $destPath -Parent

    # Progress bar
    $pct = [math]::Round(($i / $allUrls.Count) * 100)
    Write-Progress -Activity "Downloading images" -Status "$i / $($allUrls.Count) — $pct%" -PercentComplete $pct

    # Skip if already exists
    if (Test-Path $destPath) {
        $skipped++
        continue
    }

    # Create directory if needed
    if (!(Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }

    # Download
    try {
        Invoke-WebRequest -Uri $srcUrl -OutFile $destPath -UseBasicParsing -ErrorAction Stop
        $downloaded++
        $fileSize = (Get-Item $destPath).Length
        $fileSizeKB = [math]::Round($fileSize / 1024, 1)
        Write-Host "  ✅ [$i/$($allUrls.Count)] ${relPath} (${fileSizeKB} KB)" -ForegroundColor Green
    }
    catch {
        $failed++
        Write-Host "  ❌ [$i/$($allUrls.Count)] FAILED: $srcUrl" -ForegroundColor Red
        Write-Host "     Error: $_" -ForegroundColor DarkRed
    }

    # Small delay to avoid hammering server
    Start-Sleep -Milliseconds 100
}

Write-Progress -Activity "Downloading images" -Completed

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Download Complete!" -ForegroundColor Green
Write-Host "  ✅ Downloaded : $downloaded" -ForegroundColor Green
Write-Host "  ⏭️  Skipped   : $skipped (already existed)" -ForegroundColor Yellow
Write-Host "  ❌ Failed     : $failed" -ForegroundColor Red
Write-Host "  📁 Saved to  : $BaseDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($failed -gt 0) {
    Write-Host "⚠️  Some files failed. Re-run the script to retry them." -ForegroundColor Yellow
}
