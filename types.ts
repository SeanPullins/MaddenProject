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
  AI_EVAL = 'AI_EVAL', // New AI Evaluation Page
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