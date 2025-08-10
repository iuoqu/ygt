const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function testNotionConnection() {
  try {
    console.log('Testing Notion connection...');
    
    // Test 1: Check if we can access the database
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    });
    
    console.log('✅ Database connection successful!');
    console.log('Database name:', database.title[0]?.plain_text || 'Untitled');
    
    // Test 2: Check database properties
    console.log('\n📋 Database properties:');
    const properties = database.properties;
    
    const requiredProperties = [
      'Guest Name',
      'Reservation Date', 
      'Reservation Time',
      'Check-in Status',
      'QR Code',
      'Guest Email',
      'Guest Phone',
      'Special Requests'
    ];
    
    requiredProperties.forEach(propName => {
      if (properties[propName]) {
        console.log(`✅ ${propName}: ${properties[propName].type}`);
      } else {
        console.log(`❌ ${propName}: MISSING`);
      }
    });
    
    // Test 3: Try to create a test entry
    console.log('\n🧪 Testing reservation creation...');
    
    const testReservation = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Guest Name': {
          title: [{ text: { content: 'TEST - John Doe' } }]
        },
        'Reservation Date': {
          date: { start: '2024-12-31' }
        },
        'Reservation Time': {
          rich_text: [{ text: { content: '14:00' } }]
        },
        'Check-in Status': {
          select: { name: 'Pending' }
        },
        'QR Code': {
          url: 'https://example.com/test-qr.png'
        },
        'Guest Email': {
          email: 'test@example.com'
        },
        'Guest Phone': {
          phone_number: '+1234567890'
        },
        'Special Requests': {
          rich_text: [{ text: { content: 'Test reservation - please delete' } }]
        }
      }
    });
    
    console.log('✅ Test reservation created successfully!');
    console.log('Test reservation ID:', testReservation.id);
    
    console.log('\n🎉 All tests passed! Your Notion setup is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Delete the test reservation from your Notion database');
    console.log('2. Start your server: npm start');
    console.log('3. Visit http://localhost:3000 to test the reservation form');
    
  } catch (error) {
    console.error('❌ Error testing Notion connection:', error.message);
    
    if (error.code === 'unauthorized') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your NOTION_API_KEY in .env file');
      console.log('2. Make sure your integration has access to the database');
      console.log('3. Verify the database ID is correct');
    } else if (error.code === 'object_not_found') {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check your NOTION_DATABASE_ID in .env file');
      console.log('2. Make sure the database exists and is shared with your integration');
    }
  }
}

testNotionConnection();
