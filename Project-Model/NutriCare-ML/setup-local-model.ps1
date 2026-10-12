$ErrorActionPreference = 'Stop'
$ModelRoot = $PSScriptRoot
$VenvPython = Join-Path $ModelRoot '.venv\Scripts\python.exe'

if (-not (Test-Path -LiteralPath $VenvPython)) {
    $PythonLauncher = Get-Command py -ErrorAction SilentlyContinue
    if ($PythonLauncher) {
        & $PythonLauncher.Source -m venv (Join-Path $ModelRoot '.venv')
    } else {
        & python -m venv (Join-Path $ModelRoot '.venv')
    }
}

& $VenvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw 'Could not upgrade pip in the local model environment.' }
& $VenvPython -m pip install -r (Join-Path $ModelRoot 'requirements.txt')
if ($LASTEXITCODE -ne 0) { throw 'Could not install the local model dependencies.' }
Push-Location $ModelRoot
try {
    & $VenvPython train.py
    if ($LASTEXITCODE -ne 0) { throw 'Local model training failed.' }
} finally {
    Pop-Location
}

Write-Host 'Local NutriCare model is ready for the backend.'
