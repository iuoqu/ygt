const https = require('https');

const testData = {
  guestName: 'Test User',
  reservationDate: '2024-08-15',
  reservationTime: '14:00',
  guestEmail: 'test@example.com',
  guestPhone: '+1234567890',
  specialRequests: 'Test reservation'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'ygt2-gv8ruy3se-tb2.vercel.app',
  port: 443,
  path: '/api/reservations',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  },
  timeout: 30000
};

console.log('🔧 Testing reservation endpoint directly...');
console.log('URL:', `https://${options.hostname}${options.path}`);
console.log('Data:', testData);

const req = https.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode}`);
  console.log(`📡 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📡 Response Body:');
    try {
      const jsonResponse = JSON.parse(data);
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.on('timeout', () => {
  console.error('❌ Request timeout');
});

req.write(postData);
req.end();
