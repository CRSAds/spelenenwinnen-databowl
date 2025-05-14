export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://crsadvertising.databowl.com/api/v1/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(req.body).toString()
    });

    const text = await response.text();

    if (response.ok) {
      return res.status(200).json({ success: true, response: text });
    } else {
      return res.status(response.status).json({ success: false, error: text });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
