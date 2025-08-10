require('dotenv').config();

console.log('Checking environment variables...');
console.log('NOTION_API_KEY:', process.env.NOTION_API_KEY ? 'Set (length: ' + process.env.NOTION_API_KEY.length + ')' : 'NOT SET');
console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID || 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');

if (process.env.NOTION_API_KEY) {
  console.log('\nToken starts with "secret_":', process.env.NOTION_API_KEY.startsWith('secret_'));
  console.log('Token preview:', process.env.NOTION_API_KEY.substring(0, 10) + '...');
}
