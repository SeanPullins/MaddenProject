/**
 * Official NFL team colors for Player Cards
 * Each team has a primary (background) and secondary (accent) color
 */

export interface TeamColors {
  primary: string;
  secondary: string;
}

export const TEAM_COLORS: Record<string, TeamColors> = {
  // AFC East
  BUF: { primary: '#00338D', secondary: '#C60C30' },
  MIA: { primary: '#008E97', secondary: '#FC4C02' },
  NE: { primary: '#002244', secondary: '#C60C30' },
  NYJ: { primary: '#125740', secondary: '#FFFFFF' },

  // AFC North
  BAL: { primary: '#241773', secondary: '#000000' },
  CIN: { primary: '#FB4F14', secondary: '#000000' },
  CLE: { primary: '#311D00', secondary: '#FF3C00' },
  PIT: { primary: '#FFB612', secondary: '#101820' },

  // AFC South
  HOU: { primary: '#03202F', secondary: '#A71930' },
  IND: { primary: '#002C5F', secondary: '#A2AAAD' },
  JAX: { primary: '#006778', secondary: '#D7A22A' },
  TEN: { primary: '#0C2340', secondary: '#4B92DB' },

  // AFC West
  DEN: { primary: '#FB4F14', secondary: '#002244' },
  KC: { primary: '#E31837', secondary: '#FFB81C' },
  LAC: { primary: '#0080C6', secondary: '#FFC20E' },
  LV: { primary: '#000000', secondary: '#A5ACAF' },
  LVR: { primary: '#000000', secondary: '#A5ACAF' }, // Alternate code

  // NFC East
  DAL: { primary: '#041E42', secondary: '#869397' },
  NYG: { primary: '#0B2265', secondary: '#A71930' },
  PHI: { primary: '#004C54', secondary: '#A5ACAF' },
  WAS: { primary: '#5A1414', secondary: '#FFB612' },
  WSH: { primary: '#5A1414', secondary: '#FFB612' }, // Alternate code

  // NFC North
  CHI: { primary: '#0B162A', secondary: '#C83803' },
  DET: { primary: '#0076B6', secondary: '#B0B7BC' },
  GB: { primary: '#203731', secondary: '#FFB612' },
  MIN: { primary: '#4F2683', secondary: '#FFC62F' },

  // NFC South
  ATL: { primary: '#A71930', secondary: '#000000' },
  CAR: { primary: '#0085CA', secondary: '#101820' },
  NO: { primary: '#D3BC8D', secondary: '#101820' },
  TB: { primary: '#D50A0A', secondary: '#34302B' },

  // NFC West
  ARZ: { primary: '#97233F', secondary: '#000000' },
  ARI: { primary: '#97233F', secondary: '#000000' }, // Alternate code
  LAR: { primary: '#003594', secondary: '#FFA300' },
  SF: { primary: '#AA0000', secondary: '#B3995D' },
  SEA: { primary: '#002244', secondary: '#69BE28' },

  // Special cases
  FA: { primary: '#475569', secondary: '#94A3B8' }, // Free Agent
  UN: { primary: '#475569', secondary: '#94A3B8' }, // Unsigned
  Unknown: { primary: '#475569', secondary: '#94A3B8' }, // Unknown team
};

/**
 * Get team colors with fallback to neutral slate colors
 */
export const getTeamColors = (team: string): TeamColors => {
  return TEAM_COLORS[team] || { primary: '#475569', secondary: '#94A3B8' };
};
