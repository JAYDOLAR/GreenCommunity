// Proxy-only shim after refactor: the real implementation lives in the backend server under /api/ai
export const runtime = 'nodejs';

// Streaming pass-through proxy to backend SSE endpoint
export async function POST(request) {
  try {
    // Forward raw body to preserve payload without re-stringify issues
    const rawBody = await request.text();
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/ask`;

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'x-session-id': request.headers.get('x-session-id') || ''
      },
      body: rawBody
    });

    // If backend didn't return a stream, return as-is
    if (!res.body) {
      const text = await res.text();
      return new Response(text, { status: res.status, headers: res.headers });
    }

    // Ensure SSE headers for client
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('content-type') || 'text/event-stream');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');

    return new Response(res.body, { status: res.status, headers });
  } catch (error) {
    const err = JSON.stringify({ error: error?.message || 'Proxy error' });
    return new Response(err, { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}


