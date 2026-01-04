import React from 'react';
import { ALL_TEAMS } from '../constants';
import { Trophy, Medal, TrendingUp, TrendingDown, Award, Users } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';

export const Standings: React.FC = () => {
  // Sort teams by record (simplified - assumes W-L format like "10-4")
  const sortedTeams = [...ALL_TEAMS].sort((a, b) => {
    const aWins = parseInt(a.record.split('-')[0] || '0');
    const bWins = parseInt(b.record.split('-')[0] || '0');
    return bWins - aWins;
  });

  const totalTeams = sortedTeams.length;
  const playoffCutoff = Math.ceil(totalTeams / 2); // Top half make playoffs

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">STANDINGS</h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-6 max-w-3xl">
        League rankings based on win-loss records. The{' '}
        <span className="text-yellow-500 font-semibold">top {playoffCutoff} teams</span>{' '}
        qualify for playoff contention, while team roster quality (Avg OVR) can indicate future performance potential.
        Track your position and identify championship contenders.
      </p>

      {/* Legend */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={16} />
            <span className="text-slate-300">Champion Position</span>
          </div>
          <div className="flex items-center gap-2">
            <Medal className="text-slate-400" size={16} />
            <span className="text-slate-300">Playoff Contender</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-brand-500" size={16} />
            <span className="text-slate-300">Strong Roster (80+ Avg OVR)</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown className="text-red-400" size={16} />
            <span className="text-slate-300">Needs Improvement</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900 border-b-2 border-slate-700">
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Rank</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Team</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Owner</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Record</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Roster Size</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Avg OVR</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const rank = index + 1;
              const avgOvr = Math.round(
                team.roster.reduce((sum, p) => sum + p.ovr, 0) / team.roster.length
              );
              const isChampion = rank === 1;
              const isPlayoffTeam = rank <= playoffCutoff;
              const isLastPlace = rank === totalTeams;
              const isStrongRoster = avgOvr >= 80;

              // Determine background color
              let bgClass = '';
              if (isChampion) bgClass = 'bg-yellow-500/10 border-l-4 border-yellow-500';
              else if (rank === 2) bgClass = 'bg-slate-700/30 border-l-4 border-slate-400';
              else if (rank === 3) bgClass = 'bg-orange-400/10 border-l-4 border-orange-400';
              else if (isLastPlace) bgClass = 'bg-red-500/10 border-l-4 border-red-500';
              else if (isPlayoffTeam) bgClass = 'border-l-4 border-brand-500/30';

              return (
                <tr
                  key={team.id}
                  className={`border-b border-slate-800 hover:bg-slate-700/50 transition-colors ${bgClass}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {isChampion && <Trophy className="text-yellow-500" size={18} />}
                      {!isChampion && isPlayoffTeam && rank <= 3 && <Medal className="text-slate-400" size={18} />}
                      <span
                        className={`text-lg font-bold ${
                          isChampion
                            ? 'text-yellow-500'
                            : rank === 2
                            ? 'text-slate-300'
                            : rank === 3
                            ? 'text-orange-400'
                            : isLastPlace
                            ? 'text-red-400'
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
                        className={isChampion ? 'ring-2 ring-yellow-500' : ''}
                      />
                      <span className={`font-bold ${
                        isChampion || rank <= 3 ? 'text-white text-base' : 'text-slate-200'
                      }`}>
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{team.owner}</td>
                  <td className="py-4 px-6">
                    <span className={`font-bold text-lg ${
                      isChampion ? 'text-yellow-500' : isLastPlace ? 'text-red-400' : 'text-white'
                    }`}>
                      {team.record}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{team.roster.length}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {isStrongRoster && <TrendingUp className="text-brand-500" size={14} />}
                      {!isStrongRoster && avgOvr < 75 && <TrendingDown className="text-red-400" size={14} />}
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
                    </div>
                  </td>
                  <td className="py-4 px-6">
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
                  </td>
                </tr>
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
