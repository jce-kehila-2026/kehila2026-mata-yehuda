# Merge supportive-community into CommunityStaffDashboard without losing either feature set.
$ErrorActionPreference = "Stop"
Set-Location "C:\Users\widadra\Desktop\kehila2026-mata-yehuda"

function Read-GitBlob([string]$sha) {
  $path = Join-Path ".git\objects" ($sha.Substring(0,2)) $sha.Substring(2)
  $raw = [System.IO.File]::ReadAllBytes($path)
  $ms = New-Object System.IO.MemoryStream(,$raw[2..($raw.Length-1)])
  $zlib = New-Object System.IO.Compression.ZLibStream($ms, [System.IO.Compression.CompressionMode]::Decompress)
  $outMs = New-Object System.IO.MemoryStream
  $zlib.CopyTo($outMs)
  $text = [System.Text.Encoding]::UTF8.GetString($outMs.ToArray())
  $idx = $text.IndexOf([char]0)
  return $text.Substring($idx + 1)
}

function Read-GitTree([string]$sha) {
  $body = Read-GitBlob $sha
  $entries = @()
  $i = 0
  while ($i -lt $body.Length) {
    $space = $body.IndexOf(' ', $i)
    $mode = $body.Substring($i, $space - $i)
    $tab = $body.IndexOf([char]0, $space)
    $name = $body.Substring($space + 1, $tab - $space - 1)
    $entrySha = -join ($body.ToCharArray()[($tab + 1)..($tab + 40)] )
    # fix: get bytes for sha
    $shaBytes = [System.Text.Encoding]::ASCII.GetBytes($body).Skip($tab + 1).Take(40)
    $entrySha = [System.Text.Encoding]::ASCII.GetString([byte[]]$shaBytes)
    $entries += [pscustomobject]@{ mode = $mode; name = $name; sha = $entrySha }
    $i = $tab + 41
  }
  return $entries
}

function Walk-GitTree([string]$prefix, [string]$sha) {
  $files = @()
  foreach ($entry in (Read-GitTree $sha)) {
    $path = if ($prefix) { "$prefix/$($entry.name)" } else { $entry.name }
    if ($entry.mode -eq "40000") {
      $files += Walk-GitTree $path $entry.sha
    } elseif ($entry.mode -eq "100644") {
      $files += [pscustomobject]@{ path = $path; sha = $entry.sha }
    }
  }
  return $files
}

$log = @()
$commitSha = (Get-Content ".git\refs\heads\supportive-community" -Raw).Trim()
$commitBody = Read-GitBlob $commitSha
if ($commitBody -match 'tree ([0-9a-f]{40})') { $treeSha = $Matches[1] } else { throw "tree not found" }

$scFiles = Walk-GitTree "" $treeSha | Where-Object { $_.path -like "src/*" }
foreach ($file in $scFiles) {
  $content = Read-GitBlob $file.sha
  $outPath = Join-Path (Get-Location) $file.path
  $dir = Split-Path $outPath -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
  [System.IO.File]::WriteAllText($outPath, $content, [System.Text.Encoding]::UTF8)
  $log += "extracted: $($file.path)"
}

$appJsx = @'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import supportiveCommunityRoutes from "./routes/supportive community/supportiveCommunityRoutes";
import communityStaffRoutes from "./routes/communityStaff/communityStaffRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {supportiveCommunityRoutes.map((route) => (
          <Route
            key={`sc-${route.path}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {communityStaffRoutes.map((route) => (
          <Route
            key={`cs-${route.path}`}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
'@
Set-Content -Path "src\App.jsx" -Value $appJsx -Encoding UTF8
$log += "merged: src/App.jsx"

$staffRoutesPath = "src\routes\communityStaff\communityStaffRoutes.jsx"
$staffRoutes = Get-Content $staffRoutesPath -Raw
$staffRoutes = $staffRoutes -replace '\s*\{\s*path: "/",\s*element: <CommunityStaffDashboardPage />,\s*\},?\s*', "`n"
Set-Content -Path $staffRoutesPath -Value $staffRoutes -Encoding UTF8
$log += "merged: communityStaffRoutes.jsx (removed duplicate / route)"

$mainJsx = @'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
'@
Set-Content -Path "src\main.jsx" -Value $mainJsx -Encoding UTF8
$log += "merged: src/main.jsx"

$log | Set-Content "merge-log.txt" -Encoding UTF8
Write-Output ($log -join "`n")
