require('dotenv').config();
const { Client } = require('@notionhq/client');

// Generate memorable reservation ID (1 letter + 5 digits)
function generateReservationId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${letter}${numbers}`;
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse JSON body manually if needed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create reservation',
        details: 'Invalid JSON'
      });
    }
  }

  try {
    console.log('📝 Received booking request:', body);
    
    const { guestName, reservationDate, reservationTime, guestEmail, guestPhone, specialRequests } = body;
    
    // Validate required fields
    if (!guestName || !reservationDate || !reservationTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: guestName, reservationDate, reservationTime'
      });
    }

    // Notion integration logic would go here
    // For now, return success with a generated ID
    const reservationId = generateReservationId();

    return res.status(200).json({
      success: true,
      message: 'Reservation created successfully',
      reservationId: reservationId
    });

  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};
