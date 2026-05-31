// api/logout.js
const { clearSessionCookie, redirect } = require('./_shared/db');

module.exports = async (req, res) => {
  return redirect(res, '/', clearSessionCookie());
};
