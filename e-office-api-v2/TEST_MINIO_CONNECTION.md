# Test MinIO Connection via SKL Upload API

## 1. Buat Pengajuan SKL
```powershell
$createResponse = Invoke-RestMethod -Uri "http://localhost:3001/skl/mahasiswa/pengajuan" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"mahasiswaId":1}' `
  -SessionVariable session

$pengajuanId = $createResponse.data.id
Write-Output "Pengajuan ID: $pengajuanId"
```

## 2. Upload File ke MinIO
```powershell
# Buat dummy file PDF untuk test
$testFilePath = "test-ktm.pdf"
"Test KTM Content" | Out-File $testFilePath

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"ktm.pdf`"",
    "Content-Type: application/pdf$LF",
    [System.IO.File]::ReadAllText($testFilePath),
    "--$boundary",
    "Content-Disposition: form-data; name=`"pengajuan_id`"$LF",
    "$pengajuanId",
    "--$boundary",
    "Content-Disposition: form-data; name=`"jenis_dokumen`"$LF",
    "KTM",
    "--$boundary--$LF"
) -join $LF

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:3001/skl/lampiran/upload" `
  -Method POST `
  -ContentType "multipart/form-data; boundary=$boundary" `
  -Body $bodyLines `
  -WebSession $session

Write-Output $uploadResponse
```

## 3. Cek File di MinIO Console
Buka http://localhost:9001
- Login: minioadmin/minioadmin
- Browse bucket: e-office-storage
- Cek folder: skl/ktm/
- File harus muncul disana

## Simple Health Check
```powershell
# Cek MinIO API
Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" | Select-Object StatusCode

# Expected: StatusCode = 200
```
