export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const mollie = require('@mollie/api-client')({ apiKey: process.env.MOLLIE_API_KEY });

  try {
    // 1. Create customer in Mollie
    const customer = await mollie.customers.create({
      name,
      email
    });

    // 2. Create a first payment which also starts the subscription
    const payment = await mollie.payments.create({
      amount: {
        currency: 'EUR',
        value: '0.99'
      },
      description: 'Abonnement Spelen & Winnen - eerste week',
      redirectUrl: 'https://www.google.com',
      webhookUrl: 'https://spelenenwinnen-databowl.vercel.app/api/mollie-webhook',
      customerId: customer.id,
      sequenceType: 'first',
      metadata: {
        customerName: name,
        customerEmail: email
      }
    });

    // 3. Create the actual subscription
    await mollie.customers_subscriptions.create({
      customerId: customer.id,
      amount: {
        currency: 'EUR',
        value: '0.99'
      },
      interval: '1 week',
      description: 'Wekelijks abonnement Spelen & Winnen',
      webhookUrl: 'https://spelenenwinnen-databowl.vercel.app/api/mollie-webhook'
    });

    return res.status(200).json({ paymentUrl: payment.getCheckoutUrl() });
  } catch (error) {
    console.error('Mollie error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
