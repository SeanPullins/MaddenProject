import { useEffect, useState } from 'react';

export interface LivePlayerInfo {
  matched: boolean;
  source?: string;
  updatedAt?: string;
  sleeperId?: string | null;
  espnId?: string | null;
  fullName?: string | null;
  team?: string | null;
  position?: string | null;
  status?: string | null;
  injuryStatus?: string | null;
  injuryStartDate?: string | null;
  practiceParticipation?: string | null;
  age?: number | null;
  height?: string | null;
  weight?: string | null;
  college?: string | null;
  yearsExp?: number | null;
  depthChartOrder?: number | null;
  depthChartPosition?: string | null;
  fantasyPositions?: string[];
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
