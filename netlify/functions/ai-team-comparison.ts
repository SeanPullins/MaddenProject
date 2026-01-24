import { Handler } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Team Comparison Netlify Function
 *
 * SAFETY: This function is completely isolated from existing site logic.
 * - Reads team data only (no mutations)
 * - Returns ephemeral AI analysis (not persisted)
 * - Does NOT affect rankings, scores, or any existing data
 * - Gracefully handles errors without breaking the UI
 */

interface TeamComparisonRequest {
  teamA: {
    name: string;
    owner: string;
    players: Array<{ name: string; position: string; ovr: number }>;
    type: 'offense' | 'defense';
    formation?: string;
  };
  teamB: {
    name: string;
    owner: string;
    players: Array<{ name: string; position: string; ovr: number }>;
    type: 'offense' | 'defense';
    formation?: string;
  };
  matchupType: string;
}

interface AIComparisonResponse {
  prediction: string;
  winProbability: {
    teamA: number;
    teamB: number;
  };
  keyMatchups: string[];
  teamAAdvantages: string[];
  teamBAdvantages: string[];
  strategicInsights: string[];
  finalVerdict: string;
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
    // Parse comparison data from request body
    const comparisonData: TeamComparisonRequest = JSON.parse(event.body || '{}');

    if (!comparisonData.teamA || !comparisonData.teamB) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Both teams are required' })
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
        maxOutputTokens: 2048,
        temperature: 0.7
      }
    });

    // Build roster summaries
    const teamAPlayers = comparisonData.teamA.players
      .map(p => `${p.name} ${p.position} (${p.ovr})`)
      .join(', ');
    const teamBPlayers = comparisonData.teamB.players
      .map(p => `${p.name} ${p.position} (${p.ovr})`)
      .join(', ');

    // Create AI prompt for matchup analysis
    const prompt = `Analyze this fantasy football matchup.

MATCHUP: ${comparisonData.matchupType}

TEAM A (${comparisonData.teamA.name} - ${comparisonData.teamA.owner}):
Type: ${comparisonData.teamA.type.toUpperCase()}${comparisonData.teamA.formation ? ` - ${comparisonData.teamA.formation}` : ''}
Players: ${teamAPlayers}

TEAM B (${comparisonData.teamB.name} - ${comparisonData.teamB.owner}):
Type: ${comparisonData.teamB.type.toUpperCase()}${comparisonData.teamB.formation ? ` - ${comparisonData.teamB.formation}` : ''}
Players: ${teamBPlayers}

Return this exact structure:
{
  "prediction": "Team A",
  "winProbability": {
    "teamA": 60,
    "teamB": 40
  },
  "keyMatchups": ["matchup 1", "matchup 2", "matchup 3"],
  "teamAAdvantages": ["advantage 1", "advantage 2"],
  "teamBAdvantages": ["advantage 1", "advantage 2"],
  "strategicInsights": ["insight 1", "insight 2", "insight 3"],
  "finalVerdict": "Brief paragraph explaining the prediction"
}

Keep all text concise. Mention specific player names and OVR ratings.`;

    // Call Gemini API (JSON mode ensures valid JSON response)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // Parse AI response as JSON (should be clean JSON due to JSON mode)
    let aiComparison: AIComparisonResponse;
    try {
      aiComparison = JSON.parse(responseText.trim());
    } catch (parseError) {
      // Fallback: try extracting JSON if wrapped in markdown
      console.error('Failed to parse AI comparison as JSON:', parseError);
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
        aiComparison = JSON.parse(jsonText);
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
    if (!aiComparison.prediction || !aiComparison.winProbability || !aiComparison.finalVerdict) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Incomplete AI response',
          fallback: true
        })
      };
    }

    // Return successful AI comparison
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        success: true,
        comparison: aiComparison
      })
    };

  } catch (err: any) {
    console.error('AI Team Comparison error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || 'Internal Server Error',
        fallback: true
      })
    };
  }
};
