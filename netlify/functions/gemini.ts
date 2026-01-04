import type { Handler } from '@netlify/functions';
import { GoogleGenAI } from '@google/genai';

export const handler: Handler = async (event) => {
  // Allow POST only
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const prompt = body.prompt;

    if (!prompt) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Prompt is required' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing GEMINI_API_KEY' }),
      };
    }

    // ✅ CRITICAL FIX: explicitly use v1 API
    const ai = new GoogleGenAI({
      apiKey,
      apiVersion: 'v1',
    });

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: result.text,
      }),
    };
  } catch (err: any) {
    console.error('Gemini function error:', err);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: err?.message || 'Internal Server Error',
      }),
    };
  }
};

