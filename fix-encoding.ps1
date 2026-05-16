$enc = New-Object System.Text.UTF8Encoding($false)
$files = @(
    Join-Path $PSScriptRoot "anexos\AnexoI_Especificaciones.tex",
    Join-Path $PSScriptRoot "anexos\AnexoII_AnalisisDiseno.tex",
    Join-Path $PSScriptRoot "anexos\AnexoIII_EstimacionPlanificacion.tex",
    Join-Path $PSScriptRoot "anexos\AnexoIV_PlanSeguridad.tex",
    Join-Path $PSScriptRoot "anexos\AnexoV_ManualesUsuario.tex"
)

# Each entry: [garbled_bytes_as_chars, correct_char]
$pairs = @(
    @([string][char]0x00C3 + [char]0x00A1, [string][char]0x00E1),  # á
    @([string][char]0x00C3 + [char]0x00A9, [string][char]0x00E9),  # é
    @([string][char]0x00C3 + [char]0x00AD, [string][char]0x00ED),  # í
    @([string][char]0x00C3 + [char]0x00B3, [string][char]0x00F3),  # ó
    @([string][char]0x00C3 + [char]0x00BA, [string][char]0x00FA),  # ú
    @([string][char]0x00C3 + [char]0x00B1, [string][char]0x00F1),  # ñ
    @([string][char]0x00C3 + [char]0x00BC, [string][char]0x00FC),  # ü
    @([string][char]0x00C3 + [char]0x2030, [string][char]0x00C9),  # É
    @([string][char]0x00C3 + [char]0x201C, [string][char]0x00D3),  # Ó
    @([string][char]0x00C3 + [char]0x2018, [string][char]0x00D1),  # Ñ
    @([string][char]0x00C3 + [char]0x0161, [string][char]0x00DA),  # Ú
    @([string][char]0x00C3 + [char]0x0081, [string][char]0x00C1),  # Á
    @([string][char]0x00C2 + [char]0x00BF, [string][char]0x00BF),  # ¿
    @([string][char]0x00C2 + [char]0x00A1, [string][char]0x00A1),  # ¡
    @([string][char]0x00C2 + [char]0x00AB, [string][char]0x00AB),  # «
    @([string][char]0x00C2 + [char]0x00BB, [string][char]0x00BB),  # »
    @([string][char]0x00C2 + [char]0x00B0, [string][char]0x00B0),  # °
    @([string][char]0x00C2 + [char]0x00B7, [string][char]0x00B7),  # ·
    @([string][char]0x00E2 + [char]0x20AC + [char]0x201D, [string][char]0x2014),  # — em dash
    @([string][char]0x00E2 + [char]0x20AC + [char]0x201C, [string][char]0x2013),  # – en dash
    @([string][char]0x00E2 + [char]0x20AC + [char]0x0153, [string][char]0x201C),  # "
    @([string][char]0x00E2 + [char]0x20AC + [char]0x009D, [string][char]0x201D)   # "
)

foreach ($file in $files) {
    $c = [System.IO.File]::ReadAllText($file, $enc)
    foreach ($pair in $pairs) {
        $c = $c.Replace($pair[0], $pair[1])
    }
    [System.IO.File]::WriteAllText($file, $c, $enc)
    Write-Host "Fixed: $(Split-Path $file -Leaf)"
}
Write-Host "Done."
