// netlify/functions/login.js
const { getSupabase, makeSessionCookie, redirect, htmlError } = require('./shared/db');
const bcrypt = require('bcryptjs');
const qs = require('querystring');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const body = qs.parse(event.body || '');
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) return htmlError('Email and password are required.', '/');

  try {
    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error || !users || users.length === 0) {
      return htmlError('Invalid email or password. <a href="/" class="underline">Back</a>', '/');
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return htmlError('Invalid email or password. <a href="/" class="underline">Back</a>', '/');
    }

    const session = { user_id: user.id, user_name: user.name, user_type: user.type, verified: user.verified };
    const cookie = makeSessionCookie(session);

    let destination = '/';
    if (user.type === 'admin') destination = '/admin.html';
    else if (user.type === 'seller') destination = '/sell.html';

    return redirect(destination, cookie);
  } catch (err) {
    console.error('Login error:', err);
    return htmlError('Server error. Please try again.', '/');
  }
};
