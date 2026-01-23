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

    // Initialize Gemini AI with JSON mode
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
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
  "overallGrade": "A+ to D-",
  "strengths": ["point 1", "point 2", "point 3"],
  "weaknesses": ["point 1", "point 2"],
  "positionalNotes": ["QB/RB/WR note", "defense note"],
  "draftAnalysis": "Brief paragraph on draft strategy",
  "recommendations": ["tip 1", "tip 2", "tip 3"]
}

Keep all text concise. Mention 2-3 key player names. Output ONLY the JSON.`;

    // Call Gemini API (JSON mode ensures valid JSON response)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // Parse AI response as JSON (should be clean JSON due to JSON mode)
    let aiReview: AIReviewResponse;
    try {
      aiReview = JSON.parse(responseText.trim());
    } catch (parseError) {
      // Fallback: try extracting JSON if wrapped in markdown
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response (first 500 chars):', responseText.substring(0, 500));

      let jsonText = responseText.trim();

      // Remove markdown code blocks if present
      if (jsonText.includes('```')) {
        const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1].trim();
        }
      }

      // Find JSON object
      if (!jsonText.startsWith('{')) {
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      try {
        aiReview = JSON.parse(jsonText);
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError);
        console.error('Extracted JSON attempt (first 500 chars):', jsonText.substring(0, 500));
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: 'AI response format error',
            fallback: true
          })
        };
      }
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
