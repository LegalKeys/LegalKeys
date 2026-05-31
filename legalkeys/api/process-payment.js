// api/process-payment.js
// NOTE: This is a stub — integrate Stripe for real payments.
const { getSupabase, getSession, redirect, htmlError } = require('./_shared/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const session = getSession(req);
  if (!session) return redirect(res, '/?login=required');

  const { product_id, total } = req.body || {};
  const productId = parseInt(product_id || '1', 10);
  const totalAmount = parseFloat(total || '0');

  if (!productId || totalAmount <= 0) return htmlError(res, 'Invalid order data.', '/checkout.html');

  try {
    const supabase = getSupabase();

    // TODO: Add Stripe payment intent verification here before inserting order

    const { data, error } = await supabase.from('orders').insert([{
      buyer_id: session.user_id,
      product_id: productId,
      total: totalAmount,
      vat_amount: 0,
      key_code: 'ABCD-1234-WXYZ-5678', // TODO: replace with real key lookup
      status: 'pending_payment'
    }]).select('id').single();

    if (error) throw error;

    return redirect(res, '/success.html?order=' + data.id);
  } catch (err) {
    console.error('Payment error:', err);
    return htmlError(res, 'Order processing failed. Please try again.', '/checkout.html');
  }
};
