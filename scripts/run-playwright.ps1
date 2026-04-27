param(
    [ValidateSet('chromium', 'firefox', 'webkit')]
    [string]$Project = 'chromium',
    [string[]]$Arguments = @(),
    [switch]$InstallBrowser
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

Push-Location (Join-Path $repoRoot 'frontend')
try {
    if ($InstallBrowser) {
        & npx playwright install $Project
        if ($LASTEXITCODE -ne 0) {
            exit $LASTEXITCODE
        }
    }

    $commandArgs = @('playwright', 'test', "--project=$Project") + $Arguments
    & npx @commandArgs
    exit $LASTEXITCODE
} finally {
    Pop-Location
}