const { Client } = require('@notionhq/client');

// Initialize Notion client
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Allowed CORS origins (production + local dev). Override via env if needed.
const ALLOWED_ORIGINS = [
  'https://yugardentea.com',
  'https://www.yugardentea.com',
  'http://localhost:3000'
];

const isProduction = process.env.NODE_ENV === 'production';

function devLog(...args) {
  if (!isProduction) console.log(...args);
}

module.exports = async (req, res) => {
  // Set CORS headers based on the request origin
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    devLog('Simple reservation request received');

    const {
      guestName,
      reservationDate,
      reservationTime,
      guestEmail,
      guestPhone,
      specialRequests
    } = req.body || {};

    // Validate required fields
    if (!guestName || !reservationDate || !reservationTime) {
      return res.status(400).json({
        error: 'Guest Name, Reservation Date, and Reservation Time are required'
      });
    }

    // Basic length limits to prevent abuse
    const trimmedName = String(guestName).slice(0, 100);
    const trimmedTime = String(reservationTime).slice(0, 20);
    const trimmedEmail = guestEmail ? String(guestEmail).slice(0, 200) : null;
    const trimmedPhone = guestPhone ? String(guestPhone).slice(0, 30) : null;
    const trimmedRequests = specialRequests ? String(specialRequests).slice(0, 1000) : '';

    // Create Notion page
    const notionPage = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        'Guest Name': {
          title: [{ text: { content: trimmedName } }]
        },
        'Reservation Date': {
          date: { start: reservationDate }
        },
        'Reservation Time': {
          rich_text: [{ text: { content: trimmedTime } }]
        },
        'Check-in Status': {
          select: { name: 'Pending' }
        },
        'QR Code': {
          url: 'https://example.com/checkin'
        },
        'Guest Email': {
          email: trimmedEmail || null
        },
        'Guest Phone': {
          phone_number: trimmedPhone || null
        },
        'Special Requests': {
          rich_text: [{ text: { content: trimmedRequests } }]
        }
      }
    });

    devLog('Notion page created:', notionPage.id);

    // Return success response
    res.json({
      success: true,
      message: 'Reservation created successfully!',
      reservation: {
        guestName: trimmedName,
        reservationDate,
        reservationTime: trimmedTime,
        guestEmail: trimmedEmail,
        guestPhone: trimmedPhone,
        specialRequests: trimmedRequests,
        notionPageId: notionPage.id
      }
    });

  } catch (error) {
    // Always log full error details server-side
    console.error('Reservation creation failed:', error);

    // Return generic error message to client (no internal details)
    res.status(500).json({
      error: 'Failed to create reservation. Please try again later.'
    });
  }
};
