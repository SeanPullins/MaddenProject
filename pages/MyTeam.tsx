import React from 'react';
import { CRUISE_SHIP_CRUSADERS } from '../constants';

export const MyTeam: React.FC = () => {
  const team = CRUISE_SHIP_CRUSADERS;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <img src={team.avatarUrl} alt={team.name} className="w-20 h-20 rounded-full" />
        <div>
          <h1 className="text-4xl font-display font-bold text-white">{team.name}</h1>
          <p className="text-slate-400">Owner: {team.owner}</p>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Record</p>
          <p className="text-2xl font-bold text-white">{team.record}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Active Roster</p>
          <p className="text-2xl font-bold text-white">{team.roster.length}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Practice Squad</p>
          <p className="text-2xl font-bold text-white">{team.practiceSquad.length}</p>
        </div>
      </div>

      {/* Active Roster */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <h2 className="text-2xl font-display font-bold text-white mb-4">ACTIVE ROSTER</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Position</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Team</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">OVR</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Draft</th>
              </tr>
            </thead>
            <tbody>
              {team.roster.map((player) => (
                <tr key={player.id} className="border-b border-slate-800 hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-white">{player.name}</td>
                  <td className="py-3 px-4 text-slate-300">{player.position}</td>
                  <td className="py-3 px-4 text-slate-300">{player.team}</td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-1 bg-brand-500 text-white rounded text-sm font-bold">
                      {player.ovr}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{player.draftRound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practice Squad */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-display font-bold text-white mb-4">PRACTICE SQUAD</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {team.practiceSquad.map((player) => (
            <div key={player.id} className="bg-slate-900 rounded p-3 border border-slate-700">
              <p className="text-white font-medium">{player.name}</p>
              <p className="text-slate-400 text-sm">
                {player.position} • {player.team}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
