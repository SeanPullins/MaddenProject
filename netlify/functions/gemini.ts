import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { prompt: userTeamData } = JSON.parse(event.body || '{}');
    if (!userTeamData) return { statusCode: 400, body: 'No data' };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: 'Missing API Key' };

    // 1. TURBO PROMPT: Rules condensed for maximum speed
    const RULES = `
    TASK: Identify "League Year Winner" scoring opportunities.
    SCORING:
    - Depth Bonus (+1pt): Highest rated NON-starter.
    - QB Premium (+7/5/3pts): Top rated QBs.
    - Extra Starters (+0.5pt): Players with $.`
    + `
    OUTPUT RULES:
    1. DO NOT summarize the roster.
    2. OUTPUT ONLY 3 BULLET POINTS MAX.
    3. BE ROBOTIC AND BRIEF.`;

    const genAI = new GoogleGenerativeAI(apiKey);

    // 2. MODEL CONFIG: Strict limits to force early completion
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 150,  // Stops AI after ~100 words
        temperature: 0.4,
      }
    });

    const result = await model.generateContent(`${RULES}\n\nDATA:\n${userTeamData}`);
    const response = await result.response;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: response.text() }),
    };

  } catch (err: any) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
