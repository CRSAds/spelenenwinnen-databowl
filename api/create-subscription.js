import Mollie from '@mollie/api-client';

const mollie = Mollie({ apiKey: process.env.MOLLIE_API_KEY });

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

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name } = req.body;

    const customer = await mollie.customers.create({ name, email });

    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: '0.99' },
      description: 'Wekelijks abonnement Spelen & Winnen',
      redirectUrl: 'https://www.google.com',
      webhookUrl: 'https://spelenenwinnen-databowl.vercel.app/api/mollie-webhook',
      customerId: customer.id,
      sequenceType: 'first',
    });

    return res.status(200).json({ url: payment.getCheckoutUrl() });
  } catch (error) {
    console.error('Mollie error:', error);
    return res.status(500).json({ error: 'Failed to create payment' });
  }
}
