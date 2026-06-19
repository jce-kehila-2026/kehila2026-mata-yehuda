@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Copying dashboard images...
node copy-dashboard-images.js
if errorlevel 1 (
  echo.
  echo Node failed. Trying PowerShell copy...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0copy-dashboard-images.ps1"
)
echo.
echo Done. Press any key to close.
pause >nul
