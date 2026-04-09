## Build script for DocumentChain TFG annexes
## Run this script to extract + generate PlantUML diagrams and compile all LaTeX annexes
## Usage: .\build.ps1

param(
    [switch]$OnlyDiagrams,  # Only generate diagrams, do not compile LaTeX
    [switch]$OnlyLatex      # Only compile LaTeX, do not regenerate diagrams
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Push-Location $ScriptDir

try {
    # -----------------------------------------------------------------------
    # Step 1: Generate diagrams
    # -----------------------------------------------------------------------
    if (-not $OnlyLatex) {
        Write-Host ''
        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host '  Step 1: Extracting & generating diagrams' -ForegroundColor Cyan
        Write-Host '========================================' -ForegroundColor Cyan

        if (-not (Test-Path 'plantuml.jar')) {
            Write-Host 'ERROR: plantuml.jar not found in anexos/ folder' -ForegroundColor Red
            exit 1
        }

        $javaCommand = Get-Command java -ErrorAction SilentlyContinue
        if (-not $javaCommand) {
            Write-Host 'ERROR: Java not found. Install JDK and add to PATH.' -ForegroundColor Red
            exit 1
        }

        python extract_diagrams.py
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'ERROR: extract_diagrams.py failed' -ForegroundColor Red
            exit 1
        }

        $pngs = (Get-ChildItem diagramas\*.png -ErrorAction SilentlyContinue).Count
        Write-Host "  Diagrams ready: $pngs PNG files in diagramas\" -ForegroundColor Green
    }

    if ($OnlyDiagrams) {
        Write-Host 'Done (diagrams only).' -ForegroundColor Green
        exit 0
    }

    # -----------------------------------------------------------------------
    # Step 2: Compile LaTeX annexes
    # -----------------------------------------------------------------------
    Write-Host ''
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host '  Step 2: Compiling LaTeX annexes' -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan

    $annexes = @(
        'AnexoI_Especificaciones.tex',
        'AnexoII_AnalisisDiseno.tex',
        'AnexoIII_EstimacionPlanificacion.tex',
        'AnexoIV_PlanSeguridad.tex',
        'AnexoV_ManualesUsuario.tex',
        'AnexoVI_GuiaProgramadorDefensa.tex'
    )

    foreach ($tex in $annexes) {
        if (-not (Test-Path $tex)) {
            Write-Host "Skipping (not found): $tex" -ForegroundColor Yellow
            continue
        }

        Write-Host ''
        Write-Host "Compiling $tex ..." -ForegroundColor White

        # Run twice for cross-references
        for ($i = 1; $i -le 2; $i++) {
            lualatex -interaction=nonstopmode -halt-on-error $tex | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ERROR on pass $i for $tex" -ForegroundColor Red
                # Show last 30 lines of log
                $logFile = $tex -replace '\.tex$', '.log'
                if (Test-Path $logFile) {
                    Write-Host '  --- Last 30 lines of log ---' -ForegroundColor Yellow
                    Get-Content $logFile -Tail 30
                }
                exit 1
            }
        }

        $pdf = $tex -replace '\.tex$', '.pdf'
        if (Test-Path $pdf) {
            $size = [math]::Round((Get-Item $pdf).Length / 1KB)
            Write-Host "  OK -> $pdf  (${size} KB)" -ForegroundColor Green
        }
    }

    Write-Host ''
    Write-Host '========================================' -ForegroundColor Green
    Write-Host '  All done!' -ForegroundColor Green
    Write-Host '========================================' -ForegroundColor Green

} finally {
    Pop-Location
}
