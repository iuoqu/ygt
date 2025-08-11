module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({ 
    message: 'Serverless function is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    notionApiKey: !!process.env.NOTION_API_KEY,
    notionDatabaseId: !!process.env.NOTION_DATABASE_ID
  });
};
