import React from 'react';
import { X, Star, Shield, TrendingUp, Zap, Target } from 'lucide-react';
import { TeamScore } from '../utils/leagueScoring';

interface LeagueScoreModalProps {
  teamName: string;
  teamScore: TeamScore;
  onClose: () => void;
}

export const LeagueScoreModal: React.FC<LeagueScoreModalProps> = ({
  teamName,
  teamScore,
  onClose,
}) => {
  const maxScore = 100; // For visual scaling

  const getBarWidth = (points: number) => {
    return `${Math.min((points / maxScore) * 100, 100)}%`;
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
          className="bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full border-2 border-brand-500 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-slate-200 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-3">
              <Target size={32} className="text-white" />
              <div>
                <h2 className="text-2xl font-display font-bold text-white">
                  League Score Breakdown
                </h2>
                <p className="text-brand-100 text-sm">{teamName}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Total Score */}
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-lg">Total League Score</span>
                <span className="text-4xl font-bold text-brand-500">
                  {teamScore.totalScore.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Score Components */}
            <div className="space-y-5">
              {/* Positional Leaders */}
              <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <div className="flex items-start gap-3 mb-4">
                  <Star className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">Positional Leaders</h3>
                      <span className="text-brand-500 font-bold text-xl">
                        {teamScore.breakdown.positionalLeaders.toFixed(1)} pts
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      Points earned by ranking highest OVR player at each position
                    </p>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full transition-all duration-500"
                        style={{ width: getBarWidth(teamScore.breakdown.positionalLeaders) }}
                      />
                    </div>
                  </div>
                </div>

                {/* Position Details */}
                {teamScore.positionScores.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-xs font-semibold mb-2">Position Rankings:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {teamScore.positionScores.slice(0, 12).map((ps) => (
                        <div
                          key={ps.position}
                          className="flex items-center justify-between bg-slate-900 rounded px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-medium text-sm">
                              {ps.position}
                            </span>
                            {ps.position === 'QB' && <Zap size={12} className="text-brand-400" />}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 text-xs">#{ps.rank}</span>
                            <span className="text-brand-400 font-bold text-sm">
                              {ps.points}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Depth Bonus */}
              <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <div className="flex items-start gap-3">
                  <Shield className="text-blue-500 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">Depth Bonus</h3>
                      <span className="text-brand-500 font-bold text-xl">
                        {teamScore.breakdown.depthBonus.toFixed(1)} pts
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      +1 point for best bench player at each position
                    </p>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: getBarWidth(teamScore.breakdown.depthBonus) }}
                      />
                    </div>

                    {/* Depth Details */}
                    {teamScore.depthScores.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-slate-400 text-xs font-semibold mb-2">
                          Depth Wins ({teamScore.depthScores.length} positions):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {teamScore.depthScores.map((ds) => (
                            <span
                              key={ds.position}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                            >
                              {ds.position} ({ds.depthOvr} OVR)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Extra Starters */}
              <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-green-500 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">Extra Starters</h3>
                      <span className="text-brand-500 font-bold text-xl">
                        {teamScore.breakdown.extraStarters.toFixed(1)} pts
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">
                      +0.5 points per starter beyond typical lineup
                    </p>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                        style={{ width: getBarWidth(teamScore.breakdown.extraStarters) }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Legend */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h4 className="text-white font-semibold text-sm mb-3">Scoring System</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <p>• <span className="text-slate-300">Positional Leaders:</span> 1st: 5pts • 2nd: 3pts • 3rd: 2pts • Rest: 1pt</p>
                <p>• <span className="text-slate-300">QB Bonus:</span> QB gets +2 additional points (7/5/3/1)</p>
                <p>• <span className="text-slate-300">Depth Bonus:</span> Best non-starter at position: +1pt</p>
                <p>• <span className="text-slate-300">Extra Starters:</span> Starters beyond typical lineup: +0.5pts each</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
