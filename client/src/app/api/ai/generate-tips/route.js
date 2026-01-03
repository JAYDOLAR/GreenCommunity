// Dynamic import in Node.js runtime to avoid bundling issues

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { electricity, gas, petrol } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Generate 3-5 bullet tips for an Indian household to save money and reduce emissions.
Inputs (monthly): electricity:${electricity} kWh, gas:${gas} units, petrol:${petrol} liters.
Guidelines: India-specific, include subsidies or practical actions, mention approximate monthly savings where possible. Keep each tip to one sentence.`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || '';

    // Try to split into bullets
    const tips = text
      .split(/\n|•|- /)
      .map(t => t.trim())
      .filter(t => t && t.length > 3)
      .slice(0, 5);

    return Response.json({ tips });
  } catch (error) {
    return Response.json({ error: error?.message || 'Failed to generate tips' }, { status: 500 });
  }
}


