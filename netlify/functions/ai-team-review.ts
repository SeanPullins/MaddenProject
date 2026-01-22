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
      model: "gemini-1.5-flash", // Stable model with high free-tier quota (15 RPM, 1M TPM)
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    // Create AI prompt for team scouting report
    const prompt = `You are a professional fantasy football scout analyzing a Madden-style fantasy team.

TEAM: ${teamData.teamName} (Owner: ${teamData.owner})

ROSTER:
${teamData.roster.map(p => `- ${p.name} (${p.position}, ${p.team}) - OVR: ${p.ovr} - Draft: ${p.draftRound || 'N/A'}`).join('\n')}

Generate a scouting report in STRICT JSON format with these fields:

{
  "overallGrade": "A single letter grade (A+, A, A-, B+, B, etc.)",
  "strengths": ["3 specific strengths as bullet points"],
  "weaknesses": ["2-3 specific weaknesses or concerns"],
  "positionalNotes": ["2-3 notes about position groups (QB, RB, WR, Defense, etc.)"],
  "draftAnalysis": "One paragraph analyzing draft strategy and value picks",
  "recommendations": ["2-3 actionable recommendations for improvement"]
}

IMPORTANT:
- Be specific and analytical (mention player names and OVR ratings)
- Focus on roster construction, depth, and team balance
- Consider positional value and draft efficiency
- Output ONLY valid JSON, no markdown or extra text`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    // Parse AI response as JSON
    let aiReview: AIReviewResponse;
    try {
      aiReview = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
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
