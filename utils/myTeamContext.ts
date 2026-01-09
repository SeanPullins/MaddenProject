/**
 * My Team Context Utilities
 *
 * Provides global access to the user's default team name.
 * This team is used as the default context across FanLeague.
 */

const MY_TEAM_STORAGE_KEY = 'fanleague_my_team';

/**
 * Get the user's default team name
 * @returns The team name or null if not set
 */
export const getMyTeam = (): string | null => {
  return localStorage.getItem(MY_TEAM_STORAGE_KEY);
};

/**
 * Set the user's default team name
 * @param teamName The team name to set
 */
export const setMyTeam = (teamName: string): void => {
  localStorage.setItem(MY_TEAM_STORAGE_KEY, teamName);
};

/**
 * Clear the user's default team name
 */
export const clearMyTeam = (): void => {
  localStorage.removeItem(MY_TEAM_STORAGE_KEY);
};

/**
 * Check if a team name is set
 * @returns true if a team name exists
 */
export const hasMyTeam = (): boolean => {
  const team = getMyTeam();
  return team !== null && team.trim().length > 0;
};

/**
 * Get the user's team name or a default fallback
 * @param fallback The fallback value if no team is set (default: 'My Team')
 * @returns The team name or fallback
 */
export const getMyTeamOrDefault = (fallback: string = 'My Team'): string => {
  const team = getMyTeam();
  return team && team.trim().length > 0 ? team : fallback;
};
