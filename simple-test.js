const { Client } = require('@notionhq/client');
require('dotenv').config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function simpleTest() {
  try {
    console.log('Testing Notion API connection...');
    console.log('Token:', process.env.NOTION_API_KEY.substring(0, 10) + '...');
    console.log('Database ID:', process.env.NOTION_DATABASE_ID);
    
    // Simple test - just try to retrieve the database
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    });
    
    console.log('✅ SUCCESS! Connected to database:', database.title[0]?.plain_text || 'Untitled');
    console.log('Database properties:', Object.keys(database.properties));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
    
    if (error.code === 'unauthorized') {
      console.log('\n🔧 Solution: Check your integration token and make sure the database is shared with your integration.');
    } else if (error.code === 'object_not_found') {
      console.log('\n🔧 Solution: Check your database ID and make sure the database exists.');
    } else if (error.message.includes('ECONNRESET')) {
      console.log('\n🔧 Solution: Network issue. Try again or check your internet connection.');
    }
  }
}

simpleTest();
