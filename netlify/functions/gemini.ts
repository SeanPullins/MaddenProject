import type { Handler } from '@netlify/functions';
// We use the SDK that is ALREADY in your package.json
import { GoogleGenAI } from '@google/genai';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { prompt } = JSON.parse(event.body || '{}');

    if (!prompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    // FIX 1: Use 'gemini-1.5-flash-001'
    // The specific version number bypasses the alias issues causing the 404 on this SDK.
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash-001', 
      contents: prompt,
    });

    // FIX 2: Safely extract text for this specific SDK
    // The @google/genai SDK response structure can vary, this covers all bases.
    let responseText = "";
    if (result && typeof result.text === 'function') {
        responseText = result.text();
    } else if (result && result.text) {
        responseText = result.text;
    } else {
        responseText = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

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
