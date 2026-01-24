import React, { useState, useEffect } from 'react';
import { X, Brain, TrendingUp, Zap, Shield, AlertCircle, Loader, Trophy, Clock } from 'lucide-react';
import { Team } from '../types';

/**
 * AI Comparison Modal Component with Caching and Rate Limiting
 *
 * SAFETY: This component is completely isolated and additive.
 * - Does NOT modify any team data
 * - Does NOT affect rankings or scores
 * - Gracefully handles loading and error states
 * - Implements caching to reduce API calls
 * - Has cooldown to prevent quota exhaustion
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
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes (increased from 5)
const COOLDOWN_DURATION = 60 * 1000; // 60 seconds (increased from 30)
const LAST_COMPARISON_KEY = 'ai_comparison_last_request';

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
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<AIComparison | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    checkCooldownAndFetch();
  }, []);

  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  const getCacheKey = () => {
    // Create unique cache key based on matchup details
    return `${CACHE_KEY_PREFIX}${teamA.id}_${teamB.id}_${teamAType}_${teamBType}_${teamAFormation || 'none'}_${teamBFormation || 'none'}`;
  };

  const checkCooldownAndFetch = () => {
    // Check if cached comparison exists
    const cacheKey = getCacheKey();
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const cachedData: CachedComparison = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;

        if (age < CACHE_DURATION) {
          // Use cached data
          setComparison(cachedData.comparison);
          setLoading(false);
          return;
        } else {
          // Cache expired, remove it
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        console.error('Failed to parse cached comparison:', e);
        localStorage.removeItem(cacheKey);
      }
    }

    // Check cooldown
    const lastRequest = localStorage.getItem(LAST_COMPARISON_KEY);
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
      if (timeSinceLastRequest < COOLDOWN_DURATION) {
        const remaining = Math.ceil((COOLDOWN_DURATION - timeSinceLastRequest) / 1000);
        setCooldownRemaining(remaining);
        setError(`Please wait ${remaining} seconds before requesting another AI analysis.`);
        setLoading(false);
        return;
      }
    }

    // Proceed with fetch
    fetchAIComparison();
  };

  const fetchAIComparison = async () => {
    setLoading(true);
    setError(null);
    setCooldownRemaining(0);

    try {
      // Prepare comparison data for AI analysis (read-only)
      const comparisonData = {
        teamA: {
          name: teamA.name,
          owner: teamA.owner,
          players: teamAPlayers,
          type: teamAType,
          formation: teamAFormation
        },
        teamB: {
          name: teamB.name,
          owner: teamB.owner,
          players: teamBPlayers,
          type: teamBType,
          formation: teamBFormation
        },
        matchupType: matchupDescription
      };

      // Update last request timestamp
      localStorage.setItem(LAST_COMPARISON_KEY, Date.now().toString());

      // Call Netlify Function
      const response = await fetch('/.netlify/functions/ai-team-comparison', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comparisonData)
      });

      const data = await response.json();

      if (!response.ok || data.fallback) {
        // Check for quota error
        if (data.error && data.error.includes('quota')) {
          throw new Error('AI quota limit reached. Please try again in a few minutes.');
        }
        throw new Error(data.error || 'AI service unavailable');
      }

      if (data.success && data.comparison) {
        setComparison(data.comparison);

        // Cache the successful response
        const cacheKey = getCacheKey();
        const cachedData: CachedComparison = {
          comparison: data.comparison,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (err: any) {
      console.error('AI Comparison fetch error:', err);
      setError(err.message || 'Failed to generate AI comparison. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    checkCooldownAndFetch();
  };

  const getWinnerColor = (prediction: string) => {
    if (prediction.includes(teamA.name) || prediction.toLowerCase().includes('team a')) {
      return 'text-blue-500';
    } else if (prediction.includes(teamB.name) || prediction.toLowerCase().includes('team b')) {
      return 'text-red-500';
    }
    return 'text-yellow-500';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-slate-900 rounded-lg shadow-2xl max-w-4xl w-full border-2 border-indigo-500 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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
                <h2 className="text-2xl font-display font-bold text-white">
                  AI Matchup Analysis
                </h2>
                <p className="text-indigo-100 text-sm">{matchupDescription}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader size={48} className="text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400 text-lg">Analyzing matchup...</p>
                <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
              </div>
            )}

            {/* Error State */}
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

            {/* Success State - Display Comparison */}
            {comparison && !loading && !error && (
              <>
                {/* Cache Notice */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3">
                  <p className="text-indigo-300 text-xs text-center">
                    ℹ️ AI analyses are cached for 30 minutes to conserve API quota
                  </p>
                </div>

                {/* Prediction & Win Probability */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Trophy size={24} className="text-yellow-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wider">Prediction</span>
                  </div>
                  <p className={`text-3xl font-bold text-center mb-6 ${getWinnerColor(comparison.prediction)}`}>
                    {comparison.prediction}
                  </p>

                  {/* Win Probability Bars */}
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

                {/* Key Matchups */}
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

                {/* Advantages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team A Advantages */}
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

                  {/* Team B Advantages */}
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

                {/* Strategic Insights */}
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

                {/* Final Verdict */}
                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="text-indigo-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Final Verdict</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{comparison.finalVerdict}</p>
                </div>

                {/* Disclaimer */}
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4">
                  <p className="text-indigo-300 text-xs text-center">
                    <Brain size={12} className="inline mr-1" />
                    AI-generated analysis for entertainment purposes. Does not affect team rankings or scores.
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
