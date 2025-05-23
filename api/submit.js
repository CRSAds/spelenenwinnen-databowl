export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;

  // Extra logging voor debugging
  console.log("Ontvangen req.body:", body);

  const gender = body.gender || '';
  const firstname = body.firstname || '';
  const lastname = body.lastname || '';
  const email = body.email || '';
  const dob_day = body.dob_day || '01';
  const dob_month = body.dob_month || '01';
  const dob_year = body.dob_year || '2000';
  const transaction_id = body.transaction_id || '';

  const dob = `${dob_year}-${dob_month.padStart(2, '0')}-${dob_day.padStart(2, '0')}`;
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '';
  const optindate = new Date().toISOString().split('.')[0] + '+00:00'; // geldig formaat
  const campagne_url = req.headers.referer || '';

  const payload = new URLSearchParams({
    cid: '4885',
    sid: '34',
    f_2_title: gender,
    f_3_firstname: firstname,
    f_4_lastname: lastname,
    f_1_email: email,
    f_5_dob: dob,
    f_17_ipaddress: ip,
    f_55_optindate: optindate,
    f_1322_transaction_id: transaction_id,
    f_1453_campagne_url: campagne_url,
  });

  // Log de payload vóór verzenden
  console.log("Payload dat naar Databowl gaat:", payload.toString());

  try {
    const response = await fetch('https://crsadvertising.databowl.com/api/v1/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload.toString(),
    });

    const result = await response.text();
    console.log("Databowl response:", result);

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to send lead', details: result });
    }

    return res.status(200).json({ success: true, response: result });
  } catch (error) {
    console.error('Error sending lead:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}
