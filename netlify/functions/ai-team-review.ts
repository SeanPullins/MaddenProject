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
        maxOutputTokens: 2048, // Increased from 800 to allow full response
        temperature: 0.7
      }
    });

    // Create AI prompt for team scouting report
    const prompt = `Analyze this fantasy team. Return ONLY valid JSON (no markdown, no extra text).

TEAM: ${teamData.teamName} (${teamData.owner})
ROSTER: ${teamData.roster.map(p => `${p.name} ${p.position} ${p.ovr}`).join(', ')}

Return this exact structure:
{
  "overallGrade": "B+",
  "strengths": ["Strong QB play", "Elite defensive backfield", "Good depth at RB"],
  "weaknesses": ["Weak offensive line", "No elite WR"],
  "positionalNotes": ["QB shows promise", "Defense needs depth"],
  "draftAnalysis": "Team focused on defense early and built offensive depth in later rounds",
  "recommendations": ["Add elite WR", "Improve OL", "Build depth at CB"]
}

Keep all text concise. Mention 2-3 key player names. Output ONLY the JSON.`;

    console.log('=== AI TEAM REVIEW DEBUG ===');
    console.log('Team:', teamData.teamName, '- Roster count:', teamData.roster.length);

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    console.log('=== GEMINI RESPONSE ===');
    console.log('Length:', responseText.length);
    console.log('First 200 chars:', responseText.substring(0, 200));
    console.log('Last 100 chars:', responseText.substring(Math.max(0, responseText.length - 100)));

    // Extract JSON from response - try multiple strategies
    let jsonText = responseText.trim();

    // Strategy 1: Remove markdown code blocks
    if (jsonText.includes('```')) {
      const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1].trim();
      }
    }

    // Strategy 2: Find JSON object by looking for { ... }
    if (!jsonText.startsWith('{')) {
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    // Parse AI response as JSON
    let aiReview: AIReviewResponse;
    try {
      aiReview = JSON.parse(jsonText);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', parseError);
      console.error('Raw response (first 500 chars):', responseText.substring(0, 500));
      console.error('Extracted JSON attempt (first 500 chars):', jsonText.substring(0, 500));
      console.error('=== END DEBUG ===');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'AI response format error',
          fallback: true
        })
      };
    }

    console.log('Parsed review - grade:', aiReview.overallGrade);
    console.log('=== END DEBUG ===');

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
