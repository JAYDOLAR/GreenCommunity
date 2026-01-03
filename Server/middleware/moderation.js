// Simple moderation/guardrails middleware
// Blocks prompts containing disallowed keywords (case-insensitive)
const BLOCKLIST = [
  /\b(hate|kill|suicide|terror|bomb)\b/i,
  /\b(nsfl|nsfw|sexual minors)\b/i,
  /\b(how to make.*weapon)\b/i
];

export function moderatePrompt(req, res, next) {
  try {
    const body = req.body || {};
    const text = String(body.question || body.prompt || '').slice(0, 8000);
    if (!text) return next();
    const hit = BLOCKLIST.find((re) => re.test(text));
    if (hit) {
      return res.status(400).json({ error: 'Prompt violates content policy.' });
    }
    next();
  } catch (e) {
    next();
  }
}


