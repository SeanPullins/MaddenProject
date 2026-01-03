import React from 'react';
import { ALL_TEAMS } from '../constants';

export const Standings: React.FC = () => {
  // Sort teams by record (simplified - assumes W-L format like "10-4")
  const sortedTeams = [...ALL_TEAMS].sort((a, b) => {
    const aWins = parseInt(a.record.split('-')[0] || '0');
    const bWins = parseInt(b.record.split('-')[0] || '0');
    return bWins - aWins;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">STANDINGS</h1>

      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700">
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Rank</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Team</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Owner</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Record</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Roster Size</th>
              <th className="text-left py-4 px-6 text-slate-400 font-medium">Avg OVR</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const avgOvr = Math.round(
                team.roster.reduce((sum, p) => sum + p.ovr, 0) / team.roster.length
              );

              return (
                <tr
                  key={team.id}
                  className={`border-b border-slate-800 hover:bg-slate-700/50 transition-colors ${
                    index === 0 ? 'bg-yellow-500/10' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <span
                      className={`text-lg font-bold ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-slate-300'
                          : index === 2
                          ? 'text-orange-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={team.avatarUrl}
                        alt={team.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <span className="text-white font-bold">{team.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{team.owner}</td>
                  <td className="py-4 px-6">
                    <span className="text-white font-bold text-lg">{team.record}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-300">{team.roster.length}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded font-bold ${
                        avgOvr >= 80
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
                      {avgOvr}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Players</p>
          <p className="text-3xl font-bold text-white">
            {ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0)}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Average Roster Size</p>
          <p className="text-3xl font-bold text-white">
            {Math.round(
              ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0) / ALL_TEAMS.length
            )}
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">League Avg OVR</p>
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
  );
};
