const https = require('https');

// Test the simple endpoint first
const testSimple = () => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'ygt2-q476n7ni1-tb2.vercel.app',
      port: 443,
      path: '/api/test',
      method: 'GET',
      timeout: 10000
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
};

// Test the Notion endpoint
const testNotion = () => {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'ygt2-q476n7ni1-tb2.vercel.app',
      port: 443,
      path: '/api/test-notion',
      method: 'GET',
      timeout: 10000
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
};

async function runTests() {
  console.log('🔧 Testing basic server functionality...');
  
  try {
    const simpleResult = await testSimple();
    console.log('✅ Simple test result:', simpleResult);
  } catch (error) {
    console.log('❌ Simple test failed:', error.message);
  }

  console.log('\n🔧 Testing Notion API...');
  
  try {
    const notionResult = await testNotion();
    console.log('✅ Notion test result:', notionResult);
  } catch (error) {
    console.log('❌ Notion test failed:', error.message);
  }
}

runTests();
