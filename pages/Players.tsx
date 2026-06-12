import React, { useState } from 'react';
import { POSITIONS } from '../constants';
import { useTeams } from '../utils/rosterStore';
import { Player } from '../types';
import { Star, Award, Users, UserCheck } from 'lucide-react';
import { PlayerCard } from '../components/PlayerCard';
import { useLivePlayerData } from '../hooks/useLivePlayerData';

// Tier classification
type PlayerTier = 'Elite' | 'Starter' | 'Solid' | 'Depth';

const getPlayerTier = (ovr: number): PlayerTier => {
  if (ovr >= 90) return 'Elite';
  if (ovr >= 80) return 'Starter';
  if (ovr >= 70) return 'Solid';
  return 'Depth';
};

const getTierConfig = (tier: PlayerTier) => {
  switch (tier) {
    case 'Elite':
      return {
        label: 'Elite',
        color: 'bg-yellow-500 text-black',
        icon: Star,
        borderColor: 'border-yellow-500/30',
        bgAccent: 'bg-yellow-500/5',
      };
    case 'Starter':
      return {
        label: 'Starter',
        color: 'bg-brand-500 text-white',
        icon: Award,
        borderColor: 'border-brand-500/30',
        bgAccent: 'bg-brand-500/5',
      };
    case 'Solid':
      return {
        label: 'Solid',
        color: 'bg-blue-500 text-white',
        icon: UserCheck,
        borderColor: 'border-blue-500/30',
        bgAccent: 'bg-blue-500/5',
      };
    case 'Depth':
      return {
        label: 'Depth',
        color: 'bg-slate-600 text-white',
        icon: Users,
        borderColor: 'border-slate-700',
        bgAccent: 'bg-transparent',
      };
  }
};

export const Players: React.FC = () => {
  const ALL_TEAMS = useTeams();
  const livePlayerData = useLivePlayerData();

  const [positionFilter, setPositionFilter] = useState<string>('ALL');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [teamFilter, setTeamFilter] = useState<string>('ALL');
  const [depthFilter, setDepthFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Get all players from all teams
  const allPlayers: Player[] = ALL_TEAMS.flatMap((team) => team.roster);

  // Get unique NFL teams
  const nflTeams = Array.from(new Set(allPlayers.map((p) => p.team))).sort();

  // Filter players
  const filteredPlayers = allPlayers.filter((player) => {
    const matchesPosition = positionFilter === 'ALL' || player.position === positionFilter;
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || getPlayerTier(player.ovr) === tierFilter;
    const matchesTeam = teamFilter === 'ALL' || player.team === teamFilter;
    const matchesDepth =
      depthFilter === 'ALL' ||
      (depthFilter === 'STARTER' && player.depthOrder === 1) ||
      (depthFilter === 'BACKUP' && player.depthOrder === 2) ||
      (depthFilter === 'DEPTH' && player.depthOrder && player.depthOrder > 2);

    return matchesPosition && matchesSearch && matchesTier && matchesTeam && matchesDepth;
  });

  // Sort by OVR descending
  const sortedPlayers = [...filteredPlayers].sort((a, b) => b.ovr - a.ovr);

  // Calculate tier distribution
  const tierCounts = allPlayers.reduce(
    (acc, player) => {
      const tier = getPlayerTier(player.ovr);
      acc[tier]++;
      return acc;
    },
    { Elite: 0, Starter: 0, Solid: 0, Depth: 0 } as Record<PlayerTier, number>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">PLAYERS</h1>

      {/* Tier Distribution Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(['Elite', 'Starter', 'Solid', 'Depth'] as PlayerTier[]).map((tier) => {
          const config = getTierConfig(tier);
          const Icon = config.icon;

          return (
            <div
              key={tier}
              className={`bg-slate-800 rounded-lg p-4 border ${config.borderColor} ${config.bgAccent}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="text-slate-400" size={20} />
                <span className="text-slate-400 text-sm font-medium">{tier}</span>
              </div>
              <p className="text-2xl font-bold text-white">{tierCounts[tier]}</p>
              <p className="text-xs text-slate-500 mt-1">
                {tier === 'Elite' && '90+ OVR'}
                {tier === 'Starter' && '80-89 OVR'}
                {tier === 'Solid' && '70-79 OVR'}
                {tier === 'Depth' && '<70 OVR'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

          <div>
            <label className="block text-slate-400 text-sm mb-2">Player Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Tiers</option>
              <option value="Elite">Elite (90+)</option>
              <option value="Starter">Starter (80-89)</option>
              <option value="Solid">Solid (70-79)</option>
              <option value="Depth">Depth (&lt;70)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-2">NFL Team</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Teams</option>
              {nflTeams.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Depth Chart</label>
            <select
              value={depthFilter}
              onChange={(e) => setDepthFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ALL">All Depth Slots</option>
              <option value="STARTER">Starters Only</option>
              <option value="BACKUP">Backups Only</option>
              <option value="DEPTH">Depth Only (3+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Player Count */}
      <div className="mb-4">
        <p className="text-slate-400">
          Showing <span className="text-white font-bold">{sortedPlayers.length}</span> of{' '}
          {allPlayers.length} players
        </p>
      </div>

      {/* Players Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
          <table className="w-full min-w-max">
            <thead>
              <tr className="bg-slate-900 border-b-2 border-slate-700">
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Rank</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Name</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Position</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">NFL Team</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Rating</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Tier</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium">Draft</th>
              </tr>
            </thead>

            <tbody>
              {sortedPlayers.map((player, index) => {
                const tier = getPlayerTier(player.ovr);
                const tierConfig = getTierConfig(tier);
                const TierIcon = tierConfig.icon;
                const isTopTier = tier === 'Elite' || tier === 'Starter';

                return (
                  <tr
                    key={`${player.id}-${index}`}
                    onClick={() => setSelectedPlayer(player)}
                    className={`border-b border-slate-800 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                      tier === 'Elite' ? 'bg-yellow-500/5' : tierConfig.bgAccent
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span
                        className={`text-sm font-medium ${
                          index < 3 ? 'text-yellow-500' : 'text-slate-400'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-medium ${
                          isTopTier ? 'text-white text-base' : 'text-slate-300'
                        }`}
                      >
                        {player.name}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2 py-1 bg-slate-900 text-slate-300 rounded text-sm font-medium">
                        {player.position}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-300 text-sm">{player.team}</td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg font-bold text-sm ${tierConfig.color}`}
                      >
                        {player.ovr}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <TierIcon size={16} className="text-slate-500" />
                        <span className="text-slate-300 text-sm font-medium">{tier}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-400 text-sm">{player.draftRound}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Card Modal */}
      {selectedPlayer && (
        <PlayerCard
          player={selectedPlayer}
          live={livePlayerData?.players[selectedPlayer.name]}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
};
