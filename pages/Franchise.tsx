import React from 'react';
import { useTeams } from '../utils/rosterStore';

export const Franchise: React.FC = () => {
  const ALL_TEAMS = useTeams();
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">FRANCHISE MODE</h1>

      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <h2 className="text-2xl font-display font-bold text-white mb-4">LEAGUE OVERVIEW</h2>
        <p className="text-slate-300 mb-4">
          Manage your fantasy franchise with Madden-based player ratings and attributes.
          Track rosters, practice squads, former players, and draft picks across all teams.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Franchises</p>
            <p className="text-2xl font-bold text-white">{ALL_TEAMS.length}</p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Total Players</p>
            <p className="text-2xl font-bold text-white">
              {ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0)}
            </p>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-400 text-sm mb-1">Practice Squad</p>
            <p className="text-2xl font-bold text-white">
              {ALL_TEAMS.reduce((sum, team) => sum + team.practiceSquad.length, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ALL_TEAMS.map((team) => (
          <div key={team.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <img src={team.avatarUrl} alt={team.name} className="w-16 h-16 rounded-full" />
              <div>
                <h3 className="text-xl font-display font-bold text-white">{team.name}</h3>
                <p className="text-slate-400">{team.owner}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Record</p>
                <p className="text-white font-bold">{team.record}</p>
              </div>
              <div className="bg-slate-900 rounded p-3 border border-slate-700">
                <p className="text-slate-400 text-xs mb-1">Tags Saved</p>
                <p className="text-white font-bold">{team.tagsSaved}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Roster:</span>
                <span className="text-white font-medium">{team.roster.length} players</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Practice Squad:</span>
                <span className="text-white font-medium">{team.practiceSquad.length} players</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Former Players:</span>
                <span className="text-white font-medium">{team.formerPlayers.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
