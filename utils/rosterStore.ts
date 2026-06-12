/**
 * Roster Store — single source of truth for team/player data.
 *
 * Base data comes from constants.ts. Commissioner edits are stored as sparse
 * overrides. Overrides are cached in localStorage and, when Supabase is
 * configured, synced through the league_roster_overrides table so every viewer
 * sees the official commissioner-approved roster.
 *
 * All pages should consume teams via useTeams() (or getMergedTeams() outside
 * React) so OVR updates propagate instantly to Standings, Players, etc.
 */
import { useEffect, useSyncExternalStore } from 'react';
import { ALL_TEAMS } from '../constants';
import { Player, Team } from '../types';
import { supabase } from '../lib/supabaseClient';

const OVERRIDES_KEY = 'fanleague_roster_overrides_v1';
const REMOTE_ROW_ID = 'main';

export interface PlayerPatch {
  name?: string;
  position?: string;
  team?: string; // NFL team
  ovr?: number;
  depthOrder?: number;
  status?: Player['status'];
}

export interface RosterOverrides {
  /** playerId -> partial edits */
  patches: Record<string, PlayerPatch>;
  /** teamId -> players added via the Control Panel */
  added: Record<string, Player[]>;
  /** playerIds removed from rosters */
  removed: string[];
  updatedAt?: string;
}

const EMPTY: RosterOverrides = { patches: {}, added: {}, removed: [] };

const normalizeOverrides = (value: any): RosterOverrides => ({
  patches: value?.patches ?? {},
  added: value?.added ?? {},
  removed: Array.isArray(value?.removed) ? value.removed : [],
  updatedAt: value?.updatedAt,
});

const cloneOverrides = (value: RosterOverrides): RosterOverrides => ({
  patches: { ...value.patches },
  added: Object.fromEntries(Object.entries(value.added).map(([teamId, players]) => [teamId, [...players]])),
  removed: [...value.removed],
  updatedAt: value.updatedAt,
});

// ----- persistence -----
const loadLocalOverrides = (): RosterOverrides => {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return EMPTY;
    return normalizeOverrides(JSON.parse(raw));
  } catch {
    return EMPTY;
  }
};

let overrides: RosterOverrides = typeof window !== 'undefined' ? loadLocalOverrides() : EMPTY;
let mergedCache: Team[] | null = null;
let remoteLoaded = false;
let remoteLoading = false;
const listeners = new Set<() => void>();

const emit = () => {
  mergedCache = null;
  listeners.forEach((l) => l());
};

const saveLocalOverrides = () => {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
};

const saveRemoteOverrides = async (snapshot: RosterOverrides) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('league_roster_overrides')
    .update({
      data: snapshot,
      updated_at: snapshot.updatedAt ?? new Date().toISOString(),
    })
    .eq('id', REMOTE_ROW_ID);

  if (error) {
    console.warn('Could not sync roster overrides to Supabase:', error.message);
  }
};

const loadRemoteOverrides = async () => {
  if (!supabase || remoteLoaded || remoteLoading) return;

  remoteLoading = true;

  const { data, error } = await supabase
    .from('league_roster_overrides')
    .select('data, updated_at')
    .eq('id', REMOTE_ROW_ID)
    .maybeSingle();

  remoteLoading = false;
  remoteLoaded = true;

  if (error || !data?.data) {
    if (error) console.warn('Could not load Supabase roster overrides:', error.message);
    return;
  }

  overrides = normalizeOverrides({
    ...data.data,
    updatedAt: data.data.updatedAt ?? data.updated_at,
  });

  saveLocalOverrides();
  emit();
};

export const refreshRosterOverrides = async () => {
  remoteLoaded = false;
  await loadRemoteOverrides();
};

const persist = () => {
  overrides.updatedAt = new Date().toISOString();
  saveLocalOverrides();
  emit();
  void saveRemoteOverrides(cloneOverrides(overrides));
};

// ----- merge -----
const applyPatch = (p: Player): Player => {
  const patch = overrides.patches[p.id];
  return patch ? { ...p, ...patch } : p;
};

export const getMergedTeams = (): Team[] => {
  if (mergedCache) return mergedCache;
  const removed = new Set(overrides.removed);
  mergedCache = ALL_TEAMS.map((team) => ({
    ...team,
    roster: [
      ...team.roster.filter((p) => !removed.has(p.id)).map(applyPatch),
      ...(overrides.added[team.id] ?? []).filter((p) => !removed.has(p.id)).map(applyPatch),
    ],
    practiceSquad: team.practiceSquad.filter((p) => !removed.has(p.id)).map(applyPatch),
  }));
  return mergedCache;
};

// ----- subscriptions -----
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** React hook: live-updating merged teams. Drop-in replacement for ALL_TEAMS. */
export const useTeams = (): Team[] => {
  useEffect(() => {
    void loadRemoteOverrides();
  }, []);

  return useSyncExternalStore(subscribe, getMergedTeams, getMergedTeams);
};

export const useOverrides = (): RosterOverrides => {
  useEffect(() => {
    void loadRemoteOverrides();
  }, []);

  return useSyncExternalStore(subscribe, () => overrides, () => overrides);
};

// ----- mutations (used by Control Panel) -----
export const updatePlayer = (playerId: string, patch: PlayerPatch): void => {
  const existing = overrides.patches[playerId] ?? {};
  const next = { ...existing, ...patch };
  // Drop keys that revert to the base value to keep the patch sparse
  const base = findBasePlayer(playerId);
  if (base) {
    (Object.keys(next) as (keyof PlayerPatch)[]).forEach((k) => {
      if (next[k] === (base as any)[k]) delete next[k];
    });
  }
  if (Object.keys(next).length === 0) delete overrides.patches[playerId];
  else overrides.patches[playerId] = next;
  persist();
};

export const revertPlayer = (playerId: string): void => {
  delete overrides.patches[playerId];
  persist();
};

export const addPlayer = (teamId: string, player: Omit<Player, 'id' | 'imageUrl'>): void => {
  const id = `cp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const full: Player = {
    ...player,
    id,
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&color=fff`,
  };
  overrides.added[teamId] = [...(overrides.added[teamId] ?? []), full];
  persist();
};

export const removePlayer = (playerId: string): void => {
  // If it was a Control-Panel-added player, just drop it; otherwise tombstone it
  let wasAdded = false;
  Object.keys(overrides.added).forEach((teamId) => {
    const before = overrides.added[teamId].length;
    overrides.added[teamId] = overrides.added[teamId].filter((p) => p.id !== playerId);
    if (overrides.added[teamId].length !== before) wasAdded = true;
  });
  if (!wasAdded && !overrides.removed.includes(playerId)) overrides.removed.push(playerId);
  delete overrides.patches[playerId];
  persist();
};

export const resetTeam = (teamId: string): void => {
  const base = ALL_TEAMS.find((t) => t.id === teamId);
  if (!base) return;
  const ids = new Set([...base.roster, ...base.practiceSquad].map((p) => p.id));
  Object.keys(overrides.patches).forEach((id) => ids.has(id) && delete overrides.patches[id]);
  overrides.removed = overrides.removed.filter((id) => !ids.has(id));
  delete overrides.added[teamId];
  persist();
};

export const resetAll = (): void => {
  overrides = { patches: {}, added: {}, removed: [] };
  persist();
};

// ----- import / export (for backup or syncing between devices) -----
export const exportOverrides = (): string => JSON.stringify(overrides, null, 2);

export const importOverrides = (json: string): boolean => {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return false;
    overrides = {
      patches: parsed.patches ?? {},
      added: parsed.added ?? {},
      removed: parsed.removed ?? [],
    };
    persist();
    return true;
  } catch {
    return false;
  }
};

// ----- helpers -----
const findBasePlayer = (playerId: string): Player | undefined => {
  for (const t of ALL_TEAMS) {
    const p = t.roster.find((x) => x.id === playerId) || t.practiceSquad.find((x) => x.id === playerId);
    if (p) return p;
  }
  for (const teamId of Object.keys(overrides.added)) {
    const p = overrides.added[teamId].find((x) => x.id === playerId);
    if (p) return p;
  }
  return undefined;
};

export const isPlayerEdited = (playerId: string): boolean => !!overrides.patches[playerId];
export const isPlayerAdded = (playerId: string): boolean => playerId.startsWith('cp-');
export const pendingChangeCount = (): number =>
  Object.keys(overrides.patches).length +
  overrides.removed.length +
  Object.values(overrides.added).reduce((s, a) => s + a.length, 0);
