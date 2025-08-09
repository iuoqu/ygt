module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, contact, couponId, url } = req.body || {};
    if (!name || !couponId) {
      return res.status(400).json({ error: 'Missing required fields: name, couponId' });
    }

    const notionToken = process.env.NOTION_TOKEN;
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!notionToken || !databaseId) {
      return res.status(500).json({ error: 'Notion is not configured. Set NOTION_TOKEN and NOTION_DATABASE_ID.' });
    }

    const payload = {
      parent: { database_id: databaseId },
      properties: {
        Name: { title: [{ text: { content: String(name).slice(0, 200) } }] },
        Contact: { rich_text: contact ? [{ text: { content: String(contact).slice(0, 500) } }] : [] },
        CouponID: { rich_text: [{ text: { content: String(couponId).slice(0, 100) } }] },
        URL: url ? { url: String(url).slice(0, 2000) } : { url: null },
        Timestamp: { date: { start: new Date().toISOString() } }
      }
    };

    const resp = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({ error: 'Failed to create Notion page', details: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Notion logging error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
