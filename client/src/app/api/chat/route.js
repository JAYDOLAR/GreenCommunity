import { SITE_CONTEXT } from './siteContext';

export async function POST(request) {
  try {
    const { messages, model } = await request.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Missing OPENROUTER_API_KEY on server' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const referer = process.env.SITE_URL || (request.headers.get('origin') || 'http://localhost:3000');

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        // OpenRouter recommends setting both headers for attribution
        'HTTP-Referer': referer,
        'Referer': referer,
        'X-Title': 'GreenCommunity ChatBot'
      },
      body: JSON.stringify({
        model: model || 'openrouter/auto',
        messages: [
          { role: 'system', content: SITE_CONTEXT },
          ...((Array.isArray(messages) ? messages : []))
        ],
        temperature: 0.7,
      })
    });

    if (!res.ok) {
      let details;
      try { details = await res.json(); } catch { details = await res.text(); }
      return Response.json({ error: 'Upstream error', details }, { status: 502 });
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content || '';
    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected error' }, { status: 500 });
  }
}


