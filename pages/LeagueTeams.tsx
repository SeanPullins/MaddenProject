import React, { useState } from 'react';
import { ALL_TEAMS } from '../constants';
import { TeamLogo } from '../components/TeamLogo';
import { FormerPlayersPanel } from '../components/FormerPlayersPanel';
import { UserMinus } from 'lucide-react';
import { getTeamColors } from '../utils/teamColors';

export const LeagueTeams: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState(ALL_TEAMS[0]);
  const [showFormerPlayers, setShowFormerPlayers] = useState<boolean>(false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">LEAGUE TEAMS</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h2 className="text-xl font-display font-bold text-white mb-4">TEAMS</h2>
            <div className="space-y-2">
              {ALL_TEAMS.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedTeam.id === team.id
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TeamLogo src={team.avatarUrl} alt={team.name} size="md" />
                    <div>
                      <p className="font-bold">{team.name}</p>
                      <p className="text-sm opacity-80">{team.record}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <TeamLogo
                src={selectedTeam.avatarUrl}
                alt={selectedTeam.name}
                size="xl"
              />
              <div>
                <h2 className="text-3xl font-display font-bold text-white">
                  {selectedTeam.name}
                </h2>
                <p className="text-slate-400">Owner: {selectedTeam.owner}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Record</p>
                <p className="text-2xl font-bold text-white">{selectedTeam.record}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Roster Size</p>
                <p className="text-2xl font-bold text-white">{selectedTeam.roster.length}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm mb-1">Avg OVR</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(
                    selectedTeam.roster.reduce((sum, p) => sum + p.ovr, 0) /
                      selectedTeam.roster.length
                  )}
                </p>
              </div>
            </div>

            {/* Former Players Button */}
            {selectedTeam.formerPlayers && selectedTeam.formerPlayers.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowFormerPlayers(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg text-white font-medium transition-colors"
                >
                  <UserMinus size={20} />
                  Former Players ({selectedTeam.formerPlayers.length})
                </button>
              </div>
            )}

            <h3 className="text-xl font-display font-bold text-white mb-3">TOP PLAYERS</h3>
            <div className="space-y-2">
              {selectedTeam.roster
                .sort((a, b) => b.ovr - a.ovr)
                .slice(0, 10)
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-slate-900 rounded border border-slate-700"
                  >
                    <div>
                      <p className="text-white font-medium">{player.name}</p>
                      <p className="text-slate-400 text-sm">
                        {player.position} • {player.team}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-brand-500 text-white rounded font-bold">
                      {player.ovr}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Former Players Panel */}
      {showFormerPlayers && (
        <FormerPlayersPanel
          teamName={selectedTeam.name}
          formerPlayers={selectedTeam.formerPlayers}
          onClose={() => setShowFormerPlayers(false)}
          teamColor={getTeamColors(selectedTeam.owner.substring(0, 3).toUpperCase()).primary}
        />
      )}
    </div>
  );
};
