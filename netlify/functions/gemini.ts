import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai'; // This matches your package.json now!

export const handler: Handler = async (event) => {
  // 1. Method Check
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 2. Parse User Input
    const { prompt: userTeamData } = JSON.parse(event.body || '{}');

    if (!userTeamData) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // 3. API Key Check
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server Configuration Error' }),
      };
    }

    // 4. DEFINE LEAGUE RULES
    const LEAGUE_SCORING_RULES = `
    ROLE: You are an expert Assistant GM for a Madden Franchise League.
    OBJECTIVE: Evaluate the user's team data based on the specific "League Year Winner" scoring rubric below.
    
    SCORING RUBRIC (CRITICAL):
    1. POSITIONAL RANKS (Starters):
       - Standard Positions: 1st Highest Rated = 5pts, 2nd = 3pts, 3rd = 2pts, Rest = 1pt.
       - Quarterback (QB) Premium: 1st = 7pts, 2nd = 5pts, 3rd = 3pts, Rest = 1pt.
    
    2. DEPTH BONUS: 
       - The highest-rated player NOT in the starting lineup gets a +1 point bonus. (Depth is valuable!).
    
    3. EXTRA STARTERS ($):
       - Any player marked as an "Extra Starter" (or $) gets a +0.5 point bonus.
       
    INSTRUCTIONS:
    - Analyze the provided team data.
    - Identify where the team is strong or weak based on these point values.
    - Suggest moves to maximize this specific point system (e.g., "Acquire a better backup MLB to trigger the +1 Depth Bonus").
    `;

    // 5. Combine Rules + User Data
    const fullPrompt = `${LEAGUE_SCORING_RULES}\n\nUSER TEAM DATA:\n${userTeamData}`;

    // 6. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const responseText = response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: responseText,
      }),
    };

  } catch (err: any) {
    console.error('Gemini function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || 'Internal Server Error',
      }),
    };
  }
};
