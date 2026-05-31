// shared/db.js — shared Supabase client for all functions
// Requires env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY

const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
  return createClient(url, key);
}

function getSession(event) {
  const cookie = event.headers.cookie || '';
  const match = cookie.match(/lk_session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(Buffer.from(match[1], 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function makeSessionCookie(payload, maxAge = 86400 * 7) {
  const val = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `lk_session=${val}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function clearSessionCookie() {
  return `lk_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function redirect(location, cookies) {
  const headers = { Location: location };
  if (cookies) headers['Set-Cookie'] = cookies;
  return { statusCode: 302, headers, body: '' };
}

function htmlError(msg, backUrl = '/') {
  return {
    statusCode: 400,
    headers: { 'Content-Type': 'text/html' },
    body: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Error</title>
      <script src="https://cdn.tailwindcss.com"></script></head>
      <body class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="bg-white p-8 rounded-xl shadow text-center max-w-md">
        <p class="text-red-600 font-semibold text-lg mb-4">${msg}</p>
        <a href="${backUrl}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Go Back</a>
      </div></body></html>`
  };
}

module.exports = { getSupabase, getSession, makeSessionCookie, clearSessionCookie, redirect, htmlError };
