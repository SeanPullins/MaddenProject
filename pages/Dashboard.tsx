import React, { useMemo, useState } from 'react';
import { Page } from '../types';
import { ALL_TEAMS } from '../constants';
import { TrendingUp, Users, Trophy, Search, GitCompare, Award, ArrowRight, Target, Info, Star, Shield, ChevronRight } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { calculateLeagueScores } from '../utils/leagueScoring';
import { LeagueScoreModal } from '../components/LeagueScoreModal';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [modalTeamId, setModalTeamId] = useState<string | null>(null);

  // Calculate league scores
  const leagueScores = useMemo(() => {
    try {
      return calculateLeagueScores(ALL_TEAMS);
    } catch (error) {
      console.error('Failed to calculate league scores:', error);
      return [];
    }
  }, []);

  const getTeamScore = (teamId: string) => {
    const score = leagueScores.find(ts => ts.teamId === teamId);
    return score?.totalScore.toFixed(1) || '0.0';
  };

  const getTeamSummary = (teamId: string) => {
    const teamScore = leagueScores.find(ts => ts.teamId === teamId);
    if (!teamScore) return null;

    // Find top positional strength (best rank)
    const topPosition = teamScore.positionScores
      .filter(ps => ps.rank > 0)
      .sort((a, b) => a.rank - b.rank)[0];

    // Find weakest position (worst rank)
    const weakestPosition = teamScore.positionScores
      .filter(ps => ps.rank > 0)
      .sort((a, b) => b.rank - a.rank)[0];

    return {
      topPosition: topPosition ? `${topPosition.position} (#${topPosition.rank})` : 'N/A',
      weakestPosition: weakestPosition ? `${weakestPosition.position} (#${weakestPosition.rank})` : 'N/A',
      depthBonus: teamScore.breakdown.depthBonus.toFixed(1),
    };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
        DASHBOARD
      </h1>

      {/* Intro */}
      <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-3xl">
        Welcome to <span className="text-brand-500 font-bold">FanLeague — Where the Best GM Meets Madden</span>.
        A premium fantasy football platform powered by <span className="text-brand-500 font-semibold">Madden NFL ratings and attributes</span>.
        Manage your franchise, track player performance, analyze draft success, and compete in a league
        where player value is driven by real Madden game data.
      </p>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg p-4 sm:p-6 border border-slate-700 mb-8">
        <h2 className="text-xl font-display font-bold text-white mb-4">QUICK ACTIONS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate(Page.PLAYERS)}
            className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Search className="text-brand-500" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">Browse Players</p>
                <p className="text-slate-400 text-sm">Search & filter all players</p>
              </div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-brand-500 transition-colors" size={20} />
          </button>

          <button
            onClick={() => onNavigate(Page.COMPARISON)}
            className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <GitCompare className="text-brand-500" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">Compare Players</p>
                <p className="text-slate-400 text-sm">Side-by-side analysis</p>
              </div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-brand-500 transition-colors" size={20} />
          </button>

          <button
            onClick={() => onNavigate(Page.STANDINGS)}
            className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Award className="text-brand-500" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">View Standings</p>
                <p className="text-slate-400 text-sm">Check league rankings</p>
              </div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-brand-500 transition-colors" size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 rounded-lg">
              <Users className="text-brand-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Teams</p>
              <p className="text-2xl font-bold text-white">{ALL_TEAMS.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 rounded-lg">
              <TrendingUp className="text-brand-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Players</p>
              <p className="text-2xl font-bold text-white">
                {ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 rounded-lg">
              <Trophy className="text-brand-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Season</p>
              <p className="text-2xl font-bold text-white">2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Overview */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-display font-bold text-white mb-6">LEAGUE TEAMS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_TEAMS.map((team) => {
            const teamScore = leagueScores.find(ts => ts.teamId === team.id);
            const summary = getTeamSummary(team.id);
            const isHovered = hoveredTeamId === team.id;

            return (
              <div
                key={team.id}
                className="bg-slate-900 rounded-lg border border-slate-700 hover:border-brand-500 transition-colors overflow-hidden"
              >
                {/* Team Header - Clickable to Teams page */}
                <div
                  className="p-4 pb-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => onNavigate(Page.TEAMS)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <TeamLogo
                      src={team.avatarUrl}
                      alt={team.name}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{team.name}</h3>
                      <p className="text-sm text-slate-400">{team.owner}</p>
                    </div>
                  </div>

                  {/* League Score - Primary Element */}
                  <div
                    className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-brand-500 transition-colors relative"
                    onMouseEnter={() => setHoveredTeamId(team.id)}
                    onMouseLeave={() => setHoveredTeamId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalTeamId(team.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={16} className="text-brand-500" />
                        <span className="text-slate-400 text-sm font-medium">League Score</span>
                        <Info size={12} className="text-slate-500" />
                      </div>
                      <span className="text-brand-500 font-bold text-2xl">{getTeamScore(team.id)}</span>
                    </div>

                    {/* Hover Tooltip */}
                    {isHovered && teamScore && (
                      <div className="absolute left-0 top-full mt-2 z-50 w-80 pointer-events-none">
                        <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-700 p-3">
                          <p className="text-white font-bold text-xs mb-2">Score Breakdown:</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Positional Leaders</span>
                              <span className="text-brand-500 font-bold">{teamScore.breakdown.positionalLeaders.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Depth Bonus</span>
                              <span className="text-brand-500 font-bold">{teamScore.breakdown.depthBonus.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Extra Starters</span>
                              <span className="text-brand-500 font-bold">{teamScore.breakdown.extraStarters.toFixed(1)}</span>
                            </div>
                            <div className="border-t border-slate-700 pt-1 mt-1">
                              <p className="text-slate-400 text-xs">Click for full breakdown →</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Summary - Compact Section */}
                {summary && (
                  <div className="px-4 pb-4">
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Star size={12} className="text-yellow-500" />
                          <span>Top Strength:</span>
                        </div>
                        <span className="text-white font-medium">{summary.topPosition}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <TrendingUp size={12} className="text-red-400" />
                          <span>Weakest:</span>
                        </div>
                        <span className="text-slate-300 font-medium">{summary.weakestPosition}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Shield size={12} className="text-blue-500" />
                          <span>Depth:</span>
                        </div>
                        <span className="text-brand-500 font-medium">{summary.depthBonus} pts</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* League Score Modal */}
      {modalTeamId && (() => {
        const team = ALL_TEAMS.find(t => t.id === modalTeamId);
        const teamScore = leagueScores.find(ts => ts.teamId === modalTeamId);
        if (team && teamScore) {
          return (
            <LeagueScoreModal
              teamName={team.name}
              teamScore={teamScore}
              onClose={() => setModalTeamId(null)}
            />
          );
        }
        return null;
      })()}
    </div>
  );
};
