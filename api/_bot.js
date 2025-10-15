// Basic bot detection helpers for Vercel Node functions
// Avoids Next.js middleware; works with plain Node handlers

const COMMON_BOT_PATTERNS = [
  'bot',
  'crawler',
  'spider',
  'facebookexternalhit',
  'googlebot',
  'bingbot',
  'ahrefsbot',
  'semrushbot',
  'duckduckbot',
  'applebot',
  'yandexbot',
  'sogou',
  'bytespider',
  'baiduspider',
  'petalbot',
];

function isBotRequest(req) {
  const ua = String(req.headers['user-agent'] || '').toLowerCase();
  return COMMON_BOT_PATTERNS.some(p => ua.includes(p));
}

function rejectIfBot(req, res) {
  if (isBotRequest(req)) {
    res.status(403).json({ ok: false, error: 'Bot access denied' });
    return true;
  }
  return false;
}

function setRobotsHeader(res) {
  try {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  } catch (_) {
    // ignore
  }
}

module.exports = { rejectIfBot, setRobotsHeader };