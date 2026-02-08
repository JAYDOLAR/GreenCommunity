import { SITE_CONTEXT } from '../api/chat/siteContext.js';
import { getChatSessionModel } from '../models/ChatSession.model.js';

const SYSTEM_PROMPT = `You are GreenCommunity’s AI Climate Coach.
Be practical, cost-saving, and India-specific.
Respond in simple terms that any household can understand.`;

// LRU-style in-memory cache with max size and TTL to prevent memory leaks
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const conversationCache = new Map();

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of conversationCache) {
    if (now - entry.ts > CACHE_TTL_MS) {
      conversationCache.delete(key);
    }
  }
  // If still over limit, remove oldest entries
  if (conversationCache.size > MAX_CACHE_SIZE) {
    const excess = conversationCache.size - MAX_CACHE_SIZE;
    const keys = conversationCache.keys();
    for (let i = 0; i < excess; i++) {
      conversationCache.delete(keys.next().value);
    }
  }
}

function getSessionId(req) {
  // Prefer explicit session ID from header or authenticated user ID
  if (req.user?._id) return String(req.user._id);
  const headerSession = req.headers['x-session-id'] || req.headers['x-client-id'];
  if (headerSession) return String(headerSession).slice(0, 200);
  // Fallback to IP-based session (less reliable but acceptable for anonymous users)
  const ip = (req.headers['x-forwarded-for']?.split(',')[0]?.trim()) || req.ip || '';
  return `anon-${ip}`.slice(0, 200);
}

export const ask = async (req, res) => {
  try {
    const { question, context, profile } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
    }

    // Session & memory — use DB-backed sessions, cache for fast access
    const sessionId = getSessionId(req);
    if (profile && typeof profile === 'object') {
      const allowed = ['name', 'goals', 'location', 'style'];
      const cleaned = Object.fromEntries(
        Object.entries(profile).filter(([k, v]) => allowed.includes(k) && typeof v === 'string' && v.trim())
      );
      if (Object.keys(cleaned).length) {
        const cached = conversationCache.get(sessionId);
        if (cached) cached.profile = { ...(cached.profile || {}), ...cleaned };
      }
    }
    const ChatSession = await getChatSessionModel();
    // Load or create persistent session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = await ChatSession.create({ sessionId, profile: profile || {} });
    }
    // Merge provided profile
    if (profile && typeof profile === 'object') {
      session.profile = { ...(session.profile || {}), ...profile };
      await session.save();
    }
    const userProfile = session.profile;
    const history = Array.isArray(session.history) && session.history.length ? session.history : [];
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const fullPrompt = [
      SYSTEM_PROMPT,
      profileText ? `\n${profileText}` : '',
      '\nApp context:',
      SITE_CONTEXT,
      historyTranscript ? '\nConversation so far:\n' + historyTranscript : '',
      context ? `\nAdditional context: ${context}` : '',
      question ? `\nCurrent question: ${question}` : ''
    ].join('\n');

    // Streaming response
    const stream = await model.generateContentStream(fullPrompt);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullText = '';
    for await (const chunk of stream.stream) {
      const part = chunk.text();
      if (part) {
        fullText += part;
        res.write(`data: ${JSON.stringify({ delta: part })}\n\n`);
      }
    }
    // Finish event
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    const nextHistory = [...recentHistory, { role: 'user', content: String(question || '').slice(0, 4000) }, { role: 'assistant', content: fullText.slice(0, 16000) }];
    // Update DB-backed session only (no unbounded global stores)
    session.history = nextHistory.slice(-MAX_MESSAGES);
    await session.save();
    // Update bounded cache
    conversationCache.set(sessionId, { ts: Date.now(), profile: session.profile });
    pruneCache();

    // Note: with SSE we have already ended the response; nothing to return
    return;
  } catch (error) {
    // Attempt to end SSE properly if headers were sent
    try {
      if (!res.headersSent) return res.status(500).json({ error: error?.message || 'Failed to generate reply' });
      res.write(`data: ${JSON.stringify({ error: 'stream_error', message: error?.message || 'Failed to stream reply' })}\n\n`);
      res.end();
    } catch {
      // ignore
    }
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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


