import React, { useState, useEffect, useMemo } from 'react';
import { ALL_TEAMS } from '../constants';
import { Team, Player } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { PlayerCard } from '../components/PlayerCard';

const SELECTED_TEAM_KEY = 'fanleague_selected_team_id';

// Position order for grouping
const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'OL', 'ED', 'DT', 'LB', 'CB', 'S'];

// Position labels
const POSITION_LABELS: Record<string, string> = {
  QB: 'Quarterbacks',
  RB: 'Running Backs',
  WR: 'Wide Receivers',
  TE: 'Tight Ends',
  OL: 'Offensive Line',
  ED: 'Edge Rushers',
  DT: 'Defensive Tackles',
  LB: 'Linebackers',
  CB: 'Cornerbacks',
  S: 'Safeties',
};

export const MyTeam: React.FC = () => {
  // Load saved team from localStorage or default to first team
  const [team, setTeam] = useState<Team>(() => {
    const savedTeamId = localStorage.getItem(SELECTED_TEAM_KEY);
    if (savedTeamId) {
      const savedTeam = ALL_TEAMS.find(t => t.id === savedTeamId);
      if (savedTeam) return savedTeam;
    }
    return ALL_TEAMS[0];
  });

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Persist team selection to localStorage
  useEffect(() => {
    localStorage.setItem(SELECTED_TEAM_KEY, team.id);
  }, [team]);

  const handleTeamChange = (teamId: string) => {
    const selectedTeam = ALL_TEAMS.find(t => t.id === teamId);
    if (selectedTeam) {
      setTeam(selectedTeam);
    }
  };

  // Group and sort roster by position and depth chart
  const groupedRoster = useMemo(() => {
    // Combine roster and practice squad
    const allPlayers = [...team.roster, ...team.practiceSquad];

    // Group by position
    const grouped: Record<string, Player[]> = {};

    allPlayers.forEach(player => {
      const position = player.position;
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(player);
    });

    // Sort players within each position group
    Object.keys(grouped).forEach(position => {
      grouped[position].sort((a, b) => {
        // Sort by status first (ACTIVE before PRACTICE_SQUAD)
        const statusA = a.status === 'ACTIVE' ? 0 : 1;
        const statusB = b.status === 'ACTIVE' ? 0 : 1;
        if (statusA !== statusB) return statusA - statusB;

        // Then by depthOrder (lower number = higher on depth chart)
        const depthA = a.depthOrder ?? 999;
        const depthB = b.depthOrder ?? 999;
        return depthA - depthB;
      });
    });

    // Return positions in desired order, only including positions that exist
    return POSITION_ORDER.map(pos => ({
      position: pos,
      label: POSITION_LABELS[pos] || pos,
      players: grouped[pos] || []
    })).filter(group => group.players.length > 0);
  }, [team.roster, team.practiceSquad]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Team Selector */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
        <label className="block text-slate-400 text-sm mb-2 font-medium">Select Your Team</label>
        <select
          value={team.id}
          onChange={(e) => handleTeamChange(e.target.value)}
          className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 text-lg"
        >
          {ALL_TEAMS.map(t => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.owner})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <TeamLogo src={team.avatarUrl} alt={team.name} size="xl" />
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

      {/* Roster by Position */}
      <div className="space-y-6">
        {groupedRoster.map((positionGroup) => (
          <div key={positionGroup.position} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-display font-bold text-white mb-4">{positionGroup.label.toUpperCase()}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">NFL Team</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">OVR</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Draft</th>
                  </tr>
                </thead>
                <tbody>
                  {positionGroup.players.map((player) => (
                    <tr
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`border-b border-slate-800 hover:bg-slate-700/50 cursor-pointer transition-colors ${
                        player.status === 'PRACTICE_SQUAD' ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-white">{player.name}</td>
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
        ))}
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCard
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
