const https = require('https');

// Test the basic API endpoint
function testBasicAPI() {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'ygt2-m7770bxzf-tb2.vercel.app',
      port: 443,
      path: '/api/test',
      method: 'GET',
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Test the reservation endpoint
function testReservationAPI() {
  return new Promise((resolve, reject) => {
    const testData = {
      guestName: 'Test User',
      reservationDate: '2024-08-15',
      reservationTime: '14:00',
      guestEmail: 'test@example.com',
      guestPhone: '+1234567890',
      specialRequests: 'Test reservation'
    };

    const postData = JSON.stringify(testData);

    const req = https.request({
      hostname: 'ygt2-m7770bxzf-tb2.vercel.app',
      port: 443,
      path: '/api/reservations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🔧 Testing basic API endpoint...');
  
  try {
    const basicResult = await testBasicAPI();
    console.log('✅ Basic API result:', basicResult);
  } catch (error) {
    console.log('❌ Basic API failed:', error.message);
  }

  console.log('\n🔧 Testing reservation API endpoint...');
  
  try {
    const reservationResult = await testReservationAPI();
    console.log('✅ Reservation API result:', reservationResult);
  } catch (error) {
    console.log('❌ Reservation API failed:', error.message);
  }
}

runTests();
