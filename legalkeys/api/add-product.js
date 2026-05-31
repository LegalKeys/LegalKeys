// api/add-product.js
const { getSupabase, getSession, redirect, htmlError } = require('./_shared/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const session = getSession(req);
  if (!session) return redirect(res, '/?login=required');
  if (session.user_type !== 'seller' && session.user_type !== 'admin') {
    return htmlError(res, 'Access denied.', '/');
  }

  const { title, price, platform, description } = req.body || {};
  const titleVal = (title || '').trim();
  const priceVal = parseFloat(price || '0');
  const platformVal = (platform || '').trim();
  const descriptionVal = (description || '').trim();

  if (!titleVal || priceVal <= 0 || !platformVal) {
    return htmlError(res, 'Title, price and platform are required.', '/sell.html');
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('products').insert([{
      seller_id: session.user_id,
      title: titleVal,
      price: priceVal,
      platform: platformVal,
      description: descriptionVal,
      verified: false,
      active: false // Requires admin approval before going live
    }]);

    if (error) throw error;

    return redirect(res, '/sell.html?submitted=1');
  } catch (err) {
    console.error('Add product error:', err);
    return htmlError(res, 'Failed to submit product. Please try again.', '/sell.html');
  }
};
