import { useEffect, useMemo, useState } from 'react';
import type { Player } from '../types';

export interface MaddenRatingInfo {
  matched: boolean;
  confidence?: string;
  source?: string;
  sourceUrl?: string;
  playerKey?: string;
  playerId?: string;
  name?: string;
  team?: string;
  position?: string;
  ability?: string;
  ovr?: number | null;
  spd?: number | null;
  str?: number | null;
  agi?: number | null;
  cod?: number | null;
  inj?: number | null;
  awr?: number | null;
  siteOvr?: number | null;
  delta?: number | null;
  updatedAt?: string;
}

export interface MaddenRatingsData {
  schemaVersion: number;
  source: string;
  sourceUrl: string;
  updatedAt: string;
  totalSourceRatings?: number;
  matchedCount?: number;
  unmatchedCount?: number;
  players: Record<string, MaddenRatingInfo>;
}

const emptyRatings: MaddenRatingsData = {
  schemaVersion: 1,
  source: 'EA Madden Ratings',
  sourceUrl: 'https://www.ea.com/games/madden-nfl/ratings',
  updatedAt: '',
  totalSourceRatings: 0,
  matchedCount: 0,
  unmatchedCount: 0,
  players: {},
};

const teamAliases: Record<string, string> = {
  ARZ: 'ARI',
  JAC: 'JAX',
  WSH: 'WAS',
};

const normalizeName = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const normalizeTeam = (value = '') => {
  const key = value.trim().toUpperCase();
  return teamAliases[key] || key;
};

const getPlayerKey = (player: Player) => `${normalizeName(player.name)}|${normalizeTeam(player.team)}`;

export function useMaddenRatings() {
  const [data, setData] = useState<MaddenRatingsData>(emptyRatings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRatings() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${import.meta.env.BASE_URL}data/madden-ratings.json`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Madden ratings feed returned ${response.status}`);
        }

        const json = (await response.json()) as MaddenRatingsData;

        if (!cancelled) {
          setData({ ...emptyRatings, ...json, players: json.players || {} });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load Madden ratings.');
          setData(emptyRatings);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRatings();

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const getRating = (player?: Player | null) => {
      if (!player) return undefined;
      return data.players[getPlayerKey(player)] || data.players[player.id];
    };

    const getLiveOvr = (player?: Player | null) => {
      const rating = getRating(player);
      return rating?.matched && typeof rating.ovr === 'number' ? rating.ovr : player?.ovr;
    };

    const applyRating = <T extends Player>(player: T): T => {
      const rating = getRating(player);
      if (!rating?.matched || typeof rating.ovr !== 'number') return player;
      return { ...player, ovr: rating.ovr };
    };

    return {
      data,
      loading,
      error,
      getRating,
      getLiveOvr,
      applyRating,
      updatedAt: data.updatedAt,
      hasRatings: Object.keys(data.players).length > 0,
    };
  }, [data, loading, error]);
}
