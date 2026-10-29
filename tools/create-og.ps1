Add-Type -AssemblyName System.Drawing
$target = Join-Path $PSScriptRoot '..\public\assets\img\og.png'
$bitmap = New-Object System.Drawing.Bitmap 1200,630
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#E9E2D6'))
$darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#1B1A19'))
$taupeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#A89F92'))
$creamBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#E9E2D6'))
$graphics.FillEllipse($taupeBrush,760,-150,560,820)
$graphics.FillEllipse($darkBrush,900,-70,500,850)
$font = New-Object System.Drawing.Font 'Segoe UI',78
$smallFont = New-Object System.Drawing.Font 'Segoe UI',27
$graphics.DrawString('AziFit Studio',$font,$darkBrush,70,125)
$graphics.DrawString('студия для всей семьи',$smallFont,$darkBrush,80,270)
$graphics.DrawString('Акжунис 12, Алматы',$smallFont,$darkBrush,80,345)
for ($index=0; $index -lt 12; $index++) { $graphics.FillEllipse($taupeBrush,(85+$index*42),510,15,15) }
$bitmap.Save($target,[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$bitmap.Dispose()
$font.Dispose()
$smallFont.Dispose()
$darkBrush.Dispose()
$taupeBrush.Dispose()
$creamBrush.Dispose()
Write-Output 'Created og.png: 1200 x 630'
