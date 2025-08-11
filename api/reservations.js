const { Client } = require('@notionhq/client');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Generate unique reservation ID
function generateReservationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `YGT-${timestamp}-${random}`.toUpperCase();
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    const checkInUrl = `https://${req.headers.host}/checkin/${reservationId}`;
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
      'QR Code': 'Generated QR code',
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
          url: checkInUrl // Store the check-in URL instead of QR image URL
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
};
