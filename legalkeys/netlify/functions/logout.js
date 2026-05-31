// netlify/functions/logout.js
const { clearSessionCookie, redirect } = require('./shared/db');

exports.handler = async () => {
  return redirect('/', clearSessionCookie());
};
