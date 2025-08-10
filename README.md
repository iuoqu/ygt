# Yu Garden Tea - Website & Reservation System

A complete website and reservation system for Yu Garden Tea, featuring SEO optimization, QR code generation, and Notion integration.

## Features

### Website (Static)
- **SEO Optimized**: Meta tags, Open Graph, Twitter Cards, structured data
- **Responsive Design**: Mobile-first approach with modern UI
- **Interactive Elements**: Monthly rotating QR codes, Google Maps integration
- **Coupon System**: Personalized coupon generation with QR codes

### Reservation System (Node.js/Express)
- **Form Handling**: Complete reservation form with validation
- **QR Code Generation**: Automatic QR code creation for check-in
- **Notion Integration**: Stores all reservations in Notion database
- **Check-in System**: Unique URLs for guest check-in

## Project Structure

```
ygt2/
├── index.html              # Main website
├── styles.css              # Website styling
├── script.js               # Website JavaScript
├── coupon.html             # Coupon generation page
├── server.js               # Express server (reservation system)
├── package.json            # Node.js dependencies
├── public/
│   ├── index.html          # Reservation form
│   └── uploads/            # Generated QR codes
├── api/
│   └── log-coupon-notion.js # Notion API for coupons
├── sitemap.xml             # SEO sitemap
├── robots.txt              # SEO robots file
├── .htaccess               # Server configuration
└── env.example             # Environment variables template
```

## Quick Start

### Website (Static)
1. Open `index.html` in a web browser
2. Add your images to the `images/` folder
3. Deploy to any static hosting service

### Reservation System
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your Notion API credentials
   ```

3. Start the server:
   ```bash
   npm start
   # or for development: npm run dev
   ```

4. Visit `http://localhost:3000` to access the reservation form

## Notion Database Setup

Create a Notion database with these properties:
- **Guest Name** (title)
- **Reservation Date** (date)
- **Reservation Time** (rich_text)
- **Check-in Status** (select: Pending, Checked-in, Cancelled)
- **QR Code** (url)
- **Guest Email** (email)
- **Guest Phone** (phone_number)
- **Special Requests** (rich_text)

## Environment Variables

Create a `.env` file with:
```
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
PORT=3000
```

## Image Requirements

Add these images to the `images/` folder:
- `hero.jpg` - Main hero image (1200x800px)
- `specialoffer.jpg` - Special offer image (400x300px)
- `about.jpg` - About section image (600x400px)
- `location.jpg` - Location image (600x400px)

## Customization

### Colors
The website uses a tea-themed color palette:
- Primary: `#5A3E2B` (Tea Brown)
- Secondary: `#D6C6B9` (Tea Beige)
- Background: `#F5F3EF` (Tea Cream)

### Fonts
- Headings: Playfair Display (Google Fonts)
- Body: Inter (Google Fonts)

## Deployment

### Static Website
- Deploy to Vercel, Netlify, or any static hosting
- Upload images to the `images/` folder
- Update business information in `index.html`

### Reservation System
- Deploy to Vercel, Railway, or any Node.js hosting
- Set environment variables on your hosting platform
- Ensure the `public/uploads/` directory is writable

## API Endpoints

### POST /api/reservations
Creates a new reservation and generates QR code.

**Request Body:**
```json
{
  "guestName": "John Doe",
  "reservationDate": "2024-01-15",
  "reservationTime": "14:00",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "specialRequests": "Vegetarian options"
}
```

**Response:**
```json
{
  "success": true,
  "reservation": {
    "id": "YGT-1234567890-ABC123",
    "guestName": "John Doe",
    "reservationDate": "2024-01-15",
    "reservationTime": "14:00",
    "qrCodeUrl": "http://localhost:3000/uploads/qr-YGT-1234567890-ABC123.png",
    "checkInUrl": "http://localhost:3000/checkin/YGT-1234567890-ABC123"
  }
}
```

### GET /checkin/:reservationId
Displays check-in page for a specific reservation.

## SEO Features

- Meta tags for search engines
- Open Graph tags for social media
- Twitter Card tags
- JSON-LD structured data
- XML sitemap
- Robots.txt
- Canonical URLs
- Image optimization attributes

## License

MIT License - feel free to use and modify for your tea business!

