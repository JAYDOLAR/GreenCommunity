// Deprecated: This route used to proxy OpenRouter. Keeping minimal compatibility redirect.
export async function POST() {
  return Response.json({
    error: 'Deprecated endpoint. Use /api/ai/ask instead.'
  }, { status: 410 });
}


