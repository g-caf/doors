const http = require('http');

const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function testAPI() {
  const baseURL = 'http://localhost:3001';
  
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    });
    console.log(`   Status: ${health.status}`);
    console.log(`   Response: ${JSON.stringify(health.data, null, 2)}\n`);

    // Test API info endpoint
    console.log('2. Testing API info endpoint...');
    const apiInfo = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api',
      method: 'GET'
    });
    console.log(`   Status: ${apiInfo.status}`);
    console.log(`   Response: ${JSON.stringify(apiInfo.data, null, 2)}\n`);

    // Test employees endpoint
    console.log('3. Testing employees endpoint...');
    const employees = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/employees',
      method: 'GET'
    });
    console.log(`   Status: ${employees.status}`);
    console.log(`   Response: ${JSON.stringify(employees.data, null, 2)}\n`);

    console.log('✅ API tests completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testAPI();
