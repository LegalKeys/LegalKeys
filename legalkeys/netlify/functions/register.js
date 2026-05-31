// netlify/functions/register.js
const { getSupabase, redirect, htmlError } = require('./shared/db');
const bcrypt = require('bcryptjs');
const qs = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = qs.parse(event.body || '');
  const name     = (body.name || '').trim();
  const email    = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const type     = body.type === 'seller' ? 'seller' : 'buyer';

  if (!name || !email || !password) return htmlError('All fields are required.', '/');
  if (password.length < 8) return htmlError('Password must be at least 8 characters.', '/');

  const company_name   = type === 'seller' ? (body.company_name || '').trim() : null;
  const company_number = type === 'seller' ? (body.company_number || '').trim() : null;
  const vat_number     = type === 'seller' ? (body.vat_number || '').trim() : null;

  try {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (existing && existing.length > 0) {
      return htmlError('An account with that email already exists. <a href="/" class="underline">Back</a>', '/');
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { error } = await supabase.from('users').insert([{
      name, email, password_hash, type,
      company_name, company_number, vat_number,
      verified: false
    }]);

    if (error) throw error;

    return redirect('/?registered=1');
  } catch (err) {
    console.error('Register error:', err);
    return htmlError('Registration failed: ' + (err.message || 'Unknown error'), '/');
  }
};
