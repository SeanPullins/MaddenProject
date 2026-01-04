import React, { useMemo, useState } from 'react';
import { ALL_TEAMS } from '../constants';
import { Trophy, Medal, TrendingUp, TrendingDown, Award, Users, ArrowUpDown, ArrowDown, ArrowUp, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';
import { calculateLeagueScores } from '../utils/leagueScoring';

type SortMode = 'RECORD' | 'LEAGUE_SCORE';

export const Standings: React.FC = () => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('RECORD');
  const [sortDirection, setSortDirection] = useState<'DESC' | 'ASC'>('DESC');

  // Calculate league scores (safely)
  const leagueScores = useMemo(() => {
    try {
      return calculateLeagueScores(ALL_TEAMS);
    } catch (error) {
      console.error('Failed to calculate league scores:', error);
      return [];
    }
  }, []);

  // Sort teams based on current mode
  const sortedTeams = useMemo(() => {
    const teams = [...ALL_TEAMS];

    if (sortMode === 'RECORD') {
      // Sort by win-loss record
      teams.sort((a, b) => {
        const aWins = parseInt(a.record.split('-')[0] || '0');
        const bWins = parseInt(b.record.split('-')[0] || '0');

        if (sortDirection === 'DESC') {
          return bWins - aWins;
        } else {
          return aWins - bWins;
        }
      });
    } else {
      // Sort by league score
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
    }

    return teams;
  }, [sortMode, sortDirection, leagueScores]);

  const totalTeams = sortedTeams.length;
  const playoffCutoff = Math.ceil(totalTeams / 2); // Top half make playoffs

  const toggleSortMode = (mode: SortMode) => {
    if (sortMode === mode) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC');
    } else {
      // Switch to new column, default to DESC
      setSortMode(mode);
      setSortDirection('DESC');
    }
  };

  const getSortIcon = (mode: SortMode) => {
    if (sortMode !== mode) {
      return <ArrowUpDown size={14} className="text-slate-500" />;
    }
    return sortDirection === 'DESC'
      ? <ArrowDown size={14} className="text-brand-500" />
      : <ArrowUp size={14} className="text-brand-500" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">STANDINGS</h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-6 max-w-3xl">
        League rankings by win-loss record and computed League Score. The{' '}
        <span className="text-yellow-500 font-semibold">top {playoffCutoff} teams</span>{' '}
        by record qualify for playoffs. League Score is a calculated metric based on positional ratings,
        depth quality, and roster configuration.
      </p>

      {/* Sort Mode Selector */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm font-medium">Sort by:</span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleSortMode('RECORD')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                sortMode === 'RECORD'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Trophy size={16} />
              Record
              {sortMode === 'RECORD' && getSortIcon('RECORD')}
            </button>
            <button
              onClick={() => toggleSortMode('LEAGUE_SCORE')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                sortMode === 'LEAGUE_SCORE'
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Target size={16} />
              League Score
              {sortMode === 'LEAGUE_SCORE' && getSortIcon('LEAGUE_SCORE')}
            </button>
          </div>
        </div>
      </div>

      {/* League Score Explanation (only show when sorting by league score) */}
      {sortMode === 'LEAGUE_SCORE' && (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Target size={18} className="text-brand-500" />
            League Score Calculation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-900 rounded p-3">
              <p className="text-brand-500 font-bold mb-1">Positional Leaders</p>
              <p className="text-slate-400 text-xs">
                1st: 5pts (QB: 7pts) • 2nd: 3pts (QB: 5pts) • 3rd: 2pts (QB: 3pts) • Rest: 1pt
              </p>
            </div>
            <div className="bg-slate-900 rounded p-3">
              <p className="text-brand-500 font-bold mb-1">Depth Bonus</p>
              <p className="text-slate-400 text-xs">
                1pt per position for best bench player
              </p>
            </div>
            <div className="bg-slate-900 rounded p-3">
              <p className="text-brand-500 font-bold mb-1">Extra Starters</p>
              <p className="text-slate-400 text-xs">
                0.5pts per extra starter beyond typical lineup
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Standings Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900 border-b-2 border-slate-700">
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Rank</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Team</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Owner</th>
              <th
                className="text-left py-4 px-6 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSortMode('RECORD')}
              >
                <div className="flex items-center gap-2">
                  Record
                  {getSortIcon('RECORD')}
                </div>
              </th>
              <th
                className="text-left py-4 px-6 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => toggleSortMode('LEAGUE_SCORE')}
              >
                <div className="flex items-center gap-2">
                  League Score
                  {getSortIcon('LEAGUE_SCORE')}
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

              // Determine status based on RECORD (not league score)
              const wins = parseInt(team.record.split('-')[0] || '0');
              const recordRank = [...ALL_TEAMS]
                .sort((a, b) => {
                  const aWins = parseInt(a.record.split('-')[0] || '0');
                  const bWins = parseInt(b.record.split('-')[0] || '0');
                  return bWins - aWins;
                })
                .findIndex(t => t.id === team.id) + 1;

              const isChampion = recordRank === 1 && sortMode === 'RECORD';
              const isPlayoffTeam = recordRank <= playoffCutoff;
              const isLastPlace = recordRank === totalTeams && sortMode === 'RECORD';
              const isExpanded = expandedTeamId === team.id;

              // Determine background color based on current sort mode
              let bgClass = '';
              if (sortMode === 'RECORD') {
                if (isChampion) bgClass = 'bg-yellow-500/10 border-l-4 border-yellow-500';
                else if (recordRank === 2) bgClass = 'bg-slate-700/30 border-l-4 border-slate-400';
                else if (recordRank === 3) bgClass = 'bg-orange-400/10 border-l-4 border-orange-400';
                else if (isLastPlace) bgClass = 'bg-red-500/10 border-l-4 border-red-500';
                else if (isPlayoffTeam) bgClass = 'border-l-4 border-brand-500/30';
              } else {
                // League score mode - highlight top 3
                if (rank === 1) bgClass = 'bg-yellow-500/10 border-l-4 border-yellow-500';
                else if (rank === 2) bgClass = 'bg-slate-700/30 border-l-4 border-slate-400';
                else if (rank === 3) bgClass = 'bg-orange-400/10 border-l-4 border-orange-400';
              }

              return (
                <React.Fragment key={team.id}>
                  <tr className={`border-b border-slate-800 hover:bg-slate-700/50 transition-colors ${bgClass}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {rank === 1 && <Trophy className="text-yellow-500" size={18} />}
                        {rank === 2 && <Medal className="text-slate-400" size={18} />}
                        {rank === 3 && <Medal className="text-orange-400" size={18} />}
                        <span
                          className={`text-lg font-bold ${
                            rank === 1 ? 'text-yellow-500'
                            : rank === 2 ? 'text-slate-300'
                            : rank === 3 ? 'text-orange-400'
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
                      <span className={`font-bold text-lg ${
                        sortMode === 'RECORD' && rank === 1 ? 'text-yellow-500' : 'text-white'
                      }`}>
                        {team.record}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-xl ${
                          sortMode === 'LEAGUE_SCORE' && rank === 1 ? 'text-yellow-500' : 'text-brand-500'
                        }`}>
                          {teamScore?.totalScore.toFixed(1) || '0.0'}
                        </span>
                        {teamScore && (
                          <button
                            onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                            className="text-slate-400 hover:text-white transition-colors"
                            title="View breakdown"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                        avgOvr >= 85 ? 'bg-yellow-500 text-black'
                        : avgOvr >= 80 ? 'bg-brand-500 text-white'
                        : avgOvr >= 75 ? 'bg-blue-500 text-white'
                        : 'bg-slate-600 text-white'
                      }`}>
                        {avgOvr}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {sortMode === 'RECORD' && (
                        <>
                          {isChampion && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/30">
                              1ST PLACE
                            </span>
                          )}
                          {!isChampion && isPlayoffTeam && (
                            <span className="px-3 py-1 bg-brand-500/20 text-brand-500 rounded-full text-xs font-bold border border-brand-500/30">
                              PLAYOFF
                            </span>
                          )}
                          {!isPlayoffTeam && !isLastPlace && (
                            <span className="px-3 py-1 bg-slate-700 text-slate-400 rounded-full text-xs font-medium">
                              ELIMINATION
                            </span>
                          )}
                          {isLastPlace && (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold border border-red-500/30">
                              LAST PLACE
                            </span>
                          )}
                        </>
                      )}
                      {sortMode === 'LEAGUE_SCORE' && rank === 1 && (
                        <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold border border-yellow-500/30">
                          TOP SCORE
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Expandable Breakdown Row */}
                  {isExpanded && teamScore && (
                    <tr className={`${bgClass} border-b border-slate-700`}>
                      <td colSpan={7} className="py-4 px-6">
                        <div className="bg-slate-900 rounded-lg p-4 space-y-3">
                          <h4 className="text-white font-bold text-sm mb-3">LEAGUE SCORE BREAKDOWN</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Positional Leaders</p>
                              <p className="text-brand-500 font-bold text-lg">{teamScore.breakdown.positionalLeaders.toFixed(1)} pts</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Depth Bonus</p>
                              <p className="text-brand-500 font-bold text-lg">{teamScore.breakdown.depthBonus.toFixed(1)} pts</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-xs mb-1">Extra Starters</p>
                              <p className="text-brand-500 font-bold text-lg">{teamScore.breakdown.extraStarters.toFixed(1)} pts</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-slate-700">
                            <p className="text-slate-400 text-xs">
                              Top Positions: {teamScore.positionScores.filter(ps => ps.rank <= 3).map(ps => `${ps.position} (#${ps.rank})`).join(', ') || 'None'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
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
              <Award className="text-brand-500" size={20} />
              <p className="text-slate-400 text-sm font-medium">Playoff Teams</p>
            </div>
            <p className="text-3xl font-bold text-white">{playoffCutoff}</p>
            <p className="text-slate-500 text-xs mt-1">Top {Math.round((playoffCutoff / totalTeams) * 100)}%</p>
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
              <Trophy className="text-yellow-500" size={20} />
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
    </div>
  );
};
