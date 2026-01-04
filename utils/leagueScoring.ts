import { Team, Player } from '../types';

// Positions to evaluate for scoring
const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'ED', 'DT', 'LB', 'CB', 'S'];

export interface PositionScore {
  position: string;
  playerOvr: number;
  rank: number;
  points: number;
}

export interface DepthScore {
  position: string;
  depthOvr: number;
  points: number;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  owner: string;
  positionScores: PositionScore[];
  depthScores: DepthScore[];
  extraStartersBonus: number;
  totalScore: number;
  breakdown: {
    positionalLeaders: number;
    depthBonus: number;
    extraStarters: number;
  };
}

/**
 * Get the highest-rated player at a position for a team (any active player)
 * CORRECTED: Now looks at ALL active players, not just starters
 */
const getTopPlayerAtPosition = (team: Team, position: string): Player | null => {
  const playersAtPosition = team.roster.filter(
    (p) => p.position === position && p.status === 'ACTIVE'
  );

  if (playersAtPosition.length === 0) return null;

  // Return highest OVR player at this position
  return playersAtPosition.reduce((best, current) =>
    (current.ovr > best.ovr ? current : best)
  );
};

/**
 * Get the highest-rated non-starter (depthOrder !== 1) at a position for a team
 */
const getTopDepthAtPosition = (team: Team, position: string): Player | null => {
  const depth = team.roster.filter(
    (p) =>
      p.position === position &&
      p.status === 'ACTIVE' &&
      (p.depthOrder === undefined || p.depthOrder > 1)
  );

  if (depth.length === 0) return null;

  // Return highest OVR depth player
  return depth.reduce((best, current) => (current.ovr > best.ovr ? current : best));
};

/**
 * Count extra starters beyond typical lineup
 * Players with depthOrder === 1 beyond standard formation get 0.5 pts each
 */
const getExtraStartersCount = (team: Team): number => {
  // Count starters at each position
  const startersByPosition: Record<string, number> = {};

  team.roster
    .filter((p) => p.status === 'ACTIVE' && p.depthOrder === 1)
    .forEach((p) => {
      startersByPosition[p.position] = (startersByPosition[p.position] || 0) + 1;
    });

  // Typical starting lineup: 1 QB, 2 RB, 3 WR, 1 TE, 5 OL, 2 ED, 2 DT, 3 LB, 2 CB, 2 S
  const typicalStarters: Record<string, number> = {
    QB: 1,
    RB: 2,
    WR: 3,
    TE: 1,
    OL: 5,
    ED: 2,
    DT: 2,
    LB: 3,
    CB: 2,
    S: 2,
  };

  let extraCount = 0;
  Object.keys(startersByPosition).forEach((pos) => {
    const actual = startersByPosition[pos];
    const typical = typicalStarters[pos] || 0;
    if (actual > typical) {
      extraCount += actual - typical;
    }
  });

  return extraCount;
};

/**
 * Calculate league scores for all teams
 * CORRECTED SCORING LOGIC:
 * 1. Positional Leaders: Rank teams by HIGHEST OVR PLAYER at each position
 *    - 1st: 5 pts, 2nd: 3 pts, 3rd: 2 pts, rest: 1 pt
 *    - QB Bonus: +2 pts (so QB: 7/5/3/1)
 * 2. Depth Bonus: Best non-starter at each position gets +1 pt
 * 3. Extra Starters: Players marked as starters beyond typical lineup get +0.5 pts each
 */
export const calculateLeagueScores = (teams: Team[]): TeamScore[] => {
  const teamScores: TeamScore[] = [];

  // Initialize team score entries
  teams.forEach((team) => {
    teamScores.push({
      teamId: team.id,
      teamName: team.name,
      owner: team.owner,
      positionScores: [],
      depthScores: [],
      extraStartersBonus: 0,
      totalScore: 0,
      breakdown: {
        positionalLeaders: 0,
        depthBonus: 0,
        extraStarters: 0,
      },
    });
  });

  // Section 1: Positional Leaders (CORRECTED - now uses ALL active players)
  POSITIONS.forEach((position) => {
    // Get top player at this position for each team (ANY active player, not just starters)
    const teamPlayers = teams.map((team) => ({
      team,
      player: getTopPlayerAtPosition(team, position),
    }));

    // Filter out teams with no player at this position
    const validPlayers = teamPlayers.filter((tp) => tp.player !== null);

    if (validPlayers.length === 0) return;

    // Sort by OVR descending (highest to lowest)
    validPlayers.sort((a, b) => b.player!.ovr - a.player!.ovr);

    // Award points based on rank
    validPlayers.forEach((tp, index) => {
      const rank = index + 1;
      let points = 1; // Default for rest

      // Base points based on rank
      if (rank === 1) points = 5;
      else if (rank === 2) points = 3;
      else if (rank === 3) points = 2;

      // QB bonus: +2 additional points
      if (position === 'QB') {
        if (rank === 1) points = 7;      // 5 + 2
        else if (rank === 2) points = 5;  // 3 + 2
        else if (rank === 3) points = 3;  // 2 + 2
        // rest stays 1 (no QB bonus for 4th+)
      }

      // Find team score entry and add position score
      const teamScore = teamScores.find((ts) => ts.teamId === tp.team.id);
      if (teamScore) {
        teamScore.positionScores.push({
          position,
          playerOvr: tp.player!.ovr,
          rank,
          points,
        });
      }
    });
  });

  // Section 2: Depth Bonus (best non-starter at each position gets +1 pt)
  POSITIONS.forEach((position) => {
    // Get top depth player at this position for each team
    const teamDepth = teams.map((team) => ({
      team,
      player: getTopDepthAtPosition(team, position),
    }));

    // Filter out teams with no depth at this position
    const validDepth = teamDepth.filter((td) => td.player !== null);

    if (validDepth.length === 0) return;

    // Find the highest OVR depth player across all teams
    const bestDepth = validDepth.reduce((best, current) =>
      current.player!.ovr > best.player!.ovr ? current : best
    );

    // Award 1 point to team with best depth at this position
    const teamScore = teamScores.find((ts) => ts.teamId === bestDepth.team.id);
    if (teamScore) {
      teamScore.depthScores.push({
        position,
        depthOvr: bestDepth.player!.ovr,
        points: 1,
      });
    }
  });

  // Section 3: Extra Starters Bonus (0.5 pts per extra starter)
  teams.forEach((team) => {
    const extraCount = getExtraStartersCount(team);
    const extraPoints = extraCount * 0.5;

    const teamScore = teamScores.find((ts) => ts.teamId === team.id);
    if (teamScore) {
      teamScore.extraStartersBonus = extraPoints;
    }
  });

  // Calculate totals
  teamScores.forEach((ts) => {
    ts.breakdown.positionalLeaders = ts.positionScores.reduce((sum, ps) => sum + ps.points, 0);
    ts.breakdown.depthBonus = ts.depthScores.reduce((sum, ds) => sum + ds.points, 0);
    ts.breakdown.extraStarters = ts.extraStartersBonus;
    ts.totalScore = ts.breakdown.positionalLeaders + ts.breakdown.depthBonus + ts.breakdown.extraStarters;
  });

  // Sort by total score descending (highest score wins)
  teamScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    // Tiebreaker: alphabetical by team name
    return a.teamName.localeCompare(b.teamName);
  });

  return teamScores;
};

/**
 * Get the league winner (highest total score)
 */
export const getLeagueWinner = (teamScores: TeamScore[]): TeamScore | null => {
  if (teamScores.length === 0) return null;
  return teamScores[0]; // Already sorted by score descending
};
