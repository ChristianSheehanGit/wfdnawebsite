/**
 * Auth Controller
 * Verifies the admin password against an environment variable.
 * The password is stored server-side (ADMIN_PASSWORD env var), never in the frontend.
 */

/**
 * POST /api/auth/login
 * Body: { password }
 * Returns success if the password matches the ADMIN_PASSWORD env var.
 */
function login(req, res) {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!adminPassword) {
    console.warn('[Auth] ADMIN_PASSWORD not set. Login disabled.');
    return res.status(500).json({ success: false, error: 'Admin password not configured on server.' });
  }

  if (password && password === adminPassword) {
    return res.json({ success: true, message: 'Authenticated' });
  }

  return res.status(401).json({ success: false, error: 'Incorrect password' });
}

module.exports = { login };