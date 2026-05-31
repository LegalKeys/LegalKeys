// api/login.js
const { getSupabase, makeSessionCookie, redirect, htmlError } = require('./_shared/db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { email, password } = req.body || {};
  if (!email || !password) return htmlError(res, 'Email and password are required.', '/');

  try {
    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (error || !users || users.length === 0) {
      return htmlError(res, 'Invalid email or password. <a href="/" class="underline">Back</a>', '/');
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return htmlError(res, 'Invalid email or password. <a href="/" class="underline">Back</a>', '/');
    }

    const session = { user_id: user.id, user_name: user.name, user_type: user.type, verified: user.verified };
    const cookie = makeSessionCookie(session);

    let destination = '/';
    if (user.type === 'admin') destination = '/admin.html';
    else if (user.type === 'seller') destination = '/sell.html';

    return redirect(res, destination, cookie);
  } catch (err) {
    console.error('Login error:', err);
    return htmlError(res, 'Server error. Please try again.', '/');
  }
};
