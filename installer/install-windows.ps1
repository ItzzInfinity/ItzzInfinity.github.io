# Resume Builder installer — Windows (PowerShell)
# Installs Node.js 20 LTS (via winget), the npm dependencies, and
# (optionally) the Python PDF-QA tooling. Safe to re-run.
#
# Run from a PowerShell prompt in the repo (right-click > Run with PowerShell,
# or):
#   powershell -ExecutionPolicy Bypass -File installer\install-windows.ps1

$ErrorActionPreference = "Stop"
$RepoDir = Split-Path -Parent $PSScriptRoot

function Info($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host " OK  $msg" -ForegroundColor Green }
function Fail($msg) { Write-Host " ERR $msg" -ForegroundColor Red; exit 1 }

# --- Node.js 20 -------------------------------------------------------------
$nodeOk = $false
if (Get-Command node -ErrorAction SilentlyContinue) {
    $major = (node --version).TrimStart("v").Split(".")[0] -as [int]
    if ($major -ge 18) { $nodeOk = $true; Ok "Node $(node --version) already installed" }
    else { Info "Node $(node --version) found but too old; installing Node 20 LTS ..." }
}

if (-not $nodeOk) {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Info "Installing Node.js 20 LTS via winget ..."
        winget install --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        # Pick up the PATH the installer just wrote, without reopening the shell.
        $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                    [Environment]::GetEnvironmentVariable("Path", "User")
        if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
            Fail "Node was installed but isn't on PATH yet. Open a NEW PowerShell window and re-run this script."
        }
        Ok "Node $(node --version) installed"
    }
    else {
        Fail "winget not found. Install Node.js 20 LTS manually from https://nodejs.org and re-run this script."
    }
}

# --- npm dependencies --------------------------------------------------------
Info "Installing npm dependencies in $RepoDir ..."
Push-Location $RepoDir
try {
    npm install
    if ($LASTEXITCODE -ne 0) { Fail "npm install failed" }
    Ok "npm dependencies installed"

    # --- optional: Python tooling (PyMuPDF) for resume layout QA -------------
    $py = Get-Command python -ErrorAction SilentlyContinue
    if (-not $py) { $py = Get-Command python3 -ErrorAction SilentlyContinue }
    if ($py) {
        Info "Installing Python PDF-QA tooling (PyMuPDF) ..."
        & $py.Source -m pip install -r scripts\requirements.txt
        if ($LASTEXITCODE -eq 0) {
            Ok "PyMuPDF installed (enables scripts/self-check.tsx layout verification)"
        } else {
            Write-Host "     (skipped: pip install failed - the app still works; only the" -ForegroundColor Yellow
            Write-Host "      geometric layout self-check scripts need PyMuPDF)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "     (Python not found - skipping PDF-QA tooling; the app itself doesn't need it)" -ForegroundColor Yellow
    }
}
finally { Pop-Location }

# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "All set! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "  cd $RepoDir"
Write-Host "  npm run dev             # dev server"
Write-Host ""
Write-Host "  Then open  http://localhost:3000"
Write-Host "  Edit data  http://localhost:3000/settings"
Write-Host "  Resume     http://localhost:3000/download"
Write-Host ""
Write-Host "To publish to GitHub Pages, see 'Use it with your data' in README.md."
