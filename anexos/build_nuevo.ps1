## Build script for DocumentChain TFG final annexes (_NUEVO)
## Usage:
##   .\build_nuevo.ps1
##   .\build_nuevo.ps1 -OnlyDiagrams
##   .\build_nuevo.ps1 -OnlyLatex

param(
    [switch]$OnlyDiagrams,
    [switch]$OnlyLatex
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $ScriptDir

# Memoria extra para LuaLaTeX: necesario para Anexo III (89 diagramas) y Anexo VI (41 págs)
$env:main_memory = '12000000'
$env:extra_mem_top = '12000000'
$env:font_mem_size = '12000000'

try {
    if (-not $OnlyLatex) {
        Write-Host ''
        Write-Host '========================================' -ForegroundColor Cyan
        Write-Host '  Step 1: Generating PlantUML diagrams' -ForegroundColor Cyan
        Write-Host '========================================' -ForegroundColor Cyan

        if (-not (Test-Path 'plantuml.jar')) {
            Write-Host 'ERROR: plantuml.jar not found in anexos/ folder' -ForegroundColor Red
            exit 1
        }

        $javaCommand = Get-Command java -ErrorAction SilentlyContinue
        if (-not $javaCommand) {
            Write-Host 'ERROR: Java not found. Install JDK and add it to PATH.' -ForegroundColor Red
            exit 1
        }

        java -jar plantuml.jar -tpng -charset UTF-8 .\diagramas\*.puml
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'ERROR: PlantUML generation failed' -ForegroundColor Red
            exit 1
        }

        $pngs = (Get-ChildItem .\diagramas\*.png -ErrorAction SilentlyContinue).Count
        Write-Host "  Diagrams ready: $pngs PNG files in diagramas\\" -ForegroundColor Green
    }

    if ($OnlyDiagrams) {
        Write-Host 'Done (diagrams only).' -ForegroundColor Green
        exit 0
    }

    Write-Host ''
    Write-Host '========================================' -ForegroundColor Cyan
    Write-Host '  Step 2: Compiling final _NUEVO docs' -ForegroundColor Cyan
    Write-Host '========================================' -ForegroundColor Cyan

    $docs = @(
        'MemoriaPrincipal_DocumentChain_NUEVO.tex',
        'AnexoI_EspecificacionRequisitos_NUEVO.tex',
        'AnexoII_EstimacionTamanioEsfuerzo_NUEVO.tex',
        'AnexoIII_AnalisisDiseno_NUEVO.tex',
        'AnexoIV_DocumentacionTecnica_NUEVO.tex',
        'AnexoV_PlanSeguridad_NUEVO.tex',
        'AnexoVI_ManualUsuario_NUEVO.tex',
        'AnexoVII_ManualMontaje_NUEVO.tex',
        'AnexoVIII_UsoIA_NUEVO.tex',
        'AnexoIX_DisenoCentradoUsuario_NUEVO.tex'
    )

    foreach ($tex in $docs) {
        if (-not (Test-Path $tex)) {
            Write-Host "Skipping (not found): $tex" -ForegroundColor Yellow
            continue
        }

        Write-Host ''
        Write-Host "Compiling $tex ..." -ForegroundColor White

        for ($i = 1; $i -le 2; $i++) {
            lualatex -interaction=nonstopmode -halt-on-error $tex | Out-Null
            if ($LASTEXITCODE -ne 0) {
                Write-Host "  ERROR on pass $i for $tex" -ForegroundColor Red
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
            Write-Host "  OK -> $pdf (${size} KB)" -ForegroundColor Green
        }
    }

    Write-Host ''
    Write-Host '========================================' -ForegroundColor Green
    Write-Host '  All done (_NUEVO series)!' -ForegroundColor Green
    Write-Host '========================================' -ForegroundColor Green
}
finally {
    Pop-Location
}
