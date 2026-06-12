import { Player } from '../types';
import type { LivePlayerInfo } from '../hooks/useLivePlayerData';
import { supabase } from '../lib/supabaseClient';

export interface PlayerAiResponse {
  analysis: string;
  model?: string;
  generatedAt?: string;
}

export async function evaluatePlayerWithAi(
  player: Player,
  live?: LivePlayerInfo
): Promise<PlayerAiResponse> {
  if (!supabase) {
    throw new Error('Supabase is not configured, so AI evaluation is unavailable.');
  }

  const { data, error } = await supabase.functions.invoke<PlayerAiResponse>('evaluate-player', {
    body: {
      player,
      live: live || null,
    },
  });

  if (error) {
    throw new Error(error.message || 'AI evaluation failed.');
  }

  if (!data?.analysis) {
    throw new Error('AI evaluation returned no analysis.');
  }

  return data;
}
