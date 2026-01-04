import React, { useState, useMemo } from 'react';
import { ALL_TEAMS } from '../constants';
import { TeamLogo } from '../components/TeamLogo';
import { FormerPlayersPanel } from '../components/FormerPlayersPanel';
import { LeagueScoreModal } from '../components/LeagueScoreModal';
import { UserMinus, Target, Star, Shield, TrendingUp, Info } from 'lucide-react';
import { getTeamColors } from '../utils/teamColors';
import { calculateLeagueScores } from '../utils/leagueScoring';
import { Page } from '../types';

interface LeagueTeamsProps {
  onNavigate: (page: Page) => void;
}

const SELECTED_TEAM_KEY = 'fanleague_selected_team_id';

export const LeagueTeams: React.FC<LeagueTeamsProps> = ({ onNavigate }) => {
  const [selectedTeam, setSelectedTeam] = useState(ALL_TEAMS[0]);
  const [showFormerPlayers, setShowFormerPlayers] = useState<boolean>(false);
  const [hoveredScore, setHoveredScore] = useState<boolean>(false);
  const [modalTeamId, setModalTeamId] = useState<string | null>(null);

  // Calculate league scores
  const leagueScores = useMemo(() => {
    try {
      return calculateLeagueScores(ALL_TEAMS);
    } catch (error) {
      console.error('Failed to calculate league scores:', error);
      return [];
    }
  }, []);

  const teamScore = useMemo(() =>
    leagueScores.find(ts => ts.teamId === selectedTeam.id),
    [leagueScores, selectedTeam.id]
  );

  const handleTeamClick = (teamId: string) => {
    // Set team in localStorage
    localStorage.setItem(SELECTED_TEAM_KEY, teamId);
    // Navigate to My Team page
    onNavigate(Page.MY_TEAM);
  };

  const getTeamScore = (teamId: string) => {
    const score = leagueScores.find(ts => ts.teamId === teamId);
    return score?.totalScore.toFixed(1) || '0.0';
  };

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
                  onDoubleClick={() => handleTeamClick(team.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedTeam.id === team.id
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Double-click to view full roster"
                >
                  <div className="flex items-center gap-3">
                    <TeamLogo src={team.avatarUrl} alt={team.name} size="md" />
                    <div className="flex-1">
                      <p className="font-bold">{team.name}</p>
                      <div className="flex items-center gap-1 text-sm opacity-80">
                        <Target size={12} className="text-brand-400" />
                        <span>{getTeamScore(team.id)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-3 text-center">
              Double-click any team to view full roster
            </p>
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
              {/* League Score Card with Tooltip */}
              <div
                className="bg-slate-900 rounded-lg p-4 border border-slate-700 relative cursor-pointer hover:border-brand-500 transition-colors"
                onMouseEnter={() => setHoveredScore(true)}
                onMouseLeave={() => setHoveredScore(false)}
                onClick={() => setModalTeamId(selectedTeam.id)}
                title="Click for detailed breakdown"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} className="text-brand-500" />
                  <p className="text-slate-400 text-sm">League Score</p>
                  <Info size={12} className="text-slate-500" />
                </div>
                <p className="text-2xl font-bold text-brand-500">
                  {teamScore?.totalScore.toFixed(1) || '0.0'}
                </p>

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

            {/* View Full Roster Button */}
            <button
              onClick={() => handleTeamClick(selectedTeam.id)}
              className="w-full mb-6 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors"
            >
              View Full Roster →
            </button>

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

      {/* League Score Modal */}
      {modalTeamId && (() => {
        const team = ALL_TEAMS.find(t => t.id === modalTeamId);
        const teamScore = leagueScores.find(ts => ts.teamId === modalTeamId);
        if (team && teamScore) {
          return (
            <LeagueScoreModal
              teamName={team.name}
              teamScore={teamScore}
              onClose={() => setModalTeamId(null)}
            />
          );
        }
        return null;
      })()}
    </div>
  );
};
