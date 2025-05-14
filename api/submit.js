export default async function handler(req, res) {
  // Zet CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // Of specifieker: 'https://nl.prijzen-winnaar.com'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight response
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await fetch('https://crsadvertising.databowl.com/api/v1/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(req.body).toString(),
    });

    const data = await response.text();
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).json({ error: 'Lead submission failed', details: error.message });
  }
}
