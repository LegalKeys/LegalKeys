const https = require('https');
const querystring = require('querystring');

function stripeRequest(path, data) {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify(data);
        const options = {
            hostname: 'api.stripe.com',
            port: 443,
            path: path,
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(process.env.STRIPE_SECRET_KEY + ':').toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

export default async function handler(req, res) {
    // Allow CORS for your domain
    res.setHeader('Access-Control-Allow-Origin', 'https://legalkeys.to');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { payment_method_id, email, total } = req.body;

    if (!payment_method_id || !email || !total) {
        return res.status(400).json({ success: false, error: 'Missing required fields.' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    try {
        const amount = Math.round(parseFloat(total) * 100); // Convert to pence

        const paymentIntent = await stripeRequest('/v1/payment_intents', {
            amount: amount,
            currency: 'gbp',
            payment_method: payment_method_id,
            confirm: 'true',
            receipt_email: email,
            description: 'LegalKeys - Game Key Purchase',
            return_url: 'https://legalkeys.to/success.html'
        });

        if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_action') {
            return res.status(200).json({ success: true, status: paymentIntent.status });
        } else {
            const errorMsg = paymentIntent.error?.message || 'Payment failed. Please try again.';
            return res.status(400).json({ success: false, error: errorMsg });
        }

    } catch (err) {
        console.error('Stripe error:', err);
        return res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
    }
}
