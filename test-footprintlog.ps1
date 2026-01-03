# PowerShell script to test all FootprintLog APIs with login
# Usage: Run in PowerShell from the project root

$baseUrl = "http://localhost:5000/api"
$email = "dolarjay3454@gmail.com"
$password = "Dolar@1234"

function Login {
    $body = @{ email = $email; password = $password } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
    return $response.token
}

function Test-FootprintLogAPI {
    param([string]$token)
    
    $headers = @{ Authorization = "Bearer $token" }
    
    try {
        Write-Host "🧪 Testing Footprint Log API Endpoints..." -ForegroundColor Cyan
        
        # Test 1: Get all logs
        Write-Host "`n1. Testing GET /api/footprintlog" -ForegroundColor Yellow
        $logs = Invoke-RestMethod -Uri "$baseUrl/footprintlog" -Headers $headers
        Write-Host "✅ Retrieved $($logs.Count) logs" -ForegroundColor Green
        
        # Test 2: Get total emissions
        Write-Host "`n2. Testing GET /api/footprintlog/total" -ForegroundColor Yellow
        $total = Invoke-RestMethod -Uri "$baseUrl/footprintlog/total" -Headers $headers
        Write-Host "✅ Total emissions: $($total.total) kg CO₂" -ForegroundColor Green
        
        # Test 3: Get breakdown by activity type
        Write-Host "`n3. Testing GET /api/footprintlog/breakdown/activityType" -ForegroundColor Yellow
        $activityBreakdown = Invoke-RestMethod -Uri "$baseUrl/footprintlog/breakdown/activityType" -Headers $headers
        Write-Host "✅ Activity type breakdown: $($activityBreakdown.Count) categories" -ForegroundColor Green
        
        # Test 4: Get breakdown by category
        Write-Host "`n4. Testing GET /api/footprintlog/breakdown/category" -ForegroundColor Yellow
        $categoryBreakdown = Invoke-RestMethod -Uri "$baseUrl/footprintlog/breakdown/category" -Headers $headers
        Write-Host "✅ Category breakdown: $($categoryBreakdown.Count) categories" -ForegroundColor Green
        
        # Test 5: Create a new log
        Write-Host "`n5. Testing POST /api/footprintlog" -ForegroundColor Yellow
        $testLog = @{
            activity = "Test car commute - PowerShell"
            activityType = "transport"
            category = "transportation"
            details = @{
                quantity = 15
                unit = "miles"
                fuelType = "gasoline"
                passengers = 1
                method = "car"
            }
            tags = @("test", "transport", "car")
        } | ConvertTo-Json -Depth 3
        
        $newLog = Invoke-RestMethod -Uri "$baseUrl/footprintlog" -Method Post -Body $testLog -Headers $headers -ContentType "application/json"
        Write-Host "✅ Created new log with ID: $($newLog._id), Emission: $($newLog.emission) kg CO₂" -ForegroundColor Green
        
        if ($newLog._id) {
            # Test 6: Get log by ID
            Write-Host "`n6. Testing GET /api/footprintlog/$($newLog._id)" -ForegroundColor Yellow
            $retrievedLog = Invoke-RestMethod -Uri "$baseUrl/footprintlog/$($newLog._id)" -Headers $headers
            Write-Host "✅ Retrieved log: $($retrievedLog.activity)" -ForegroundColor Green
            
            # Test 7: Update log
            Write-Host "`n7. Testing PUT /api/footprintlog/$($newLog._id)" -ForegroundColor Yellow
            $updateData = @{
                activity = "Updated test car commute - PowerShell"
                details = @{
                    quantity = 20
                    unit = "miles"
                    fuelType = "hybrid"
                    passengers = 2
                }
            } | ConvertTo-Json -Depth 3
            
            $updatedLog = Invoke-RestMethod -Uri "$baseUrl/footprintlog/$($newLog._id)" -Method Put -Body $updateData -Headers $headers -ContentType "application/json"
            Write-Host "✅ Updated log: $($updatedLog.activity), New emission: $($updatedLog.emission) kg CO₂" -ForegroundColor Green
            
            # Test 8: Delete log
            Write-Host "`n8. Testing DELETE /api/footprintlog/$($newLog._id)" -ForegroundColor Yellow
            $deleteResult = Invoke-RestMethod -Uri "$baseUrl/footprintlog/$($newLog._id)" -Method Delete -Headers $headers
            Write-Host "✅ Deleted log: $($deleteResult.message)" -ForegroundColor Green
        }
        
        # Test 9: Test with filters
        Write-Host "`n9. Testing GET /api/footprintlog with filters" -ForegroundColor Yellow
        $filteredLogs = Invoke-RestMethod -Uri "$baseUrl/footprintlog?activityType=transport" -Headers $headers
        Write-Host "✅ Retrieved $($filteredLogs.Count) transport logs" -ForegroundColor Green
        
        Write-Host "`n🎉 All footprint log API tests completed successfully!" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
        }
    }
}

# Main execution
Write-Host "🔐 Logging in..." -ForegroundColor Cyan
try {
    $token = Login
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Test-FootprintLogAPI -token $token
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
    return $response.token
}

$token = Login
Write-Host "Logged in. Token: $token"

function Test-CreateLog {
    $body = @{ 
        activityType = "transport"
        activity     = "car trip"
        details      = @{ mode = "car"; distance = 10 }
        notes        = "Test log"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/footprintlog" -Method Post -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
}

function Test-GetLogs {
    Invoke-RestMethod -Uri "$baseUrl/footprintlog" -Method Get -Headers @{ Authorization = "Bearer $token" }
}

function Test-GetTotal {
    Invoke-RestMethod -Uri "$baseUrl/footprintlog/total" -Method Get -Headers @{ Authorization = "Bearer $token" }
}

function Test-GetBreakdown {
    Invoke-RestMethod -Uri "$baseUrl/footprintlog/breakdown/activityType" -Method Get -Headers @{ Authorization = "Bearer $token" }
    Invoke-RestMethod -Uri "$baseUrl/footprintlog/breakdown/category" -Method Get -Headers @{ Authorization = "Bearer $token" }
}

Write-Host "Creating log..."
Test-CreateLog | ConvertTo-Json | Write-Host

Write-Host "Getting all logs..."
Test-GetLogs | ConvertTo-Json | Write-Host

Write-Host "Getting total emissions..."
Test-GetTotal | ConvertTo-Json | Write-Host

Write-Host "Getting breakdowns..."
Test-GetBreakdown | ConvertTo-Json | Write-Host
