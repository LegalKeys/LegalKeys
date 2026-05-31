// api/register.js
const { getSupabase, redirect, htmlError } = require('./_shared/db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { name, email, password, type, company_name, company_number, vat_number } = req.body || {};

  if (!name || !email || !password) return htmlError(res, 'All fields are required.', '/');
  if (password.length < 8) return htmlError(res, 'Password must be at least 8 characters.', '/');

  const userType = type === 'seller' ? 'seller' : 'buyer';

  try {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return htmlError(res, 'An account with that email already exists. <a href="/" class="underline">Back</a>', '/');
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { error } = await supabase.from('users').insert([{
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      type: userType,
      company_name: userType === 'seller' ? (company_name || null) : null,
      company_number: userType === 'seller' ? (company_number || null) : null,
      vat_number: userType === 'seller' ? (vat_number || null) : null,
      verified: false
    }]);

    if (error) throw error;

    return redirect(res, '/?registered=1');
  } catch (err) {
    console.error('Register error:', err);
    return htmlError(res, 'Registration failed: ' + (err.message || 'Unknown error'), '/');
  }
};
