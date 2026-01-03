// Deprecated: Keep behavior, but under frontend proxy shim
export async function POST() {
  return Response.json({ error: 'Deprecated endpoint. Use /api/ai/ask instead.' }, { status: 410 });
}


