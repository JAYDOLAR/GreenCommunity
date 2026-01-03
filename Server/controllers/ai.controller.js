import { SITE_CONTEXT } from '../api/chat/siteContext.js';

const SYSTEM_PROMPT = `You are GreenCommunity’s AI Climate Coach.
Be practical, cost-saving, and India-specific.
Respond in simple terms that any household can understand.`;

// In-memory conversation and profile stores (process-local)
// eslint-disable-next-line no-var
var __gc_conversations = global.__gc_conversations || (global.__gc_conversations = {});
// eslint-disable-next-line no-var
var __gc_userProfiles = global.__gc_userProfiles || (global.__gc_userProfiles = {});

function getSessionId(req) {
  const headerSession = req.headers['x-session-id'] || req.headers['x-client-id'];
  const ip = (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.ip || '';
  const ua = req.get('user-agent') || '';
  return (headerSession || `${ip}|${ua}` || 'anon').slice(0, 200);
}

export const ask = async (req, res) => {
  try {
    const { question, context, profile } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    // Session & memory
    const sessionId = getSessionId(req);
    if (profile && typeof profile === 'object') {
      const allowed = ['name', 'goals', 'location', 'style'];
      const cleaned = Object.fromEntries(
        Object.entries(profile).filter(([k, v]) => allowed.includes(k) && typeof v === 'string' && v.trim())
      );
      if (Object.keys(cleaned).length) {
        __gc_userProfiles[sessionId] = { ...(__gc_userProfiles[sessionId] || {}), ...cleaned };
      }
    }
    const userProfile = __gc_userProfiles[sessionId];
    const history = Array.isArray(__gc_conversations[sessionId]) ? __gc_conversations[sessionId] : [];
    const MAX_MESSAGES = 10;
    const recentHistory = history.slice(-MAX_MESSAGES);
    const historyTranscript = recentHistory.map(m => `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`).join('\n');

    const profileText = userProfile ? [
      'User Profile:',
      userProfile.name ? `- Name: ${userProfile.name}` : null,
      userProfile.goals ? `- Goals: ${userProfile.goals}` : null,
      userProfile.location ? `- Location: ${userProfile.location}` : null,
      userProfile.style ? `- Preferred style: ${userProfile.style}` : null,
    ].filter(Boolean).join('\n') : '';

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = [
      SYSTEM_PROMPT,
      profileText ? `\n${profileText}` : '',
      '\nApp context:',
      SITE_CONTEXT,
      historyTranscript ? '\nConversation so far:\n' + historyTranscript : '',
      context ? `\nAdditional context: ${context}` : '',
      question ? `\nCurrent question: ${question}` : ''
    ].join('\n');

    const result = await model.generateContent(fullPrompt);
    const text = result?.response?.text?.() || '';

    const nextHistory = [...recentHistory, { role: 'user', content: String(question || '').slice(0, 4000) }, { role: 'assistant', content: text.slice(0, 4000) }];
    __gc_conversations[sessionId] = nextHistory.slice(-MAX_MESSAGES);

    return res.json({ reply: text, sessionId });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Failed to generate reply' });
  }
};

export const generateTips = async (req, res) => {
  try {
    const { electricity, gas, petrol } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate 3-5 bullet tips for an Indian household to save money and reduce emissions.
Inputs (monthly): electricity:${electricity} kWh, gas:${gas} units, petrol:${petrol} liters.
Guidelines: India-specific, include subsidies or practical actions, mention approximate monthly savings where possible. Keep each tip to one sentence.`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '';
    const tips = text.split(/\n|•|- /).map(t => t.trim()).filter(t => t && t.length > 3).slice(0, 5);
    return res.json({ tips });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Failed to generate tips' });
  }
};

export const chatDeprecated = async (_req, res) => {
  return res.status(410).json({ error: 'Deprecated endpoint. Use /api/ai/ask instead.' });
};


