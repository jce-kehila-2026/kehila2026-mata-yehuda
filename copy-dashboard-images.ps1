$src = Join-Path $env:USERPROFILE 'Downloads'
$dest = Join-Path $PSScriptRoot 'public\images\community-staff-dashboard'
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$map = @{
  'clipboard_illustration.png' = 'clipboard.png'
  'hands_heart_illustration.png' = 'hands-heart.png'
  'volunteer_character_illustration.png' = 'volunteer-character.png'
  'people_illustration.png' = 'people-group.png'
  'puzzle_illustration.png' = 'puzzle.png'
  'megaphone_illustration.png' = 'megaphone.png'
}

$report = @()
foreach ($entry in $map.GetEnumerator()) {
  $from = Join-Path $src $entry.Key
  $to = Join-Path $dest $entry.Value
  if (Test-Path -LiteralPath $from) {
    Copy-Item -LiteralPath $from -Destination $to -Force
    $size = (Get-Item -LiteralPath $to).Length
    $report += "OK: $($entry.Value) ($size bytes)"
  } else {
    $report += "MISSING: $($entry.Key)"
  }
}

$landscape = Get-ChildItem -LiteralPath $src -File -Filter '*.png' |
  Where-Object { $_.Name -match 'ChatGPT|landscape|footer' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($landscape) {
  Copy-Item -LiteralPath $landscape.FullName -Destination (Join-Path $dest 'landscape-footer.png') -Force
  $report += "OK: landscape-footer.png from $($landscape.Name) ($($landscape.Length) bytes)"
} else {
  $report += 'MISSING: landscape image (ChatGPT Image*.png)'
}

$report | Out-File -FilePath (Join-Path $PSScriptRoot 'copy-dashboard-images-report.txt') -Encoding utf8
$report | ForEach-Object { Write-Host $_ }
