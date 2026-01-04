import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt: userTeamData } = JSON.parse(event.body || '{}');

    if (!userTeamData) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is required' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing API Key' }) };
    }

    // 1. LEAGUE RULES (Condensed for Speed)
    // We removed fluff to make the input smaller and faster to process.
    const LEAGUE_SCORING_RULES = `
    ROLE: Madden GM Assistant.
    TASK: Evaluate team based on this scoring:
    1. STARTERS: 1st=5pts, 2nd=3pts, 3rd=2pts, Rest=1pt. (QB Premium: 7/5/3/1).
    2. DEPTH: Highest rated NON-starter gets +1 pt.
    3. EXTRA($): Extra starters get +0.5 pt.
    
    OUTPUT INSTRUCTIONS:
    - BE EXTREMELY CONCISE. Bullet points only.
    - Focus ONLY on "Depth Bonus" opportunities and "QB Premium".
    - KEEP RESPONSE UNDER 200 WORDS.
    `;

    const fullPrompt = `${LEAGUE_SCORING_RULES}\n\nTEAM DATA:\n${userTeamData}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 2. MODEL CONFIGURATION
    // using 'gemini-2.5-flash' because 1.5 is retired for new accounts.
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 400, // <--- FORCE STOP after ~300 words to beat the 10s timer
        temperature: 0.7,
      }
    });
    
    // 3. GENERATE
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: responseText }),
    };

  } catch (err: any) {
    console.error('Gemini error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Error' }),
    };
  }
};
