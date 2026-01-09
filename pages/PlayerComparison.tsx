import React, { useState, useMemo } from 'react';
import { ALL_TEAMS } from '../constants';
import { Player, Team } from '../types';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Users, User, Shield, Zap, Info } from 'lucide-react';
import { PlayerCard } from '../components/PlayerCard';

type ComparisonMode = 'player-vs-player' | 'team-vs-team';
type TeamComparisonType = 'offense-vs-defense' | 'offense-vs-offense' | 'defense-vs-defense';
type Formation = string;

const OFFENSIVE_FORMATIONS = ['Spread', 'I-Form', 'Shotgun', 'West Coast', 'Pro Set'];
const DEFENSIVE_FORMATIONS = ['4-3', '3-4', 'Nickel', 'Dime', '4-6'];

// Position groups
const OFFENSIVE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C'];
const DEFENSIVE_POSITIONS = ['ED', 'DT', 'LB', 'CB', 'S'];

export const PlayerComparison: React.FC = () => {
  const allPlayers: Player[] = ALL_TEAMS.flatMap((team) => team.roster);

  // Mode selection
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('player-vs-player');

  // Player vs Player state
  const [player1, setPlayer1] = useState<Player | null>(allPlayers[0] || null);
  const [player2, setPlayer2] = useState<Player | null>(allPlayers[1] || null);

  // Team vs Team state
  const [teamA, setTeamA] = useState<Team | null>(ALL_TEAMS[0] || null);
  const [teamB, setTeamB] = useState<Team | null>(ALL_TEAMS[1] || null);
  const [teamComparisonType, setTeamComparisonType] = useState<TeamComparisonType>('offense-vs-defense');
  const [offensiveFormation, setOffensiveFormation] = useState<Formation>(OFFENSIVE_FORMATIONS[0]);
  const [defensiveFormation, setDefensiveFormation] = useState<Formation>(DEFENSIVE_FORMATIONS[0]);

  // Player card modal state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Get players by position group
  const getOffensivePlayers = (team: Team): Player[] => {
    return team.roster.filter(p => OFFENSIVE_POSITIONS.includes(p.position));
  };

  const getDefensivePlayers = (team: Team): Player[] => {
    return team.roster.filter(p => DEFENSIVE_POSITIONS.includes(p.position));
  };

  // Calculate team average OVR
  const getTeamAvgOVR = (players: Player[]): number => {
    if (players.length === 0) return 0;
    return Math.round(players.reduce((sum, p) => sum + p.ovr, 0) / players.length);
  };

  // Team comparison analysis (simulated logic)
  const teamComparisonAnalysis = useMemo(() => {
    if (!teamA || !teamB) return null;

    let teamAPlayers: Player[] = [];
    let teamBPlayers: Player[] = [];
    let description = '';

    if (teamComparisonType === 'offense-vs-defense') {
      teamAPlayers = getOffensivePlayers(teamA);
      teamBPlayers = getDefensivePlayers(teamB);
      description = `${teamA.name}'s ${offensiveFormation} offense vs ${teamB.name}'s ${defensiveFormation} defense`;
    } else if (teamComparisonType === 'offense-vs-offense') {
      teamAPlayers = getOffensivePlayers(teamA);
      teamBPlayers = getOffensivePlayers(teamB);
      description = `${teamA.name}'s ${offensiveFormation} offense vs ${teamB.name}'s ${offensiveFormation} offense`;
    } else {
      teamAPlayers = getDefensivePlayers(teamA);
      teamBPlayers = getDefensivePlayers(teamB);
      description = `${teamA.name}'s ${defensiveFormation} defense vs ${teamB.name}'s ${defensiveFormation} defense`;
    }

    const avgA = getTeamAvgOVR(teamAPlayers);
    const avgB = getTeamAvgOVR(teamBPlayers);
    const advantage = avgA - avgB;

    return {
      teamAPlayers,
      teamBPlayers,
      avgA,
      avgB,
      advantage,
      description,
      winner: advantage > 0 ? teamA.name : advantage < 0 ? teamB.name : 'TIE'
    };
  }, [teamA, teamB, teamComparisonType, offensiveFormation, defensiveFormation]);

  // Calculate attribute differences (player vs player)
  const attributeDifferences = useMemo(() => {
    if (!player1 || !player2 || !player1.attributes || !player2.attributes) {
      return [];
    }

    return player1.attributes.map((attr1, index) => {
      const attr2 = player2.attributes?.[index];
      if (!attr2) return null;

      const diff = attr1.value - attr2.value;
      const absDiff = Math.abs(diff);

      return {
        name: attr1.name,
        player1Value: attr1.value,
        player2Value: attr2.value,
        difference: diff,
        absDifference: absDiff,
      };
    }).filter(Boolean);
  }, [player1, player2]);

  // Find biggest differences
  const biggestDifferences = useMemo(() => {
    return [...attributeDifferences]
      .sort((a, b) => b!.absDifference - a!.absDifference)
      .slice(0, 3);
  }, [attributeDifferences]);

  const isSamePlayer = player1?.id === player2?.id;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
        PLAYER COMPARISON
      </h1>
      <p className="text-slate-400 text-sm md:text-base mb-6 md:mb-8">
        Compare players or teams side-by-side
      </p>

      {/* Mode Selector */}
      <div className="bg-slate-800/50 rounded-lg p-4 mb-6 md:mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setComparisonMode('player-vs-player')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              comparisonMode === 'player-vs-player'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <User size={18} />
            <span className="font-medium">Player vs Player</span>
          </button>
          <button
            onClick={() => setComparisonMode('team-vs-team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              comparisonMode === 'team-vs-team'
                ? 'bg-brand-500 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users size={18} />
            <span className="font-medium">Team vs Team</span>
          </button>
        </div>
      </div>

      {/* PLAYER VS PLAYER MODE */}
      {comparisonMode === 'player-vs-player' && (
        <>
          {/* Player Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <label className="block text-slate-500 text-xs uppercase tracking-wider mb-2">Player 1</label>
              <select
                value={player1?.id || ''}
                onChange={(e) => {
                  const p = allPlayers.find((p) => p.id === e.target.value);
                  if (p) setPlayer1(p);
                }}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === player2?.id}>
                    {p.name} ({p.position} - {p.ovr})
                    {p.id === player2?.id ? ' - Selected as Player 2' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <label className="block text-slate-500 text-xs uppercase tracking-wider mb-2">Player 2</label>
              <select
                value={player2?.id || ''}
                onChange={(e) => {
                  const p = allPlayers.find((p) => p.id === e.target.value);
                  if (p) setPlayer2(p);
                }}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              >
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === player1?.id}>
                    {p.name} ({p.position} - {p.ovr})
                    {p.id === player1?.id ? ' - Selected as Player 1' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Same Player Warning */}
          {isSamePlayer && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="text-yellow-500" size={20} />
              <p className="text-yellow-500 text-sm">
                You've selected the same player twice. Choose different players to compare.
              </p>
            </div>
          )}

          {/* Key Differences Highlight */}
          {player1 && player2 && !isSamePlayer && biggestDifferences.length > 0 && (
            <div className="bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/30 rounded-lg p-6 mb-6">
              <h2 className="text-lg md:text-xl font-display font-bold text-white mb-4">
                BIGGEST DIFFERENCES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {biggestDifferences.map((diff, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">{diff!.name}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-center flex-1">
                        <p className="text-xs text-slate-600 mb-1">{player1.name}</p>
                        <p className={`text-2xl font-bold ${diff!.difference > 0 ? 'text-brand-500' : 'text-slate-500'}`}>
                          {diff!.player1Value}
                        </p>
                      </div>
                      <div className="text-slate-700 text-sm">vs</div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-slate-600 mb-1">{player2.name}</p>
                        <p className={`text-2xl font-bold ${diff!.difference < 0 ? 'text-brand-500' : 'text-slate-500'}`}>
                          {diff!.player2Value}
                        </p>
                      </div>
                    </div>
                    <p className="text-center text-xs text-slate-600 mt-2">
                      Δ {diff!.absDifference}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Display */}
          {player1 && player2 && !isSamePlayer && (
            <>
              {/* Mobile: Stacked layout */}
              <div className="block md:hidden space-y-6 mb-6">
                {[player1, player2].map((player, playerIndex) => (
                  <div key={player.id} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h2 className="text-xl font-display font-bold text-white">{player.name}</h2>
                        <p className="text-slate-500 text-sm">
                          {player.position} • {player.team}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-xs uppercase tracking-wider">Overall</span>
                        <div className="flex items-center gap-1">
                          <span className={`text-2xl font-bold ${
                            (playerIndex === 0 && player1.ovr > player2.ovr) || (playerIndex === 1 && player2.ovr > player1.ovr)
                              ? 'text-brand-500'
                              : 'text-slate-500'
                          }`}>
                            {player.ovr}
                          </span>
                          {((playerIndex === 0 && player1.ovr > player2.ovr) || (playerIndex === 1 && player2.ovr > player1.ovr)) && (
                            <TrendingUp className="text-brand-500" size={14} />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-700">
                        <span className="text-slate-500 text-xs">Draft</span>
                        <span className="text-slate-400 text-sm">{player.draftRound}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-xs">Free Agency</span>
                        <span className="text-slate-400 text-sm">{player.faYear}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-xs">Depth</span>
                        <span className="text-slate-400 text-sm">#{player.depthOrder}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Side-by-side */}
              <div className="hidden md:grid md:grid-cols-2 gap-6 mb-6">
                {[player1, player2].map((player, playerIndex) => (
                  <div
                    key={player.id}
                    className="bg-slate-800/50 rounded-lg p-6"
                  >
                    <div
                      className="flex items-center gap-4 mb-6 cursor-pointer hover:bg-slate-700/30 -m-2 p-2 rounded-lg transition-colors"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-20 h-20 rounded-full"
                      />
                      <div>
                        <h2 className="text-2xl font-display font-bold text-white">{player.name}</h2>
                        <p className="text-slate-500">
                          {player.position} • {player.team}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <span className="text-slate-600 text-xs uppercase tracking-wider block mb-1">Overall Rating</span>
                        <div className="flex items-center gap-2">
                          {((playerIndex === 0 && player1.ovr > player2.ovr) || (playerIndex === 1 && player2.ovr > player1.ovr)) && (
                            <TrendingUp className="text-brand-500" size={16} />
                          )}
                          <span className={`text-4xl font-bold ${
                            (playerIndex === 0 && player1.ovr > player2.ovr) || (playerIndex === 1 && player2.ovr > player1.ovr)
                              ? 'text-brand-500'
                              : 'text-slate-500'
                          }`}>
                            {player.ovr}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-700 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-xs">Draft Round</span>
                          <span className="text-slate-400">{player.draftRound}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-xs">Free Agency</span>
                          <span className="text-slate-400">{player.faYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 text-xs">Depth Order</span>
                          <span className="text-slate-400">#{player.depthOrder}</span>
                        </div>
                      </div>
                    </div>

                    {player.attributes && player.attributes.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-700">
                        <h3 className="text-sm uppercase tracking-wider text-slate-600 mb-4">ATTRIBUTES</h3>
                        <div className="space-y-2">
                          {player.attributes.map((attr, attrIndex) => {
                            const otherPlayer = playerIndex === 0 ? player2 : player1;
                            const otherAttr = otherPlayer.attributes?.[attrIndex];
                            const diff = otherAttr ? attr.value - otherAttr.value : 0;
                            const isHigher = diff > 0;
                            const isLower = diff < 0;

                            return (
                              <div
                                key={attrIndex}
                                className="flex justify-between items-center py-2"
                              >
                                <span className="text-slate-500 text-xs">{attr.name}</span>
                                <div className="flex items-center gap-2">
                                  {isHigher && <TrendingUp className="text-brand-500/50" size={12} />}
                                  {isLower && <TrendingDown className="text-red-400/50" size={12} />}
                                  <span className={`font-bold text-lg ${
                                    isHigher ? 'text-brand-500' : isLower ? 'text-slate-600' : 'text-slate-500'
                                  }`}>
                                    {attr.value}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Winner Summary */}
              <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="text-center">
                  <p className="text-slate-600 text-xs uppercase tracking-wider mb-2">Higher Overall</p>
                  <p className="text-3xl font-display font-bold text-brand-500 mb-1">
                    {player1.ovr > player2.ovr
                      ? player1.name
                      : player2.ovr > player1.ovr
                      ? player2.name
                      : 'TIE'}
                  </p>
                  {player1.ovr !== player2.ovr && (
                    <p className="text-slate-600 text-sm">
                      +{Math.abs(player1.ovr - player2.ovr)} OVR advantage
                    </p>
                  )}
                </div>

                {attributeDifferences.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-700">
                    <div className="text-center">
                      <p className="text-slate-600 text-xs mb-2">{player1.name} Advantages</p>
                      <p className="text-3xl font-bold text-brand-500">
                        {attributeDifferences.filter(d => d!.difference > 0).length}
                      </p>
                      <p className="text-slate-600 text-xs mt-1">attributes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-600 text-xs mb-2">{player2.name} Advantages</p>
                      <p className="text-3xl font-bold text-brand-500">
                        {attributeDifferences.filter(d => d!.difference < 0).length}
                      </p>
                      <p className="text-slate-600 text-xs mt-1">attributes</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* TEAM VS TEAM MODE */}
      {comparisonMode === 'team-vs-team' && (
        <>
          {/* Prototype Notice */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
            <div className="text-sm text-slate-300">
              <strong className="text-white">Prototype Feature:</strong> Formation logic is simulated.
              Team averages calculated from position groups.
            </div>
          </div>

          {/* Step-by-step Flow */}
          <div className="space-y-6">
            {/* Step 1: Select Teams */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">1</span>
                SELECT TEAMS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 text-xs uppercase tracking-wider mb-2">Team A</label>
                  <select
                    value={teamA?.id || ''}
                    onChange={(e) => {
                      const team = ALL_TEAMS.find(t => t.id === e.target.value);
                      if (team) setTeamA(team);
                    }}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  >
                    {ALL_TEAMS.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.owner})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 text-xs uppercase tracking-wider mb-2">Team B</label>
                  <select
                    value={teamB?.id || ''}
                    onChange={(e) => {
                      const team = ALL_TEAMS.find(t => t.id === e.target.value);
                      if (team) setTeamB(team);
                    }}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  >
                    {ALL_TEAMS.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.owner})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Select Comparison Type */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">2</span>
                SELECT COMPARISON TYPE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setTeamComparisonType('offense-vs-defense')}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                    teamComparisonType === 'offense-vs-defense'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Zap size={20} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Offense vs Defense</p>
                    <p className="text-xs opacity-70">Team A attacks Team B</p>
                  </div>
                </button>
                <button
                  onClick={() => setTeamComparisonType('offense-vs-offense')}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                    teamComparisonType === 'offense-vs-offense'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Zap size={20} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Offense vs Offense</p>
                    <p className="text-xs opacity-70">Compare offensive units</p>
                  </div>
                </button>
                <button
                  onClick={() => setTeamComparisonType('defense-vs-defense')}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
                    teamComparisonType === 'defense-vs-defense'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Shield size={20} />
                  <div className="text-left">
                    <p className="font-bold text-sm">Defense vs Defense</p>
                    <p className="text-xs opacity-70">Compare defensive units</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Select Formations */}
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-base font-display font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">3</span>
                SELECT FORMATIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(teamComparisonType === 'offense-vs-defense' || teamComparisonType === 'offense-vs-offense') && (
                  <div>
                    <label className="block text-slate-600 text-xs uppercase tracking-wider mb-2">Offensive Formation</label>
                    <select
                      value={offensiveFormation}
                      onChange={(e) => setOffensiveFormation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                    >
                      {OFFENSIVE_FORMATIONS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}
                {(teamComparisonType === 'offense-vs-defense' || teamComparisonType === 'defense-vs-defense') && (
                  <div>
                    <label className="block text-slate-600 text-xs uppercase tracking-wider mb-2">Defensive Formation</label>
                    <select
                      value={defensiveFormation}
                      onChange={(e) => setDefensiveFormation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                    >
                      {DEFENSIVE_FORMATIONS.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: View Results */}
            {teamComparisonAnalysis && (
              <div className="bg-gradient-to-r from-brand-500/10 to-blue-500/10 border border-brand-500/30 rounded-lg p-6">
                <h3 className="text-base font-display font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs">4</span>
                  MATCHUP ANALYSIS
                </h3>
                <p className="text-slate-500 text-xs mb-6">{teamComparisonAnalysis.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <h4 className="text-brand-500 font-bold mb-4 text-lg">{teamA?.name}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-xs">Unit Type</span>
                        <span className="text-white font-medium text-sm">
                          {teamComparisonType.includes('offense') && teamComparisonType !== 'defense-vs-defense' ? 'Offense' : 'Defense'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-xs">Players</span>
                        <span className="text-white font-medium text-sm">{teamComparisonAnalysis.teamAPlayers.length}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                        <span className="text-slate-600 text-xs uppercase tracking-wider">Average OVR</span>
                        <div className="flex items-center gap-2">
                          {teamComparisonAnalysis.advantage > 0 && <TrendingUp className="text-brand-500" size={14} />}
                          <span className={`text-3xl font-bold ${
                            teamComparisonAnalysis.advantage > 0 ? 'text-brand-500' : 'text-slate-600'
                          }`}>
                            {teamComparisonAnalysis.avgA}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top 5 players */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-600 text-xs uppercase tracking-wider mb-2">Top 5 Players</p>
                      {teamComparisonAnalysis.teamAPlayers
                        .sort((a, b) => b.ovr - a.ovr)
                        .slice(0, 5)
                        .map((p, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span className="text-slate-400">{p.name} ({p.position})</span>
                            <span className="text-white font-medium">{p.ovr}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-6">
                    <h4 className="text-blue-500 font-bold mb-4 text-lg">{teamB?.name}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-xs">Unit Type</span>
                        <span className="text-white font-medium text-sm">
                          {teamComparisonType === 'offense-vs-defense' ? 'Defense' : teamComparisonType === 'offense-vs-offense' ? 'Offense' : 'Defense'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 text-xs">Players</span>
                        <span className="text-white font-medium text-sm">{teamComparisonAnalysis.teamBPlayers.length}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                        <span className="text-slate-600 text-xs uppercase tracking-wider">Average OVR</span>
                        <div className="flex items-center gap-2">
                          {teamComparisonAnalysis.advantage < 0 && <TrendingUp className="text-brand-500" size={14} />}
                          <span className={`text-3xl font-bold ${
                            teamComparisonAnalysis.advantage < 0 ? 'text-brand-500' : 'text-slate-600'
                          }`}>
                            {teamComparisonAnalysis.avgB}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top 5 players */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-600 text-xs uppercase tracking-wider mb-2">Top 5 Players</p>
                      {teamComparisonAnalysis.teamBPlayers
                        .sort((a, b) => b.ovr - a.ovr)
                        .slice(0, 5)
                        .map((p, idx) => (
                          <div key={idx} className="flex justify-between text-sm py-1">
                            <span className="text-slate-400">{p.name} ({p.position})</span>
                            <span className="text-white font-medium">{p.ovr}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Winner */}
                <div className="bg-slate-800/80 rounded-lg p-6 text-center">
                  <p className="text-slate-600 text-xs uppercase tracking-wider mb-2">Matchup Advantage</p>
                  <p className="text-3xl font-display font-bold text-brand-500 mb-2">
                    {teamComparisonAnalysis.winner}
                  </p>
                  {teamComparisonAnalysis.advantage !== 0 && (
                    <p className="text-slate-600 text-sm">
                      +{Math.abs(teamComparisonAnalysis.advantage)} average OVR
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

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
