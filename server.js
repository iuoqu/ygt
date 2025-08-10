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

// Generate unique reservation ID
function generateReservationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `YGT-${timestamp}-${random}`.toUpperCase();
}

// Create reservation endpoint
app.post('/api/reservations', async (req, res) => {
  try {
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
      return res.status(400).json({
        error: 'Guest Name, Reservation Date, and Reservation Time are required'
      });
    }

    // Generate unique reservation ID
    const reservationId = generateReservationId();
    
    // Create check-in URL
    const checkInUrl = isProduction 
      ? `https://${req.get('host')}/checkin/${reservationId}`
      : `${req.protocol}://${req.get('host')}/checkin/${reservationId}`;
    
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

    // Save QR code to file
    const qrFileName = `qr-${reservationId}.png`;
    const qrFilePath = path.join(uploadsDir, qrFileName);
    fs.writeFileSync(qrFilePath, qrCodeBuffer);
    
    // QR code URL for Notion
    const qrCodeUrl = isProduction 
      ? `https://${req.get('host')}/uploads/${qrFileName}`
      : `${req.protocol}://${req.get('host')}/uploads/${qrFileName}`;

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
    console.error('Reservation creation error:', error);
    console.error('Environment variables check:');
    console.error('NOTION_API_KEY exists:', !!process.env.NOTION_API_KEY);
    console.error('NOTION_DATABASE_ID exists:', !!process.env.NOTION_DATABASE_ID);
    console.error('NOTION_DATABASE_ID value:', process.env.NOTION_DATABASE_ID);
    
    res.status(500).json({
      error: 'Failed to create reservation',
      details: error.message,
      debug: {
        hasApiKey: !!process.env.NOTION_API_KEY,
        hasDatabaseId: !!process.env.NOTION_DATABASE_ID,
        databaseId: process.env.NOTION_DATABASE_ID
      }
    });
  }
});

// Test Notion API endpoint
app.get('/api/test-notion', async (req, res) => {
  try {
    console.log('Testing Notion API...');
    console.log('API Key exists:', !!process.env.NOTION_API_KEY);
    console.log('Database ID exists:', !!process.env.NOTION_DATABASE_ID);
    console.log('Database ID:', process.env.NOTION_DATABASE_ID);
    
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID
    });
    
    res.json({
      success: true,
      message: 'Notion API is working!',
      database: {
        id: database.id,
        title: database.title[0]?.plain_text || 'Untitled',
        properties: Object.keys(database.properties)
      }
    });
  } catch (error) {
    console.error('Notion API test error:', error);
    res.status(500).json({
      error: 'Notion API test failed',
      details: error.message,
      debug: {
        hasApiKey: !!process.env.NOTION_API_KEY,
        hasDatabaseId: !!process.env.NOTION_DATABASE_ID,
        databaseId: process.env.NOTION_DATABASE_ID
      }
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
app.listen(PORT, () => {
  console.log(`Yu Garden Tea Reservation Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to make a reservation`);
});
