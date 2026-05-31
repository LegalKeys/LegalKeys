// netlify/functions/add-product.js
const { getSupabase, getSession, redirect, htmlError } = require('./shared/db');
const qs = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const session = getSession(event);
  if (!session) return redirect('/?login=required');
  if (session.user_type !== 'seller' && session.user_type !== 'admin') {
    return htmlError('Access denied.', '/');
  }

  const body = qs.parse(event.body || '');
  const title       = (body.title || '').trim();
  const price       = parseFloat(body.price || '0');
  const platform    = (body.platform || '').trim();
  const description = (body.description || '').trim();

  if (!title || price <= 0 || !platform) {
    return htmlError('Title, price and platform are required.', '/sell.html');
  }

  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('products').insert([{
      seller_id:   session.user_id,
      title,
      price,
      platform,
      description,
      verified:    false,
      active:      false  // Requires admin approval before going live
    }]);

    if (error) throw error;

    return redirect('/sell.html?submitted=1');
  } catch (err) {
    console.error('Add product error:', err);
    return htmlError('Failed to submit product. Please try again.', '/sell.html');
  }
};
