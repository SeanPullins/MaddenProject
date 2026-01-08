// UI Types
export enum Page {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  MY_TEAM = 'MY_TEAM', // Keeping for legacy/user specific view if needed
  TEAMS = 'TEAMS', // New Franchise/Teams view
  PLAYERS = 'PLAYERS',
  STANDINGS = 'STANDINGS',
  COMPARISON = 'COMPARISON',
  DRAFTS = 'DRAFTS', // New Draft History
  HIT_RATES = 'HIT_RATES', // New Hit Rates Page
  SETTINGS = 'SETTINGS',
  // AI_EVAL = 'AI_EVAL', // DISABLED - AI Evaluation not working
  LEAGUE_HUB = 'LEAGUE_HUB', // NEW: League management
  DRAFT_BOARD = 'DRAFT_BOARD', // NEW: Live draft board
  TRADES = 'TRADES', // NEW: Trade center
  GM_PROFILES = 'GM_PROFILES', // NEW: GM profiles
}

// Data Types
export interface PlayerAttribute {
  name: string;
  value: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string; // Real NFL Team (e.g., MIA, KC)
  ovr: number; // The "Rate" or Score
  imageUrl: string;
  attributes?: PlayerAttribute[];
  projectedPoints?: number;
  
  // Franchise Specifics
  draftRound?: string; // e.g., "1st", "FA 2023"
  faYear?: string; // e.g., "2027"
  status?: 'ACTIVE' | 'PRACTICE_SQUAD' | 'FORMER';
  depthOrder?: number; // 1 = Starter, 2 = Backup, etc.
}

export interface FormerPlayer {
  name: string;
  reason: string;
  compensation?: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  owner: string;
  avatarUrl: string;
  record: string;
  tagsSaved: number;
  roster: Player[];
  practiceSquad: Player[];
  formerPlayers: FormerPlayer[];
  assets?: {
      [year: string]: string[]; // Draft picks per year
  };
}

export interface Matchup {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  week: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINAL';
}

// ============================================
// FRANCHISE & MULTIPLAYER TYPES (NEW)
// ============================================

// GM Profile
export interface GMProfile {
  id: string;
  username: string;
  teamId?: string;
  record: string;
  championships: number;
  draftHistory: DraftPick[];
  joinedDate: string;
  avatarUrl?: string;
}

// League System
export interface League {
  id: string;
  name: string;
  commissionerId: string;
  teams: Team[];
  draftState: DraftState | null;
  trades: Trade[];
  chat: ChatMessage[];
  rules: LeagueRules;
  createdAt: string;
  season: number;
  inviteCode?: string;
}

export interface LeagueRules {
  maxTeams: number;
  draftRounds: number;
  timerPerPick: number; // seconds
  draftType: 'snake' | 'linear';
  tradeDeadline?: string;
  rosterSize: number;
  practiceSquadSize: number;
}

// Draft System
export interface DraftState {
  leagueId: string;
  draftOrder: string[]; // team IDs
  currentPick: number;
  currentRound: number;
  picks: DraftPick[];
  isActive: boolean;
  startedAt?: string;
  timerExpiresAt?: string;
}

export interface DraftPick {
  id: string;
  leagueId: string;
  round: number;
  pickNumber: number;
  teamId: string;
  playerId?: string;
  playerName?: string;
  timestamp?: string;
  isAutoPick?: boolean;
}

// Trade System
export interface Trade {
  id: string;
  leagueId: string;
  fromTeamId: string;
  toTeamId: string;
  offeredAssets: TradeAsset[];
  requestedAssets: TradeAsset[];
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  proposedAt: string;
  resolvedAt?: string;
  counterOffer?: TradeAsset[];
}

export interface TradeAsset {
  type: 'player' | 'draft_pick';
  playerId?: string;
  playerName?: string;
  draftPick?: {
    round: number;
    year: number;
  };
}

// Chat System
export interface ChatMessage {
  id: string;
  leagueId: string;
  gmId: string;
  gmName: string;
  message: string;
  timestamp: string;
  tradeId?: string; // Optional: link to trade thread
}

// Leaderboard & Analytics
export interface PowerRanking {
  teamId: string;
  rank: number;
  score: number;
  inputs: {
    teamOvr: number;
    depth: number;
    momentum: number;
  };
  week: number;
}

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  value: number;
  rank: number;
}

export type LeaderboardType =
  | 'wins_losses'
  | 'point_differential'
  | 'championships'
  | 'draft_efficiency';