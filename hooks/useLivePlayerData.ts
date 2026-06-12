import { useEffect, useState } from 'react';

export interface LivePlayerInfo {
  matched: boolean;
  source?: string;
  updatedAt?: string;

  sleeperId?: string | null;
  espnId?: string | null;
  yahooId?: string | null;
  rotowireId?: string | null;
  sportradarId?: string | null;

  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;

  currentTeam?: string | null;
  team?: string | null;
  position?: string | null;
  number?: number | string | null;
  active?: boolean | null;
  status?: string | null;

  injuryStatus?: string | null;
  injuryStartDate?: string | null;
  injuryBodyPart?: string | null;
  injuryNotes?: string | null;
  practiceParticipation?: string | null;

  age?: number | null;
  birthDate?: string | null;
  height?: string | null;
  weight?: string | null;
  college?: string | null;
  yearsExp?: number | null;

  depthChartOrder?: number | null;
  depthChartPosition?: string | null;
  fantasyPositions?: string[];

  searchRank?: number | null;
  hashtag?: string | null;

  trendingAddCount?: number;
  trendingDropCount?: number;
  trendingDirection?: 'rising' | 'falling' | 'neutral' | string;

  rosterStatusNote?: string;
  availabilityNote?: string;

  latestNews?: {
    title: string;
    source?: string;
    url: string;
    publishedAt?: string;
  }[];

  newsLinks?: {
    googleNewsUrl?: string;
    espnUrl?: string;
  };
}

interface LivePlayerData {
  generatedAt: string;
  source: string;
  count: number;
  players: Record<string, LivePlayerInfo>;
}

export function useLivePlayerData() {
  const [data, setData] = useState<LivePlayerData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}data/player-live.json`, {
          cache: 'no-store',
        });

        if (!response.ok) return;

        const json = await response.json();
        setData(json);
      } catch {
        setData(null);
      }
    };

    load();
  }, []);

  return data;
}
