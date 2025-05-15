// /api/create-payment.js

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount = '0.99', description = 'Weekabonnement Spelletjes' } = req.body;

  try {
    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOLLIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: amount,
        },
        description,
        redirectUrl: 'https://www.google.com',
        method: 'ideal', // of laat weg voor meerdere betaalopties
      }),
    });

    const result = await response.json();

    if (!result || !result._links || !result._links.checkout) {
      console.error('Fout in Mollie response:', result);
      return res.status(500).json({ error: 'Kon geen betaling starten via Mollie.' });
    }

    return res.status(200).json({ checkoutUrl: result._links.checkout.href });
  } catch (err) {
    console.error('Mollie API fout:', err);
    return res.status(500).json({ error: 'Interne serverfout bij Mollie betaling.' });
  }
}
