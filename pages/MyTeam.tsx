import React, { useState, useEffect, useMemo } from 'react';
import { ALL_TEAMS } from '../constants';
import { Team, Player } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { PlayerCard } from '../components/PlayerCard';
import { FormerPlayersPanel } from '../components/FormerPlayersPanel';
import { LeagueScoreModal } from '../components/LeagueScoreModal';
import { AIReviewModal } from '../components/AIReviewModal';
import { UserMinus, Target, Star, Shield, TrendingUp, Info, Brain } from 'lucide-react';
import { getTeamColors } from '../utils/teamColors';
import { calculateLeagueScores } from '../utils/leagueScoring';

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
  const [showFormerPlayers, setShowFormerPlayers] = useState<boolean>(false);
  const [hoveredScore, setHoveredScore] = useState<boolean>(false);
  const [modalTeamId, setModalTeamId] = useState<string | null>(null);
  const [showAIReview, setShowAIReview] = useState<boolean>(false);

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

  // Calculate league scores and get current team's score (safely)
  const leagueScores = useMemo(() => {
    try {
      return calculateLeagueScores(ALL_TEAMS);
    } catch (error) {
      console.error('Failed to calculate league scores:', error);
      return [];
    }
  }, []);
  const teamScore = useMemo(() =>
    leagueScores.find(ts => ts.teamId === team.id),
    [leagueScores, team.id]
  );
  const teamRank = useMemo(() => {
    const index = leagueScores.findIndex(ts => ts.teamId === team.id);
    return index !== -1 ? index + 1 : null;
  }, [leagueScores, team.id]);

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div
          className="bg-slate-800 rounded-lg p-6 border border-slate-700 relative cursor-pointer hover:border-brand-500 transition-colors"
          onMouseEnter={() => setHoveredScore(true)}
          onMouseLeave={() => setHoveredScore(false)}
          onClick={() => setModalTeamId(team.id)}
          title="Click for detailed breakdown"
        >
          <div className="flex items-center gap-2 mb-1">
            <Target size={16} className="text-brand-500" />
            <p className="text-slate-400 text-sm">League Score</p>
            <Info size={12} className="text-slate-500" />
          </div>
          {teamScore ? (
            <div>
              <p className="text-2xl font-bold text-brand-500">
                {teamScore.totalScore.toFixed(1)}
              </p>
              {teamRank && (
                <p className="text-slate-500 text-xs mt-1">
                  Rank: #{teamRank} of {leagueScores.length}
                </p>
              )}
            </div>
          ) : (
            <p className="text-2xl font-bold text-white">-</p>
          )}

          {/* Hover Tooltip */}
          {hoveredScore && teamScore && (
            <div className="absolute left-0 top-full mt-2 z-50 w-80">
              <div className="bg-slate-900 rounded-lg shadow-2xl border border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                  <Target size={14} className="text-brand-500" />
                  <h4 className="text-white font-bold text-xs">Score Breakdown</h4>
                </div>

                <div className="space-y-2">
                  {/* Positional Leaders */}
                  <div className="flex items-start gap-2">
                    <Star className="text-yellow-500 flex-shrink-0 mt-0.5" size={12} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-xs font-semibold">
                          Positional Leaders
                        </span>
                        <span className="text-brand-500 font-bold text-xs">
                          {teamScore.breakdown.positionalLeaders.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Depth Bonus */}
                  <div className="flex items-start gap-2">
                    <Shield className="text-blue-500 flex-shrink-0 mt-0.5" size={12} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-xs font-semibold">
                          Depth Bonus
                        </span>
                        <span className="text-brand-500 font-bold text-xs">
                          {teamScore.breakdown.depthBonus.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Extra Starters */}
                  <div className="flex items-start gap-2">
                    <TrendingUp className="text-green-500 flex-shrink-0 mt-0.5" size={12} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 text-xs font-semibold">
                          Extra Starters
                        </span>
                        <span className="text-brand-500 font-bold text-xs">
                          {teamScore.breakdown.extraStarters.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-xs font-bold">Total</span>
                      <span className="text-brand-500 text-sm font-bold">
                        {teamScore.totalScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-3">
        {/* AI Review Button - NEW FEATURE */}
        <button
          onClick={() => setShowAIReview(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border border-purple-500 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          <Brain size={20} />
          AI Review Team
        </button>

        {/* Former Players Button */}
        {team.formerPlayers && team.formerPlayers.length > 0 && (
          <button
            onClick={() => setShowFormerPlayers(true)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg text-white font-medium transition-colors"
          >
            <UserMinus size={20} />
            Former Players ({team.formerPlayers.length})
          </button>
        )}
      </div>

      {/* Roster by Position */}
      <div className="space-y-6">
        {groupedRoster.map((positionGroup) => (
          <div key={positionGroup.position} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-display font-bold text-white mb-4">{positionGroup.label.toUpperCase()}</h2>
            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
              <table className="w-full min-w-max">
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

      {/* Former Players Panel */}
      {showFormerPlayers && (
        <FormerPlayersPanel
          teamName={team.name}
          formerPlayers={team.formerPlayers}
          onClose={() => setShowFormerPlayers(false)}
          teamColor={getTeamColors(team.owner.substring(0, 3).toUpperCase()).primary}
        />
      )}

      {/* League Score Modal */}
      {modalTeamId && (() => {
        const modalTeam = ALL_TEAMS.find(t => t.id === modalTeamId);
        const teamScore = leagueScores.find(ts => ts.teamId === modalTeamId);
        if (modalTeam && teamScore) {
          return (
            <LeagueScoreModal
              teamName={modalTeam.name}
              teamScore={teamScore}
              onClose={() => setModalTeamId(null)}
            />
          );
        }
        return null;
      })()}

      {/* AI Review Modal - NEW FEATURE */}
      {showAIReview && (
        <AIReviewModal
          team={team}
          onClose={() => setShowAIReview(false)}
        />
      )}
    </div>
  );
};
