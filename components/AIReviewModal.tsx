import React, { useState, useEffect } from 'react';
import { X, Brain, TrendingUp, TrendingDown, Target, Award, Lightbulb, Loader, Clock } from 'lucide-react';
import { Team } from '../types';

/**
 * AI Review Modal Component with Caching and Rate Limiting
 *
 * SAFETY: This component is completely isolated and additive.
 * - Does NOT modify any team data
 * - Does NOT affect rankings or scores
 * - Gracefully handles loading and error states
 * - Implements caching to reduce API calls
 * - Has cooldown to prevent quota exhaustion
 */

interface AIReviewModalProps {
  team: Team;
  onClose: () => void;
}

interface AIReview {
  overallGrade: string;
  strengths: string[];
  weaknesses: string[];
  positionalNotes: string[];
  draftAnalysis: string;
  recommendations: string[];
}

interface CachedReview {
  review: AIReview;
  timestamp: number;
}

const CACHE_KEY_PREFIX = 'ai_review_cache_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_DURATION = 30 * 1000; // 30 seconds
const LAST_REQUEST_KEY = 'ai_review_last_request';

export const AIReviewModal: React.FC<AIReviewModalProps> = ({ team, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<AIReview | null>(null);
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

  const checkCooldownAndFetch = () => {
    // Check if cached review exists
    const cacheKey = `${CACHE_KEY_PREFIX}${team.id}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const cachedData: CachedReview = JSON.parse(cached);
        const age = Date.now() - cachedData.timestamp;

        if (age < CACHE_DURATION) {
          // Use cached data
          setReview(cachedData.review);
          setLoading(false);
          return;
        } else {
          // Cache expired, remove it
          localStorage.removeItem(cacheKey);
        }
      } catch (e) {
        console.error('Failed to parse cached review:', e);
        localStorage.removeItem(cacheKey);
      }
    }

    // Check cooldown
    const lastRequest = localStorage.getItem(LAST_REQUEST_KEY);
    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
      if (timeSinceLastRequest < COOLDOWN_DURATION) {
        const remaining = Math.ceil((COOLDOWN_DURATION - timeSinceLastRequest) / 1000);
        setCooldownRemaining(remaining);
        setError(`Please wait ${remaining} seconds before requesting another AI review.`);
        setLoading(false);
        return;
      }
    }

    // Proceed with fetch
    fetchAIReview();
  };

  const fetchAIReview = async () => {
    setLoading(true);
    setError(null);
    setCooldownRemaining(0);

    try {
      // Prepare team data for AI analysis (read-only)
      const teamData = {
        teamName: team.name,
        owner: team.owner,
        roster: team.roster.map(player => ({
          name: player.name,
          position: player.position,
          team: player.team,
          ovr: player.ovr,
          draftRound: player.draftRound
        }))
      };

      // Update last request timestamp
      localStorage.setItem(LAST_REQUEST_KEY, Date.now().toString());

      // Call Netlify Function
      const response = await fetch('/.netlify/functions/ai-team-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData)
      });

      const data = await response.json();

      if (!response.ok || data.fallback) {
        // Check for quota error
        if (data.error && data.error.includes('quota')) {
          throw new Error('AI quota limit reached. Please try again in a few minutes.');
        }
        throw new Error(data.error || 'AI service unavailable');
      }

      if (data.success && data.review) {
        setReview(data.review);

        // Cache the successful response
        const cacheKey = `${CACHE_KEY_PREFIX}${team.id}`;
        const cachedData: CachedReview = {
          review: data.review,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cachedData));
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (err: any) {
      console.error('AI Review fetch error:', err);
      setError(err.message || 'Failed to generate AI review. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    checkCooldownAndFetch();
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-blue-500';
    if (grade.startsWith('C')) return 'text-yellow-500';
    if (grade.startsWith('D')) return 'text-orange-500';
    return 'text-red-500';
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
          className="bg-slate-900 rounded-lg shadow-2xl max-w-3xl w-full border-2 border-purple-500 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 relative flex-shrink-0">
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
                  AI Team Review
                </h2>
                <p className="text-purple-100 text-sm">{team.name} • {team.owner}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader size={48} className="text-purple-500 animate-spin mb-4" />
                <p className="text-slate-400 text-lg">Analyzing team roster...</p>
                <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                <p className="text-red-400 text-lg font-bold mb-2">AI Review Unavailable</p>
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

            {/* Success State - Display Review */}
            {review && !loading && !error && (
              <>
                {/* Cache Notice */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-purple-300 text-xs text-center">
                    ℹ️ AI reviews are cached for 5 minutes to reduce API usage
                  </p>
                </div>

                {/* Overall Grade */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award size={20} className="text-purple-500" />
                    <span className="text-slate-400 text-sm uppercase tracking-wider">Overall Grade</span>
                  </div>
                  <span className={`text-6xl font-bold ${getGradeColor(review.overallGrade)}`}>
                    {review.overallGrade}
                  </span>
                </div>

                {/* Strengths */}
                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-green-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {review.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-slate-300 text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="text-orange-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Weaknesses</h3>
                  </div>
                  <ul className="space-y-2">
                    {review.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">⚠</span>
                        <span className="text-slate-300 text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Positional Notes */}
                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-blue-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Positional Analysis</h3>
                  </div>
                  <ul className="space-y-2">
                    {review.positionalNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-slate-300 text-sm">{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Draft Analysis */}
                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="text-purple-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Draft Analysis</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{review.draftAnalysis}</p>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="text-yellow-500" size={20} />
                    <h3 className="text-white font-bold text-lg">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {review.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">💡</span>
                        <span className="text-slate-300 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Disclaimer */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-purple-300 text-xs text-center">
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
