import React, { useMemo, useState } from 'react';
import { ALL_TEAMS } from '../constants';
import { Trophy, Medal, Award, Users, ArrowDown, ArrowUp, Target, Star, Zap, Shield, TrendingUp, Info } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { calculateLeagueScores } from '../utils/leagueScoring';
import { LeagueScoreModal } from '../components/LeagueScoreModal';

export const Standings: React.FC = () => {
  const [sortDirection, setSortDirection] = useState<'DESC' | 'ASC'>('DESC');
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [modalTeamId, setModalTeamId] = useState<string | null>(null);

  // Calculate league scores (safely)
  const leagueScores = useMemo(() => {
    try {
      return calculateLeagueScores(ALL_TEAMS);
    } catch (error) {
      console.error('Failed to calculate league scores:', error);
      return [];
    }
  }, []);

  // Sort teams by League Score
  const sortedTeams = useMemo(() => {
    const teams = [...ALL_TEAMS];

    teams.sort((a, b) => {
      const aScore = leagueScores.find((ls) => ls.teamId === a.id);
      const bScore = leagueScores.find((ls) => ls.teamId === b.id);

      const aTotal = aScore?.totalScore || 0;
      const bTotal = bScore?.totalScore || 0;

      if (sortDirection === 'DESC') {
        return bTotal - aTotal;
      } else {
        return aTotal - bTotal;
      }
    });

    return teams;
  }, [sortDirection, leagueScores]);

  const totalTeams = sortedTeams.length;

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">LEAGUE STANDINGS</h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-6 max-w-3xl">
        Teams ranked by{' '}
        <span className="text-brand-500 font-semibold">League Score</span>, a comprehensive metric that evaluates positional strength, depth quality, and roster configuration.
        Hover over any score to see how it's calculated.
      </p>

      {/* League Score Explanation Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-lg p-5 border border-slate-700 mb-6">
        <div className="flex items-start gap-3">
          <Info className="text-brand-500 mt-1" size={20} />
          <div className="flex-1">
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">
              League Score Components
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Star className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-white font-semibold mb-1">Positional Leaders</p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Ranked by highest OVR at each position<br />
                    1st: 5pts • 2nd: 3pts • 3rd: 2pts • Rest: 1pt
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="text-brand-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-white font-semibold mb-1">QB Bonus</p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    QB gets +2 bonus points<br />
                    QB: 7pts / 5pts / 3pts / 1pt
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="text-white font-semibold mb-1">Depth & Extras</p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Best bench player: +1pt per position<br />
                    Extra starters: +0.5pts each
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full min-w-max">
          <thead>
            <tr className="bg-slate-900 border-b-2 border-slate-700">
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Rank</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Team</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Owner</th>
              <th
                className="text-left py-4 px-6 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={toggleSortDirection}
              >
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-brand-500" />
                  League Score
                  {sortDirection === 'DESC' ? (
                    <ArrowDown size={14} className="text-brand-500" />
                  ) : (
                    <ArrowUp size={14} className="text-brand-500" />
                  )}
                </div>
              </th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Avg OVR</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const rank = index + 1;
              const teamScore = leagueScores.find((ls) => ls.teamId === team.id);
              const avgOvr = Math.round(
                team.roster.reduce((sum, p) => sum + p.ovr, 0) / team.roster.length
              );

              const isHovered = hoveredTeamId === team.id;

              // Highlight top 3 teams
              let bgClass = '';
              if (rank === 1) bgClass = 'bg-yellow-500/10 border-l-4 border-yellow-500';
              else if (rank === 2) bgClass = 'bg-slate-700/30 border-l-4 border-slate-400';
              else if (rank === 3) bgClass = 'bg-orange-400/10 border-l-4 border-orange-400';

              return (
                <tr
                  key={team.id}
                  className={`border-b border-slate-800 hover:bg-slate-700/50 transition-colors ${bgClass}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {rank === 1 && <Trophy className="text-yellow-500" size={18} />}
                      {rank === 2 && <Medal className="text-slate-400" size={18} />}
                      {rank === 3 && <Medal className="text-orange-400" size={18} />}
                      <span
                        className={`text-lg font-bold ${
                          rank === 1
                            ? 'text-yellow-500'
                            : rank === 2
                            ? 'text-slate-300'
                            : rank === 3
                            ? 'text-orange-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {rank}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <TeamLogo
                        src={team.avatarUrl}
                        alt={team.name}
                        size="md"
                        className={rank === 1 ? 'ring-2 ring-yellow-500' : ''}
                      />
                      <span className={`font-bold ${rank <= 3 ? 'text-white text-base' : 'text-slate-200'}`}>
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{team.owner}</td>
                  <td className="py-4 px-6">
                    <button
                      className="flex items-center gap-2 hover:bg-slate-700/30 rounded px-2 py-1 -mx-2 -my-1 transition-colors cursor-pointer group"
                      onMouseEnter={() => setHoveredTeamId(team.id)}
                      onMouseLeave={() => setHoveredTeamId(null)}
                      onClick={() => setModalTeamId(team.id)}
                      title="Click for detailed breakdown"
                    >
                      <span
                        className={`font-bold text-2xl ${
                          rank === 1 ? 'text-yellow-500' : 'text-brand-500'
                        }`}
                      >
                        {teamScore?.totalScore.toFixed(1) || '0.0'}
                      </span>
                      <Info size={14} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                    </button>

                    {/* Hover Tooltip - Hidden on mobile, click opens modal instead */}
                    {isHovered && teamScore && (
                      <div className="hidden md:block fixed z-[100] pointer-events-none" style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}>
                        <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-700 p-4 w-80">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                            <Target size={16} className="text-brand-500" />
                            <h4 className="text-white font-bold text-sm">
                              {team.name} Score Breakdown
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {/* Positional Leaders */}
                            <div className="flex items-start gap-2">
                              <Star className="text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-slate-300 text-xs font-semibold">
                                    Positional Leaders
                                  </span>
                                  <span className="text-brand-500 font-bold text-sm">
                                    {teamScore.breakdown.positionalLeaders.toFixed(1)} pts
                                  </span>
                                </div>
                                {/* Visual Bar */}
                                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                                  <div
                                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full"
                                    style={{ width: `${Math.min((teamScore.breakdown.positionalLeaders / 60) * 100, 100)}%` }}
                                  />
                                </div>
                                <p className="text-slate-500 text-xs">
                                  Ranked by highest OVR at each position
                                </p>
                              </div>
                            </div>

                            {/* Depth Bonus */}
                            <div className="flex items-start gap-2">
                              <Shield className="text-blue-500 flex-shrink-0 mt-0.5" size={14} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-slate-300 text-xs font-semibold">
                                    Depth Bonus
                                  </span>
                                  <span className="text-brand-500 font-bold text-sm">
                                    {teamScore.breakdown.depthBonus.toFixed(1)} pts
                                  </span>
                                </div>
                                {/* Visual Bar */}
                                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                                  <div
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                                    style={{ width: `${Math.min((teamScore.breakdown.depthBonus / 10) * 100, 100)}%` }}
                                  />
                                </div>
                                <p className="text-slate-500 text-xs">
                                  Best bench player at each position
                                </p>
                              </div>
                            </div>

                            {/* Extra Starters */}
                            <div className="flex items-start gap-2">
                              <TrendingUp className="text-green-500 flex-shrink-0 mt-0.5" size={14} />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-slate-300 text-xs font-semibold">
                                    Extra Starters
                                  </span>
                                  <span className="text-brand-500 font-bold text-sm">
                                    {teamScore.breakdown.extraStarters.toFixed(1)} pts
                                  </span>
                                </div>
                                {/* Visual Bar */}
                                <div className="w-full bg-slate-700 rounded-full h-1.5 mb-1">
                                  <div
                                    className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full"
                                    style={{ width: `${Math.min((teamScore.breakdown.extraStarters / 10) * 100, 100)}%` }}
                                  />
                                </div>
                                <p className="text-slate-500 text-xs">
                                  +0.5pts per extra starter beyond typical lineup
                                </p>
                              </div>
                            </div>

                            {/* Total */}
                            <div className="pt-2 border-t border-slate-700">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm font-bold">Total Score</span>
                                <span className="text-brand-500 text-lg font-bold">
                                  {teamScore.totalScore.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            {/* Top Positions */}
                            {teamScore.positionScores.filter((ps) => ps.rank <= 3).length > 0 && (
                              <div className="pt-2 border-t border-slate-700">
                                <p className="text-slate-400 text-xs mb-1">Top 3 Positions:</p>
                                <div className="flex flex-wrap gap-1">
                                  {teamScore.positionScores
                                    .filter((ps) => ps.rank <= 3)
                                    .map((ps) => (
                                      <span
                                        key={ps.position}
                                        className="px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded text-xs font-medium"
                                      >
                                        {ps.position} (#{ps.rank})
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                        avgOvr >= 85
                          ? 'bg-yellow-500 text-black'
                          : avgOvr >= 80
                          ? 'bg-brand-500 text-white'
                          : avgOvr >= 75
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {avgOvr}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {rank === 1 && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/30">
                        LEAGUE LEADER
                      </span>
                    )}
                    {rank === 2 && (
                      <span className="px-3 py-1 bg-slate-500/20 text-slate-300 rounded-full text-xs font-bold border border-slate-500/30">
                        2ND PLACE
                      </span>
                    )}
                    {rank === 3 && (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold border border-orange-500/30">
                        3RD PLACE
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* League Statistics */}
      <div className="mt-8">
        <h2 className="text-2xl font-display font-bold text-white mb-4">LEAGUE STATISTICS</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-brand-500" size={20} />
              <p className="text-slate-400 text-sm font-medium">Total Players</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="text-yellow-500" size={20} />
              <p className="text-slate-400 text-sm font-medium">League Leader</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {sortedTeams[0]?.name || '-'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              {leagueScores[0]?.totalScore.toFixed(1) || '0.0'} pts
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-brand-500" size={20} />
              <p className="text-slate-400 text-sm font-medium">Avg Roster Size</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(
                ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0) / ALL_TEAMS.length
              )}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Award className="text-brand-500" size={20} />
              <p className="text-slate-400 text-sm font-medium">League Avg OVR</p>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.round(
                ALL_TEAMS.reduce(
                  (sum, team) =>
                    sum + team.roster.reduce((s, p) => s + p.ovr, 0) / team.roster.length,
                  0
                ) / ALL_TEAMS.length
              )}
            </p>
          </div>
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
