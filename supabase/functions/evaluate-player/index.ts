const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface PlayerPayload {
  player?: Record<string, unknown>;
  live?: Record<string, unknown> | null;
}

function compact(value: unknown) {
  return JSON.stringify(value, null, 2).slice(0, 12000);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
  const model = Deno.env.get('OPENROUTER_MODEL') || 'openai/gpt-4o-mini';

  if (!openRouterKey) {
    return new Response(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY in Supabase Edge Function secrets.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let payload: PlayerPayload;

  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { player, live } = payload;

  if (!player) {
    return new Response(JSON.stringify({ error: 'Missing player payload.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const prompt = `You are an NFL roster analyst and Madden franchise scout. Evaluate the player for a Madden franchise league.

Rules:
- Use only the data provided below.
- Do not invent injuries, transactions, rumors, stats, or news.
- If recent headlines are provided, treat them as signals and cite them by title/source in plain text.
- If recent headlines are missing, say no recent headline feed is available.
- Be direct, useful, and commissioner-friendly.
- Keep the response under 450 words.

Return these sections:
1. Quick Verdict
2. Current Roster / News Read
3. Madden Projection
4. Franchise Use
5. Risk Level
6. Recommended Action

Madden player data:
${compact(player)}

Live NFL data and headline feed:
${compact(live)}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openRouterKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://seanpullins.github.io/MaddenProject/',
      'X-Title': 'MaddenProject Player Evaluator',
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 850,
      messages: [
        {
          role: 'system',
          content: 'You are a concise NFL and Madden franchise analyst. Never fabricate current news. Use provided data only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    return new Response(JSON.stringify({
      error: result?.error?.message || result?.message || `OpenRouter request failed with ${response.status}`,
    }), {
      status: response.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const analysis = result?.choices?.[0]?.message?.content;

  if (!analysis) {
    return new Response(JSON.stringify({ error: 'OpenRouter returned no analysis.' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({
    analysis,
    model: result?.model || model,
    generatedAt: new Date().toISOString(),
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
