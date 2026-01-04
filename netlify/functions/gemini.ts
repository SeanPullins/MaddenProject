import type { Handler } from '@netlify/functions';
// CHANGE 1: Use the stable SDK import
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // CHANGE 2: Initialize the stable client
    const genAI = new GoogleGenerativeAI(apiKey);

    // CHANGE 3: Get the specific model instance
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // CHANGE 4: Generate content
    const result = await model.generateContent(prompt);
    
    // CHANGE 5: Await the response and extract text
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
      }),
    };
  } catch (err: any) {
    console.error('Gemini function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        // Log the full error to help debugging if this persists
        error: err.message || 'Internal Server Error',
        details: err.toString()
      }),
    };
  }
};
