import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Team Review Netlify Function
 *
 * SAFETY: This function is completely isolated from existing site logic.
 * - Reads team data only (no mutations)
 * - Returns ephemeral AI analysis (not persisted)
 * - Does NOT affect rankings, scores, or any existing data
 * - Gracefully handles errors without breaking the UI
 */

interface TeamReviewRequest {
  teamName: string;
  owner: string;
  roster: Array<{
    name: string;
    position: string;
    team: string;
    ovr: number;
    draftRound?: string;
  }>;
}

interface AIReviewResponse {
  overallGrade: string;
  strengths: string[];
  weaknesses: string[];
  positionalNotes: string[];
  draftAnalysis: string;
  recommendations: string[];
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse team data from request body
    const teamData: TeamReviewRequest = JSON.parse(event.body || '{}');

    if (!teamData.teamName || !teamData.roster) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Team name and roster are required' })
      };
    }

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'AI service unavailable',
          fallback: true
        })
      };
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7
        // Note: responseMimeType removed - not reliably supported by all models
      }
    });

    // Create AI prompt for team scouting report
    const prompt = `You are a professional fantasy football scout. Analyze this team and return ONLY a valid JSON object (no markdown, no code blocks, no extra text).

TEAM: ${teamData.teamName} (Owner: ${teamData.owner})

ROSTER:
${teamData.roster.map(p => `- ${p.name} (${p.position}, ${p.team}) - OVR: ${p.ovr} - Draft: ${p.draftRound || 'N/A'}`).join('\n')}

Return this EXACT JSON structure with your analysis:

{
  "overallGrade": "letter grade A+ to D-",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "positionalNotes": ["QB/RB/WR note", "defense note", "OL note"],
  "draftAnalysis": "one paragraph about draft strategy and value picks",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Rules:
- Be specific (mention player names and OVR ratings)
- Focus on roster construction, depth, and balance
- Output ONLY the JSON object
- No markdown formatting, no code blocks, no extra text before or after`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // Extract JSON from response (handle markdown code blocks)
    // Remove markdown code blocks if present: ```json ... ``` or ``` ... ```
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    responseText = responseText.trim();

    // Parse AI response as JSON
    let aiReview: AIReviewResponse;
    try {
      aiReview = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response text:', responseText.substring(0, 500)); // Log first 500 chars
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'AI response format error',
          fallback: true
        })
      };
    }

    // Validate response structure
    if (!aiReview.overallGrade || !aiReview.strengths || !aiReview.weaknesses) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Incomplete AI response',
          fallback: true
        })
      };
    }

    // Return successful AI review
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        success: true,
        review: aiReview
      })
    };

  } catch (err: any) {
    console.error('AI Team Review error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || 'Internal Server Error',
        fallback: true
      })
    };
  }
};
