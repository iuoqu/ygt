const { Client } = require('@notionhq/client');
require('dotenv').config();

async function testNotionDatabase() {
  console.log('🔧 Testing Notion Database Configuration...');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('- NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY);
  console.log('- NOTION_API_KEY length:', process.env.NOTION_API_KEY?.length || 0);
  console.log('- NOTION_DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID);
  console.log('- NOTION_DATABASE_ID value:', process.env.NOTION_DATABASE_ID);
  
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    console.log('❌ Missing environment variables');
    return;
  }
  
  try {
    // Initialize Notion client
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    console.log('✅ Notion client initialized');
    
    // Retrieve database
    console.log('\n🔍 Retrieving database...');
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    });
    
    console.log('✅ Database retrieved successfully');
    console.log('- Database ID:', database.id);
    console.log('- Database Title:', database.title[0]?.plain_text || 'Unknown');
    
    // Check all properties
    console.log('\n📊 Database Properties:');
    const properties = database.properties;
    const propertyNames = Object.keys(properties);
    
    console.log(`Total properties: ${propertyNames.length}`);
    
    for (const propName of propertyNames) {
      const prop = properties[propName];
      console.log(`\n🔸 Property: "${propName}"`);
      console.log(`   Type: ${prop.type}`);
      
      if (prop.type === 'select') {
        console.log(`   Select options:`, prop.select?.options?.map(opt => opt.name) || []);
      } else if (prop.type === 'title') {
        console.log(`   Title configuration: OK`);
      } else if (prop.type === 'date') {
        console.log(`   Date configuration: OK`);
      } else if (prop.type === 'rich_text') {
        console.log(`   Rich text configuration: OK`);
      } else if (prop.type === 'email') {
        console.log(`   Email configuration: OK`);
      } else if (prop.type === 'phone_number') {
        console.log(`   Phone number configuration: OK`);
      } else if (prop.type === 'url') {
        console.log(`   URL configuration: OK`);
      }
    }
    
    // Check required properties
    console.log('\n✅ Required Properties Check:');
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
    
    const missingProperties = [];
    const existingProperties = [];
    
    for (const requiredProp of requiredProperties) {
      if (propertyNames.includes(requiredProp)) {
        console.log(`✅ "${requiredProp}" - EXISTS`);
        existingProperties.push(requiredProp);
      } else {
        console.log(`❌ "${requiredProp}" - MISSING`);
        missingProperties.push(requiredProp);
      }
    }
    
    // Test creating a simple page
    console.log('\n🧪 Testing page creation...');
    try {
      const testPage = await notion.pages.create({
        parent: { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          'Guest Name': {
            title: [{ text: { content: 'TEST USER' } }]
          },
          'Reservation Date': {
            date: { start: '2024-08-15' }
          },
          'Reservation Time': {
            rich_text: [{ text: { content: '14:00' } }]
          },
          'Check-in Status': {
            select: { name: 'Pending' }
          },
          'QR Code': {
            url: 'https://test.com'
          },
          'Guest Email': {
            email: 'test@example.com'
          },
          'Guest Phone': {
            phone_number: '+1234567890'
          },
          'Special Requests': {
            rich_text: [{ text: { content: 'Test request' } }]
          }
        }
      });
      
      console.log('✅ Test page created successfully!');
      console.log('- Page ID:', testPage.id);
      
      // Clean up - delete the test page
      console.log('\n🧹 Cleaning up test page...');
      await notion.pages.update({
        page_id: testPage.id,
        archived: true
      });
      console.log('✅ Test page archived');
      
    } catch (pageError) {
      console.error('❌ Failed to create test page:', pageError.message);
      console.error('Error details:', {
        code: pageError.code,
        status: pageError.status,
        body: pageError.body
      });
    }
    
  } catch (error) {
    console.error('❌ Notion API Error:', error.message);
    console.error('Error details:', {
      code: error.code,
      status: error.status,
      body: error.body
    });
  }
}

testNotionDatabase();
