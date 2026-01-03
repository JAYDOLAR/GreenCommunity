// Simple test script to test the footprint log API endpoints
// Run this with: node test-footprintlog.js

const API_BASE_URL = 'http://localhost:5000';

// Test function to make API requests
async function testAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE', // Replace with actual token
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();
        console.log(`✅ ${options.method || 'GET'} ${endpoint}:`, response.status);
        console.log('Response:', data);
        return data;
    } catch (error) {
        console.error(`❌ ${options.method || 'GET'} ${endpoint}:`, error.message);
        return null;
    }
}

async function runTests() {
    console.log('🧪 Testing Footprint Log API Endpoints...\n');

    // Test 1: Get all logs (should work if authenticated)
    console.log('1. Testing GET /api/footprintlog');
    await testAPI('/api/footprintlog');

    console.log('\n2. Testing GET /api/footprintlog/total');
    await testAPI('/api/footprintlog/total');

    console.log('\n3. Testing GET /api/footprintlog/breakdown/activityType');
    await testAPI('/api/footprintlog/breakdown/activityType');

    console.log('\n4. Testing GET /api/footprintlog/breakdown/category');
    await testAPI('/api/footprintlog/breakdown/category');

    // Test 5: Create a new log (requires authentication)
    console.log('\n5. Testing POST /api/footprintlog');
    const testLogData = {
        activity: 'Test car commute',
        activityType: 'transport',
        category: 'transportation',
        emission: 5.2,
        details: {
            quantity: 10,
            unit: 'miles',
            fuelType: 'gasoline',
            passengers: 1
        },
        tags: ['test', 'transport-car'],
        calculation: {
            method: 'test',
            source: 'manual',
            factors: { distance: 10, fuelType: 'gasoline' }
        }
    };

    const newLog = await testAPI('/api/footprintlog', {
        method: 'POST',
        body: JSON.stringify(testLogData),
    });

    if (newLog && newLog._id) {
        console.log('\n6. Testing GET /api/footprintlog/:id');
        await testAPI(`/api/footprintlog/${newLog._id}`);

        console.log('\n7. Testing PUT /api/footprintlog/:id');
        await testAPI(`/api/footprintlog/${newLog._id}`, {
            method: 'PUT',
            body: JSON.stringify({
                activity: 'Updated test car commute',
                emission: 6.0
            }),
        });

        console.log('\n8. Testing DELETE /api/footprintlog/:id');
        await testAPI(`/api/footprintlog/${newLog._id}`, {
            method: 'DELETE',
        });
    }

    console.log('\n🎉 API testing completed!');
}

// Note: You need to replace 'YOUR_TEST_TOKEN_HERE' with an actual JWT token
// You can get this by logging in through the frontend and checking localStorage
console.log('📝 Note: Update the Authorization token in this script before running');
console.log('   You can get a token by logging in through the frontend');
console.log('   and checking localStorage.getItem("token")\n');

// Uncomment the line below to run tests
// runTests();
