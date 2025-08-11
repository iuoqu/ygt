const express = require('express');
const { Client } = require('@notionhq/client');
const QRCode = require('qrcode');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory (for reservation system)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/reserve', express.static(path.join(__dirname, 'public')));

// Serve static files from root directory (for main website)
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')));
app.use('/script.js', express.static(path.join(__dirname, 'script.js')));
app.use('/coupon.html', express.static(path.join(__dirname, 'coupon.html')));
app.use('/sitemap.xml', express.static(path.join(__dirname, 'sitemap.xml')));
app.use('/robots.txt', express.static(path.join(__dirname, 'robots.txt')));
app.use('/.htaccess', express.static(path.join(__dirname, '.htaccess')));

// Ensure public/uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test POST endpoint
app.post('/api/test-post', (req, res) => {
  console.log('=== TEST POST REQUEST ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', req.headers);
  
  res.json({
    success: true,
    message: 'POST request received successfully',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

// Test Notion API endpoint
app.get('/api/test-notion', async (req, res) => {
  try {
    console.log('=== NOTION API TEST START ===');
    console.log('Environment variables:');
    console.log('- NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY);
    console.log('- NOTION_API_KEY length:', process.env.NOTION_API_KEY?.length || 0);
    console.log('- NOTION_DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID);
    console.log('- NOTION_DATABASE_ID value:', process.env.NOTION_DATABASE_ID);
    
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
      console.log('❌ Missing environment variables');
      return res.status(500).json({
        error: 'Notion API credentials not configured',
        NOTION_API_KEY: !!process.env.NOTION_API_KEY,
        NOTION_DATABASE_ID: !!process.env.NOTION_DATABASE_ID,
        message: 'Please add NOTION_API_KEY and NOTION_DATABASE_ID to Vercel environment variables'
      });
    }
    
    console.log('🔧 Testing Notion client initialization...');
    const testNotion = new Client({ auth: process.env.NOTION_API_KEY });
    console.log('✅ Notion client created');
    
    console.log('🔧 Testing database retrieval...');
    const database = await testNotion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    });
    
    console.log('✅ Database retrieved successfully');
    console.log('Database title:', database.title[0]?.plain_text || 'Unknown');
    console.log('Database properties:', Object.keys(database.properties));
    console.log('=== NOTION API TEST SUCCESS ===');
    
    res.json({
      success: true,
      message: 'Notion API is working correctly',
      database: {
        id: database.id,
        title: database.title[0]?.plain_text || 'Unknown',
        properties: Object.keys(database.properties)
      }
    });
  } catch (error) {
    console.error('=== NOTION API TEST FAILED ===');
    console.error('❌ Notion API test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      body: error.body
    });
    
    res.status(500).json({
      error: 'Notion API Error',
      message: error.message,
      code: error.code,
      status: error.status,
      details: 'Check Vercel logs for more information'
    });
  }
});

// Generate unique reservation ID
function generateReservationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `YGT-${timestamp}-${random}`.toUpperCase();
}

// Create reservation endpoint
app.post('/api/reservations', async (req, res) => {
  try {
    console.log('=== RESERVATION REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Environment variables check:');
    console.log('- NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY);
    console.log('- NOTION_DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID);
    console.log('- NOTION_DATABASE_ID value:', process.env.NOTION_DATABASE_ID);
    
    const {
      guestName,
      reservationDate,
      reservationTime,
      guestEmail,
      guestPhone,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!guestName || !reservationDate || !reservationTime) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        error: 'Guest Name, Reservation Date, and Reservation Time are required'
      });
    }

    console.log('✅ Validation passed');
    console.log('🔧 Generating reservation ID...');
    
    // Generate unique reservation ID
    const reservationId = generateReservationId();
    console.log('✅ Generated reservation ID:', reservationId);
    
    // Create check-in URL
    const checkInUrl = isProduction 
      ? `https://${req.get('host')}/checkin/${reservationId}`
      : `${req.protocol}://${req.get('host')}/checkin/${reservationId}`;
    
    console.log('✅ Check-in URL:', checkInUrl);
    
    console.log('🔧 Generating QR code...');
    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(checkInUrl, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#5A3E2B',
        light: '#F5F3EF'
      }
    });

    console.log('✅ QR code generated');
    console.log('🔧 Skipping QR code file save (using URL directly)...');
    
    // Use check-in URL directly instead of saving QR file
    const qrCodeUrl = checkInUrl;

    console.log('✅ Using check-in URL as QR code URL:', qrCodeUrl);
    console.log('🔧 Testing Notion connection...');
    
    // Test Notion connection first
    try {
      const database = await notion.databases.retrieve({
        database_id: process.env.NOTION_DATABASE_ID
      });
      console.log('✅ Notion database connection successful');
      console.log('Database title:', database.title[0]?.plain_text || 'Unknown');
      console.log('Available properties:', Object.keys(database.properties));
      
      // Check if required properties exist
      const requiredProperties = ['Guest Name', 'Reservation Date', 'Reservation Time', 'Check-in Status', 'QR Code', 'Guest Email', 'Guest Phone', 'Special Requests'];
      const availableProperties = Object.keys(database.properties);
      
      console.log('Checking required properties...');
      for (const prop of requiredProperties) {
        if (availableProperties.includes(prop)) {
          console.log(`✅ Property "${prop}" exists`);
        } else {
          console.log(`❌ Property "${prop}" MISSING`);
        }
      }
      
    } catch (notionError) {
      console.error('❌ Notion database connection failed:', notionError);
      throw new Error(`Notion database connection failed: ${notionError.message}`);
    }
    
    console.log('🔧 Creating Notion page...');
    console.log('Page properties to create:', {
      'Guest Name': guestName,
      'Reservation Date': reservationDate,
      'Reservation Time': reservationTime,
      'Check-in Status': 'Pending',
      'QR Code': qrCodeUrl,
      'Guest Email': guestEmail || '',
      'Guest Phone': guestPhone || '',
      'Special Requests': specialRequests || ''
    });
    // Create Notion page
    const notionPage = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Guest Name': {
          title: [{ text: { content: guestName } }]
        },
        'Reservation Date': {
          date: { start: reservationDate }
        },
        'Reservation Time': {
          rich_text: [{ text: { content: reservationTime } }]
        },
        'Check-in Status': {
          select: { name: 'Pending' }
        },
        'QR Code': {
          url: qrCodeUrl
        },
        'Guest Email': {
          email: guestEmail || ''
        },
        'Guest Phone': {
          phone_number: guestPhone || ''
        },
        'Special Requests': {
          rich_text: [{ text: { content: specialRequests || '' } }]
        }
      }
    });

    console.log('✅ Notion page created successfully!');
    console.log('Page ID:', notionPage.id);
    console.log('=== RESERVATION REQUEST SUCCESS ===');
    
    // Return success response
    res.json({
      success: true,
      reservation: {
        id: reservationId,
        guestName,
        reservationDate,
        reservationTime,
        guestEmail,
        guestPhone,
        specialRequests,
        qrCodeUrl,
        checkInUrl,
        notionPageId: notionPage.id
      }
    });

  } catch (error) {
    console.error('=== RESERVATION REQUEST FAILED ===');
    console.error('❌ Error creating reservation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      body: error.body,
      stack: error.stack
    });
    
    res.status(500).json({
      error: 'Failed to create reservation',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
});

// Check-in page endpoint
app.get('/checkin/:reservationId', (req, res) => {
  const { reservationId } = req.params;
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-in - Yu Garden Tea</title>
      <style>
        body {
          font-family: 'Playfair Display', serif;
          background: #F5F3EF;
          color: #5A3E2B;
          text-align: center;
          padding: 2rem;
          margin: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 2rem;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        h1 { color: #5A3E2B; }
        .reservation-id {
          background: #D6C6B9;
          padding: 1rem;
          border-radius: 5px;
          font-family: monospace;
          font-size: 1.2rem;
          margin: 1rem 0;
        }
        .status {
          color: #8B4513;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Yu Garden Tea - Check-in</h1>
        <p>Reservation ID: <span class="reservation-id">${reservationId}</span></p>
        <p class="status">Please show this page to our staff for check-in.</p>
        <p>Thank you for choosing Yu Garden Tea!</p>
      </div>
    </body>
    </html>
  `);
});

// Serve the main Yu Garden Tea website
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the reservation form at /reserve
app.get('/reserve', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server starting...`);
  console.log(`📡 Yu Garden Tea Reservation Server running on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏭 Production mode: ${isProduction}`);
  console.log(`🔑 Notion API Key exists: ${!!process.env.NOTION_API_KEY}`);
  console.log(`🗄️ Notion Database ID exists: ${!!process.env.NOTION_DATABASE_ID}`);
  console.log(`✅ Server ready to accept requests!`);
});
