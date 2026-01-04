import { GoogleGenAI } from '@google/genai';

interface RequestBody {
  prompt: string;
}

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { prompt }: RequestBody = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    // Get API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' }),
      };
    }

    // Initialize Gemini client
    const ai = new GoogleGenAI({ apiKey });

    // Generate content using the models API
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
    });

    // Extract text from response
    const text = result.text;

    if (!text) {
      throw new Error('No text content in response');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ response: text }),
    };
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to generate AI response',
        details: error.message
      }),
    };
  }
};
