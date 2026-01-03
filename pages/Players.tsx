import React, { useState } from 'react';
import { ALL_TEAMS, POSITIONS } from '../constants';
import { Player } from '../types';

export const Players: React.FC = () => {
  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Get all players from all teams
  const allPlayers: Player[] = ALL_TEAMS.flatMap((team) => team.roster);

  // Filter players
  const filteredPlayers = allPlayers.filter((player) => {
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPosition && matchesSearch;
  });

  // Sort by OVR descending
  const sortedPlayers = [...filteredPlayers].sort((a, b) => b.ovr - a.ovr);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">PLAYERS</h1>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">Search Player</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter player name..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-2">Position</label>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Positions</option>
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Player Count */}
      <div className="mb-4">
        <p className="text-slate-400">
          Showing <span className="text-white font-bold">{sortedPlayers.length}</span> players
        </p>
      </div>

      {/* Players Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-700">
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Rank</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Position</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">NFL Team</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">OVR</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Draft</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => (
                <tr
                  key={`${player.id}-${index}`}
                  className="border-b border-slate-800 hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-400">#{index + 1}</td>
                  <td className="py-3 px-4 text-white font-medium">{player.name}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-slate-900 text-slate-300 rounded text-sm">
                      {player.position}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{player.team}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded font-bold ${
                        player.ovr >= 90
                          ? 'bg-yellow-500 text-black'
                          : player.ovr >= 80
                          ? 'bg-brand-500 text-white'
                          : player.ovr >= 70
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-600 text-white'
                      }`}
                    >
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
    </div>
  );
};
