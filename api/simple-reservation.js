const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

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
    console.log('=== SIMPLE RESERVATION REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
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
    console.log('🔧 Creating Notion page...');

    // Create Notion page - SIMPLE VERSION
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
          url: 'https://example.com/checkin'
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
    console.log('=== SIMPLE RESERVATION REQUEST SUCCESS ===');
    
    // Return success response
    res.json({
      success: true,
      message: 'Reservation created successfully!',
      reservation: {
        guestName,
        reservationDate,
        reservationTime,
        guestEmail,
        guestPhone,
        specialRequests,
        notionPageId: notionPage.id
      }
    });

  } catch (error) {
    console.error('=== SIMPLE RESERVATION REQUEST FAILED ===');
    console.error('❌ Error creating reservation:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      body: error.body
    });
    
    res.status(500).json({
      error: 'Failed to create reservation',
      details: error.message,
      code: error.code || 'UNKNOWN'
    });
  }
};
