/**
 * League Storage Utilities
 * Manages localStorage persistence for leagues, drafts, trades, and chat
 */

import {
  League,
  DraftState,
  Trade,
  ChatMessage,
  GMProfile,
  PowerRanking,
} from '../types';

const STORAGE_KEYS = {
  LEAGUES: 'fanleague_leagues',
  CURRENT_LEAGUE: 'fanleague_current_league_id',
  GM_PROFILE: 'fanleague_gm_profile',
  DRAFT_STATES: 'fanleague_draft_states',
  TRADES: 'fanleague_trades',
  CHAT: 'fanleague_chat',
  POWER_RANKINGS: 'fanleague_power_rankings',
};

// ============================================
// LEAGUE OPERATIONS
// ============================================

export const saveLeague = (league: League): void => {
  const leagues = getLeagues();
  const index = leagues.findIndex((l) => l.id === league.id);
  if (index >= 0) {
    leagues[index] = league;
  } else {
    leagues.push(league);
  }
  localStorage.setItem(STORAGE_KEYS.LEAGUES, JSON.stringify(leagues));
};

export const getLeagues = (): League[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LEAGUES);
  return data ? JSON.parse(data) : [];
};

export const getLeagueById = (leagueId: string): League | null => {
  const leagues = getLeagues();
  return leagues.find((l) => l.id === leagueId) || null;
};

export const deleteLeague = (leagueId: string): void => {
  const leagues = getLeagues().filter((l) => l.id !== leagueId);
  localStorage.setItem(STORAGE_KEYS.LEAGUES, JSON.stringify(leagues));

  // Clean up related data
  const currentLeagueId = getCurrentLeagueId();
  if (currentLeagueId === leagueId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LEAGUE);
  }
};

export const setCurrentLeagueId = (leagueId: string): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_LEAGUE, leagueId);
};

export const getCurrentLeagueId = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_LEAGUE);
};

export const getCurrentLeague = (): League | null => {
  const leagueId = getCurrentLeagueId();
  return leagueId ? getLeagueById(leagueId) : null;
};

// ============================================
// GM PROFILE OPERATIONS
// ============================================

export const saveGMProfile = (profile: GMProfile): void => {
  localStorage.setItem(STORAGE_KEYS.GM_PROFILE, JSON.stringify(profile));
};

export const getGMProfile = (): GMProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.GM_PROFILE);
  return data ? JSON.parse(data) : null;
};

export const createDefaultGMProfile = (): GMProfile => {
  const profile: GMProfile = {
    id: `gm-${Date.now()}`,
    username: 'Guest GM',
    record: '0-0',
    championships: 0,
    draftHistory: [],
    joinedDate: new Date().toISOString(),
  };
  saveGMProfile(profile);
  return profile;
};

// ============================================
// DRAFT STATE OPERATIONS
// ============================================

export const saveDraftState = (draftState: DraftState): void => {
  const states = getDraftStates();
  const index = states.findIndex((d) => d.leagueId === draftState.leagueId);
  if (index >= 0) {
    states[index] = draftState;
  } else {
    states.push(draftState);
  }
  localStorage.setItem(STORAGE_KEYS.DRAFT_STATES, JSON.stringify(states));

  // Also update the league's draftState
  const league = getLeagueById(draftState.leagueId);
  if (league) {
    league.draftState = draftState;
    saveLeague(league);
  }
};

export const getDraftStates = (): DraftState[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DRAFT_STATES);
  return data ? JSON.parse(data) : [];
};

export const getDraftStateByLeagueId = (leagueId: string): DraftState | null => {
  const states = getDraftStates();
  return states.find((d) => d.leagueId === leagueId) || null;
};

// ============================================
// TRADE OPERATIONS
// ============================================

export const saveTrade = (trade: Trade): void => {
  const trades = getTrades();
  const index = trades.findIndex((t) => t.id === trade.id);
  if (index >= 0) {
    trades[index] = trade;
  } else {
    trades.push(trade);
  }
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));

  // Also update the league's trades
  const league = getLeagueById(trade.leagueId);
  if (league) {
    const leagueTradeIndex = league.trades.findIndex((t) => t.id === trade.id);
    if (leagueTradeIndex >= 0) {
      league.trades[leagueTradeIndex] = trade;
    } else {
      league.trades.push(trade);
    }
    saveLeague(league);
  }
};

export const getTrades = (): Trade[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRADES);
  return data ? JSON.parse(data) : [];
};

export const getTradesByLeagueId = (leagueId: string): Trade[] => {
  const trades = getTrades();
  return trades.filter((t) => t.leagueId === leagueId);
};

export const getTradesByTeamId = (leagueId: string, teamId: string): Trade[] => {
  const trades = getTradesByLeagueId(leagueId);
  return trades.filter(
    (t) => t.fromTeamId === teamId || t.toTeamId === teamId
  );
};

// ============================================
// CHAT OPERATIONS
// ============================================

export const saveChatMessage = (message: ChatMessage): void => {
  const messages = getChatMessages();
  messages.push(message);
  localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(messages));

  // Also update the league's chat
  const league = getLeagueById(message.leagueId);
  if (league) {
    league.chat.push(message);
    saveLeague(league);
  }
};

export const getChatMessages = (): ChatMessage[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHAT);
  return data ? JSON.parse(data) : [];
};

export const getChatMessagesByLeagueId = (leagueId: string): ChatMessage[] => {
  const messages = getChatMessages();
  return messages.filter((m) => m.leagueId === leagueId);
};

// ============================================
// POWER RANKINGS OPERATIONS
// ============================================

export const savePowerRankings = (rankings: PowerRanking[]): void => {
  localStorage.setItem(STORAGE_KEYS.POWER_RANKINGS, JSON.stringify(rankings));
};

export const getPowerRankings = (): PowerRanking[] => {
  const data = localStorage.getItem(STORAGE_KEYS.POWER_RANKINGS);
  return data ? JSON.parse(data) : [];
};

export const getPowerRankingsByWeek = (week: number): PowerRanking[] => {
  const rankings = getPowerRankings();
  return rankings.filter((r) => r.week === week);
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const findLeagueByInviteCode = (code: string): League | null => {
  const leagues = getLeagues();
  return leagues.find((l) => l.inviteCode === code) || null;
};

export const clearAllLeagueData = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};
