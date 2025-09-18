const http = require('http');
const fs = require('fs');
const path = require('path');

const baseURL = process.env.TEST_URL || 'http://localhost:3000';

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Guest Check-in System API...\n');

  try {
    // Test health endpoint
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    });
    
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.status === 200) {
      console.log('   ✅ Health check passed\n');
    } else {
      console.log('   ❌ Health check failed\n');
    }

    // Test employees endpoint
    console.log('2️⃣ Testing employees endpoint...');
    const employeesResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/employees',
      method: 'GET'
    });
    
    console.log(`   Status: ${employeesResponse.status}`);
    if (employeesResponse.status === 200) {
      const employees = JSON.parse(employeesResponse.body);
      console.log(`   ✅ Found ${employees.length} employees\n`);
    } else {
      console.log('   ❌ Failed to fetch employees\n');
    }

    // Test admin login
    console.log('3️⃣ Testing admin login...');
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);
    
    console.log(`   Status: ${loginResponse.status}`);
    if (loginResponse.status === 200) {
      console.log('   ✅ Admin login successful\n');
    } else {
      console.log('   ❌ Admin login failed\n');
    }

    // Test static pages
    console.log('4️⃣ Testing static pages...');
    
    const pages = [
      { path: '/', name: 'Kiosk page' },
      { path: '/admin', name: 'Admin login page' }
    ];

    for (const page of pages) {
      const pageResponse = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: page.path,
        method: 'GET'
      });
      
      console.log(`   ${page.name}: ${pageResponse.status === 200 ? '✅' : '❌'} (${pageResponse.status})`);
    }

    console.log('\n🎉 API testing completed!');
    console.log('\nTo manually test the application:');
    console.log('- Open http://localhost:3000 for the kiosk interface');
    console.log('- Open http://localhost:3000/admin for admin login');
    console.log('- Use credentials: admin / admin123');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the server is running with: npm start');
    process.exit(1);
  }
}

// Run tests
testAPI();
