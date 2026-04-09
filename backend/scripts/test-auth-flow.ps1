# Script PowerShell para probar el flujo completo de autenticación
# Usage: .\test-auth-flow.ps1

$API_URL = "https://localhost:3000/api"
$TEST_USER = "testuser_$(Get-Date -Format 'yyyyMMddHHmmss')"
$TEST_EMAIL = "test_$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$TEST_PASSWORD = "TestPass123"

Write-Host "🧪 Testing Authentication Flow" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Disable SSL certificate validation for localhost testing
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) {
            return true;
        }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy

# 1. Register
Write-Host "1️⃣  Testing REGISTER..." -ForegroundColor Yellow
$registerBody = @{
    username = $TEST_USER
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
    fullName = "Test User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" `
        -Method POST `
        -Body $registerBody `
        -ContentType "application/json" `
        -SkipCertificateCheck
    
    Write-Host "Response:" -ForegroundColor Gray
    $registerResponse | ConvertTo-Json -Depth 3
    
    $accessToken = $registerResponse.accessToken
    $refreshToken = $registerResponse.refreshToken
    $userId = $registerResponse.user.id
    
    if ($accessToken) {
        Write-Host "✅ Register successful - Access token received" -ForegroundColor Green
    } else {
        Write-Host "❌ Register failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Register failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Make authenticated request
Write-Host "2️⃣  Testing AUTHENTICATED REQUEST (get profile)..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $profileResponse = Invoke-RestMethod -Uri "$API_URL/auth/me" `
        -Method GET `
        -Headers $headers `
        -SkipCertificateCheck
    
    Write-Host "Response:" -ForegroundColor Gray
    $profileResponse | ConvertTo-Json -Depth 3
    
    if ($profileResponse.user) {
        Write-Host "✅ Authenticated request successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Authenticated request failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Authenticated request failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 3. Test refresh token
Write-Host "3️⃣  Testing REFRESH TOKEN..." -ForegroundColor Yellow
try {
    $refreshBody = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    $refreshResponse = Invoke-RestMethod -Uri "$API_URL/auth/refresh" `
        -Method POST `
        -Body $refreshBody `
        -ContentType "application/json" `
        -SkipCertificateCheck
    
    Write-Host "Response:" -ForegroundColor Gray
    $refreshResponse | ConvertTo-Json -Depth 3
    
    $newAccessToken = $refreshResponse.accessToken
    
    if ($newAccessToken) {
        Write-Host "✅ Token refresh successful" -ForegroundColor Green
        $accessToken = $newAccessToken
    } else {
        Write-Host "❌ Token refresh failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Token refresh failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Test with refreshed token
Write-Host "4️⃣  Testing REQUEST WITH REFRESHED TOKEN..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $profileResponse2 = Invoke-RestMethod -Uri "$API_URL/auth/me" `
        -Method GET `
        -Headers $headers `
        -SkipCertificateCheck
    
    Write-Host "Response:" -ForegroundColor Gray
    $profileResponse2 | ConvertTo-Json -Depth 3
    
    if ($profileResponse2.user) {
        Write-Host "✅ Request with refreshed token successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Request with refreshed token failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Request with refreshed token failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Test rate limiting
Write-Host "5️⃣  Testing RATE LIMITING (should fail after 5 attempts)..." -ForegroundColor Yellow
$rateLimitHit = $false
for ($i = 1; $i -le 6; $i++) {
    try {
        $loginBody = @{
            username = "invalid$i"
            password = "invalid"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" `
            -Method POST `
            -Body $loginBody `
            -ContentType "application/json" `
            -SkipCertificateCheck `
            -ErrorAction Stop
        
        Write-Host "   Attempt $i..." -ForegroundColor Gray
    } catch {
        if ($_.Exception.Message -like "*Too many*") {
            Write-Host "✅ Rate limiting working (attempt $i blocked)" -ForegroundColor Green
            $rateLimitHit = $true
            break
        }
        Write-Host "   Attempt $i failed (expected)..." -ForegroundColor Gray
    }
}

if (-not $rateLimitHit) {
    Write-Host "⚠️  Rate limiting not triggered in 6 attempts" -ForegroundColor Yellow
}

Write-Host ""

# 6. Test logout
Write-Host "6️⃣  Testing LOGOUT..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }
    
    $logoutBody = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    $logoutResponse = Invoke-RestMethod -Uri "$API_URL/auth/logout" `
        -Method POST `
        -Headers $headers `
        -Body $logoutBody `
        -ContentType "application/json" `
        -SkipCertificateCheck
    
    Write-Host "Response:" -ForegroundColor Gray
    $logoutResponse | ConvertTo-Json -Depth 3
    
    if ($logoutResponse.message) {
        Write-Host "✅ Logout successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Logout failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Logout failed: $_" -ForegroundColor Red
}

Write-Host ""

# 7. Test that refresh token is revoked
Write-Host "7️⃣  Testing REVOKED REFRESH TOKEN (should fail)..." -ForegroundColor Yellow
try {
    $refreshBody2 = @{
        refreshToken = $refreshToken
    } | ConvertTo-Json
    
    $refreshResponse2 = Invoke-RestMethod -Uri "$API_URL/auth/refresh" `
        -Method POST `
        -Body $refreshBody2 `
        -ContentType "application/json" `
        -SkipCertificateCheck `
        -ErrorAction Stop
    
    Write-Host "❌ Revoked token was not rejected" -ForegroundColor Red
} catch {
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host $_.Exception.Message -ForegroundColor Gray
    Write-Host "✅ Revoked token correctly rejected" -ForegroundColor Green
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "✅ All tests completed!" -ForegroundColor Green
