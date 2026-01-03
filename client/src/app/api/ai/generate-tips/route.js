// Dynamic import in Node.js runtime to avoid bundling issues

// Proxy-only shim after refactor: the real implementation lives in the backend server under /api/ai
export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ai/generate-tips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (error) {
    return Response.json({ error: error?.message || 'Proxy error' }, { status: 500 });
  }
}


