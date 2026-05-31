// netlify/functions/process-payment.js
// NOTE: This is a stub — integrate Stripe for real payments.
const { getSupabase, getSession, redirect, htmlError } = require('./shared/db');
const qs = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const session = getSession(event);
  if (!session) return redirect('/?login=required');

  const body = qs.parse(event.body || '');
  const product_id = parseInt(body.product_id || '1', 10);
  const total      = parseFloat(body.total || '0');

  if (!product_id || total <= 0) return htmlError('Invalid order data.', '/checkout.html');

  try {
    const supabase = getSupabase();

    // TODO: Add Stripe payment intent verification here before inserting order

    const { data, error } = await supabase.from('orders').insert([{
      buyer_id:   session.user_id,
      product_id: product_id,
      total:      total,
      vat_amount: 0,
      key_code:   'ABCD-1234-WXYZ-5678',  // TODO: replace with real key lookup
      status:     'pending_payment'
    }]).select('id').single();

    if (error) throw error;

    return redirect('/success.html?order=' + data.id);
  } catch (err) {
    console.error('Payment error:', err);
    return htmlError('Order processing failed. Please try again.', '/checkout.html');
  }
};
