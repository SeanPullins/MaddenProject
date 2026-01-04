import type { Handler } from '@netlify/functions';
// Reverting to the package you definitely have installed
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

    // FIX: Use the explicit version 'gemini-1.5-flash-001'
    // This resolves the 404 error on the Beta SDK you are using
    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash-001', 
      contents: prompt,
    });

    // Handle the response text safely for the Beta SDK
    // The Beta SDK returns a result object, we check for text() method or fall back to properties
    let responseText = "";
    if (typeof result.text === 'function') {
        responseText = result.text();
    } else if (result.text) {
        responseText = result.text;
    } else {
        // Deep fallback if the structure is raw
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
