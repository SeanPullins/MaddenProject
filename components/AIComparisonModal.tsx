import React, { useEffect, useState } from 'react';
import { X, Brain, TrendingUp, Zap, Shield, AlertCircle, Loader, Trophy, Clock } from 'lucide-react';
import { Team } from '../types';

/**
 * AI Comparison Modal Component
 *
 * GitHub Pages cannot securely run server-side AI functions. This component now
 * generates an AI-style matchup report locally from the roster data already in
 * the app, so the button works on the static site with no backend/API cost.
 */

interface AIComparisonModalProps {
  teamA: Team;
  teamB: Team;
  teamAPlayers: Array<{ name: string; position: string; ovr: number }>;
  teamBPlayers: Array<{ name: string; position: string; ovr: number }>;
  teamAType: 'offense' | 'defense';
  teamBType: 'offense' | 'defense';
  matchupDescription: string;
  teamAFormation?: string;
  teamBFormation?: string;
  onClose: () => void;
}

interface AIComparison {
  prediction: string;
  winProbability: {
    teamA: number;
    teamB: number;
  };
  keyMatchups: string[];
  teamAAdvantages: string[];
  teamBAdvantages: string[];
  strategicInsights: string[];
  finalVerdict: string;
}

interface CachedComparison {
  comparison: AIComparison;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'ai_comparison_cache_';
const CACHE_DURATION = 30 * 60 * 1000;
const COOLDOWN_DURATION = 5 * 1000;
const LAST_COMPARISON_KEY = 'ai_comparison_last_request';

const POSITION_GROUPS: Record<string, string[]> = {
  QB: ['QB'],
  RB: ['RB'],
  PASS_CATCHERS: ['WR', 'TE'],
  OL: ['OL', 'OT', 'OG', 'C'],
  DL_EDGE: ['ED', 'DT'],
  LB: ['LB'],
  SECONDARY: ['CB', 'S'],
};

const average = (players: Array<{ ovr: number }>) => {
  if (!players.length) return 0;
  return players.reduce((sum, player) => sum + player.ovr, 0) / players.length;
};

const roundedAverage = (players: Array<{ ovr: number }>) => Math.round(average(players));

const getTopPlayers = (players: Array<{ name: string; position: string; ovr: number }>, count = 3) =>
  [...players].sort((a, b) => b.ovr - a.ovr).slice(0, count);

const getGroupAverage = (
  players: Array<{ name: string; position: string; ovr: number }>,
  positions: string[]
) => average(players.filter((player) => positions.includes(player.position)));

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const buildUnitLabel = (team: Team, unitType: 'offense' | 'defense', formation?: string) => {
  const unit = unitType === 'offense' ? 'offense' : 'defense';
  return `${team.name} ${formation ? `${formation} ` : ''}${unit}`;
};

const buildLocalComparison = ({
  teamA,
  teamB,
  teamAPlayers,
  teamBPlayers,
  teamAType,
  teamBType,
  matchupDescription,
  teamAFormation,
  teamBFormation,
}: Omit<AIComparisonModalProps, 'onClose'>): AIComparison => {
  const avgA = average(teamAPlayers);
  const avgB = average(teamBPlayers);
  const diff = avgA - avgB;
  const teamAProbability = clamp(Math.round(50 + diff * 3), 18, 82);
  const teamBProbability = 100 - teamAProbability;

  const teamATop = getTopPlayers(teamAPlayers, 3);
  const teamBTop = getTopPlayers(teamBPlayers, 3);
  const predictedWinner = diff > 1 ? teamA.name : diff < -1 ? teamB.name : 'Too close to call';

  const teamALabel = buildUnitLabel(teamA, teamAType, teamAFormation);
  const teamBLabel = buildUnitLabel(teamB, teamBType, teamBFormation);

  const keyMatchups: string[] = [];

  if (teamAType === 'offense' && teamBType === 'defense') {
    const qbAvg = getGroupAverage(teamAPlayers, POSITION_GROUPS.QB);
    const secondaryAvg = getGroupAverage(teamBPlayers, POSITION_GROUPS.SECONDARY);
    const passCatchersAvg = getGroupAverage(teamAPlayers, POSITION_GROUPS.PASS_CATCHERS);
    const frontAvg = getGroupAverage(teamBPlayers, POSITION_GROUPS.DL_EDGE);

    keyMatchups.push(
      `Passing game vs secondary: ${teamA.name} QB room/trigger rating ${Math.round(qbAvg || avgA)} against ${teamB.name} coverage group ${Math.round(secondaryAvg || avgB)}.`
    );
    keyMatchups.push(
      `Explosives vs pressure: ${teamA.name} pass catchers average ${Math.round(passCatchersAvg || avgA)} while ${teamB.name}'s front averages ${Math.round(frontAvg || avgB)}.`
    );
  } else if (teamAType === 'defense' && teamBType === 'offense') {
    const frontAvg = getGroupAverage(teamAPlayers, POSITION_GROUPS.DL_EDGE);
    const qbAvg = getGroupAverage(teamBPlayers, POSITION_GROUPS.QB);
    const secondaryAvg = getGroupAverage(teamAPlayers, POSITION_GROUPS.SECONDARY);
    const passCatchersAvg = getGroupAverage(teamBPlayers, POSITION_GROUPS.PASS_CATCHERS);

    keyMatchups.push(
      `Pressure vs quarterback: ${teamA.name}'s front averages ${Math.round(frontAvg || avgA)} against ${teamB.name}'s QB group at ${Math.round(qbAvg || avgB)}.`
    );
    keyMatchups.push(
      `Coverage vs weapons: ${teamA.name}'s secondary average ${Math.round(secondaryAvg || avgA)} against ${teamB.name}'s pass catchers at ${Math.round(passCatchersAvg || avgB)}.`
    );
  } else {
    keyMatchups.push(
      `Top-end talent: ${teamA.name}'s best three average ${roundedAverage(teamATop)} versus ${teamB.name}'s best three average ${roundedAverage(teamBTop)}.`
    );
    keyMatchups.push(
      `Unit depth: ${teamA.name} has ${teamAPlayers.length} qualifying players in this comparison; ${teamB.name} has ${teamBPlayers.length}.`
    );
  }

  if (teamATop[0] && teamBTop[0]) {
    keyMatchups.push(
      `Star matchup: ${teamATop[0].name} (${teamATop[0].position}, ${teamATop[0].ovr}) vs ${teamBTop[0].name} (${teamBTop[0].position}, ${teamBTop[0].ovr}).`
    );
  }

  const teamAAdvantages: string[] = [];
  const teamBAdvantages: string[] = [];

  if (avgA >= avgB) {
    teamAAdvantages.push(`${teamALabel} has the stronger average rating edge: ${avgA.toFixed(1)} vs ${avgB.toFixed(1)}.`);
  } else {
    teamBAdvantages.push(`${teamBLabel} has the stronger average rating edge: ${avgB.toFixed(1)} vs ${avgA.toFixed(1)}.`);
  }

  if (teamATop[0]) {
    teamAAdvantages.push(`Best impact player: ${teamATop[0].name} at ${teamATop[0].ovr} OVR.`);
  }

  if (teamBTop[0]) {
    teamBAdvantages.push(`Best impact player: ${teamBTop[0].name} at ${teamBTop[0].ovr} OVR.`);
  }

  if (teamATop.length >= 3 && teamBTop.length >= 3) {
    const topDiff = average(teamATop) - average(teamBTop);
    if (topDiff >= 1) {
      teamAAdvantages.push(`${teamA.name} has the better top-three player cluster by ${topDiff.toFixed(1)} OVR.`);
    } else if (topDiff <= -1) {
      teamBAdvantages.push(`${teamB.name} has the better top-three player cluster by ${Math.abs(topDiff).toFixed(1)} OVR.`);
    } else {
      teamAAdvantages.push('Top-end talent is nearly even, so execution and scheme matter more than raw ratings.');
      teamBAdvantages.push('Top-end talent is nearly even, so execution and scheme matter more than raw ratings.');
    }
  }

  if (teamAPlayers.length > teamBPlayers.length) {
    teamAAdvantages.push(`${teamA.name} has more usable depth in this unit comparison.`);
  } else if (teamBPlayers.length > teamAPlayers.length) {
    teamBAdvantages.push(`${teamB.name} has more usable depth in this unit comparison.`);
  }

  const strategicInsights: string[] = [];

  if (teamAType === 'offense') {
    strategicInsights.push(`${teamA.name} should lean into its highest-rated skill players and avoid obvious passing downs if the defensive front has the edge.`);
  } else {
    strategicInsights.push(`${teamA.name} should force long-yardage situations and let the best-rated defenders dictate the matchup.`);
  }

  if (teamBType === 'offense') {
    strategicInsights.push(`${teamB.name} should protect its weakest position group by using quick concepts, motion, and favorable personnel looks.`);
  } else {
    strategicInsights.push(`${teamB.name} should disguise coverage and make the opposing unit win without relying only on its top player.`);
  }

  strategicInsights.push(
    `Formation context matters: ${teamAFormation || 'base look'} vs ${teamBFormation || 'base look'} changes which position groups are stressed most.`
  );

  const finalVerdict =
    predictedWinner === 'Too close to call'
      ? `${matchupDescription} grades as a tight matchup. The ratings do not show a decisive edge, so the winner likely comes down to user execution, turnovers, and whether the weaker depth pieces get exposed.`
      : `${matchupDescription} leans toward ${predictedWinner}. The ratings edge is not automatic, but the stronger unit has a clearer path if it keeps the matchup centered around its top players and avoids giving away possessions.`;

  return {
    prediction: predictedWinner,
    winProbability: {
      teamA: teamAProbability,
      teamB: teamBProbability,
    },
    keyMatchups,
    teamAAdvantages: teamAAdvantages.length ? teamAAdvantages : ['No clear ratings advantage found; this side needs execution to create separation.'],
    teamBAdvantages: teamBAdvantages.length ? teamBAdvantages : ['No clear ratings advantage found; this side needs execution to create separation.'],
    strategicInsights,
    finalVerdict,
  };
};

export const AIComparisonModal: React.FC<AIComparisonModalProps> = ({
  teamA,
  teamB,
  teamAPlayers,
  teamBPlayers,
  teamAType,
  teamBType,
  matchupDescription,
  teamAFormation,
  teamBFormation,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<AIComparison | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    checkCooldownAndGenerate();
  }, []);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  const getCacheKey = () =>
    `${CACHE_KEY_PREFIX}${teamA.id}_${teamB.id}_${teamAType}_${teamBType}_${teamAFormation || 'none'}_${teamBFormation || 'none'}`;

  const checkCooldownAndGenerate = () => {
    const cacheKey = getCacheKey();
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const cachedData: CachedComparison = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;

        if (age < CACHE_DURATION) {
          setComparison(cachedData.comparison);
          setLoading(false);
          return;
        }

        localStorage.removeItem(cacheKey);
      } catch (e) {
        console.error('Failed to parse cached comparison:', e);
        localStorage.removeItem(cacheKey);
      }
    }

    const lastRequest = localStorage.getItem(LAST_COMPARISON_KEY);
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - parseInt(lastRequest, 10);
      if (timeSinceLastRequest < COOLDOWN_DURATION) {
        const remaining = Math.ceil((COOLDOWN_DURATION - timeSinceLastRequest) / 1000);
        setCooldownRemaining(remaining);
        setError(`Please wait ${remaining} seconds before generating another AI-style analysis.`);
        setLoading(false);
        return;
      }
    }

    generateAIComparison();
  };

  const generateAIComparison = () => {
    setLoading(true);
    setError(null);
    setCooldownRemaining(0);

    try {
      localStorage.setItem(LAST_COMPARISON_KEY, Date.now().toString());

      const generatedComparison = buildLocalComparison({
        teamA,
        teamB,
        teamAPlayers,
        teamBPlayers,
        teamAType,
        teamBType,
        matchupDescription,
        teamAFormation,
        teamBFormation,
      });

      const cacheKey = getCacheKey();
      const cachedData: CachedComparison = {
        comparison: generatedComparison,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));

      window.setTimeout(() => {
        setComparison(generatedComparison);
        setLoading(false);
      }, 350);
    } catch (err: any) {
      console.error('AI Comparison generation error:', err);
      setError(err.message || 'Failed to generate matchup analysis. Please try again.');
      setLoading(false);
    }
  };

  const handleRetry = () => {
    checkCooldownAndGenerate();
  };

  const getWinnerColor = (prediction: string) => {
    if (prediction.includes(teamA.name) || prediction.toLowerCase().includes('team a')) {
      return 'text-blue-500';
    }
    if (prediction.includes(teamB.name) || prediction.toLowerCase().includes('team b')) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full border-2 border-indigo-500 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 sm:p-6 relative flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3">
              <Brain size={32} className="text-white" />
              <div>
                <h2 className="text-2xl font-display font-bold text-white">AI Matchup Analysis</h2>
                <p className="text-indigo-100 text-sm">{matchupDescription}</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader size={48} className="text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 text-lg">Analyzing matchup...</p>
                <p className="text-slate-500 text-sm mt-2">Using roster ratings, unit depth, and formation context</p>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                <p className="text-red-400 text-lg font-bold mb-2">AI Analysis Unavailable</p>
                <p className="text-slate-300 text-sm mb-4">{error}</p>
                {cooldownRemaining > 0 ? (
                  <div className="flex items-center justify-center gap-2 text-yellow-400">
                    <Clock size={20} />
                    <span className="font-mono text-lg">{cooldownRemaining}s</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            {comparison && !loading && !error && (
              <>
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3">
                  <p className="text-indigo-300 text-xs text-center">
                    ℹ️ Generated locally from Madden roster data. Cached for 30 minutes and works on GitHub Pages.
                  </p>
                </div>

                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy size={24} className="text-yellow-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wider">Prediction</span>
                  </div>
                  <p className={`text-3xl font-bold text-center mb-6 ${getWinnerColor(comparison.prediction)}`}>
                    {comparison.prediction}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 font-medium">{teamA.name}</span>
                        <span className="text-blue-500 font-bold">{comparison.winProbability.teamA}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${comparison.winProbability.teamA}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 font-medium">{teamB.name}</span>
                        <span className="text-red-500 font-bold">{comparison.winProbability.teamB}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="bg-red-500 h-3 rounded-full transition-all"
                          style={{ width: `${comparison.winProbability.teamB}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="text-yellow-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Key Matchups</h3>
                  </div>
                  <ul className="space-y-2">
                    {comparison.keyMatchups.map((matchup, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">⚔️</span>
                        <span className="text-slate-300 text-sm">{matchup}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-5 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-blue-500" size={20} />
                      <h3 className="text-white font-bold text-lg">{teamA.name} Advantages</h3>
                    </div>
                    <ul className="space-y-2">
                      {comparison.teamAAdvantages.map((advantage, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">+</span>
                          <span className="text-slate-300 text-sm">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-5 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-red-500" size={20} />
                      <h3 className="text-white font-bold text-lg">{teamB.name} Advantages</h3>
                    </div>
                    <ul className="space-y-2">
                      {comparison.teamBAdvantages.map((advantage, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">+</span>
                          <span className="text-slate-300 text-sm">{advantage}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="text-purple-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Strategic Insights</h3>
                  </div>
                  <ul className="space-y-2">
                    {comparison.strategicInsights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        <span className="text-slate-300 text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="text-indigo-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Final Verdict</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{comparison.finalVerdict}</p>
                </div>

                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
                  <p className="text-indigo-300 text-xs text-center">
                    <Brain size={12} className="inline mr-1" />
                    AI-style analysis for entertainment purposes. Does not affect team rankings or scores.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
