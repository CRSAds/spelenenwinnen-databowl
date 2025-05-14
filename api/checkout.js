import Stripe from 'stripe';

const stripe = new Stripe('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');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1Qh6LeI4KIFiqjiY1mn7HTH3',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://www.google.com?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://www.google.com',
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
