import { SITE_CONTEXT } from '../../chat/siteContext';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are GreenCommunity’s AI Climate Coach.
Be practical, cost-saving, and India-specific.
Respond in simple terms that any household can understand.`;

export async function POST(request) {
  try {
    const { question, context } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = [
      SYSTEM_PROMPT,
      '\nApp context:',
      SITE_CONTEXT,
      context ? `\nAdditional context: ${context}` : '',
      question ? `\nQuestion: ${question}` : '',
    ].join('\n');

    const result = await model.generateContent(fullPrompt);
    const text = result?.response?.text?.() || '';
    return Response.json({ reply: text });
  } catch (error) {
    return Response.json({ error: error?.message || 'Failed to generate reply' }, { status: 500 });
  }
}


