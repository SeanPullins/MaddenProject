import React, { useState } from 'react';
import { ALL_TEAMS } from '../constants';
import { Player } from '../types';

export const PlayerComparison: React.FC = () => {
  const allPlayers: Player[] = ALL_TEAMS.flatMap((team) => team.roster);
  const [player1, setPlayer1] = useState<Player | null>(allPlayers[0] || null);
  const [player2, setPlayer2] = useState<Player | null>(allPlayers[1] || null);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">PLAYER COMPARISON</h1>

      {/* Player Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <label className="block text-slate-400 text-sm mb-3">Player 1</label>
          <select
            value={player1?.id || ''}
            onChange={(e) => {
              const p = allPlayers.find((p) => p.id === e.target.value);
              if (p) setPlayer1(p);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
          >
            {allPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.position} - {p.ovr})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <label className="block text-slate-400 text-sm mb-3">Player 2</label>
          <select
            value={player2?.id || ''}
            onChange={(e) => {
              const p = allPlayers.find((p) => p.id === e.target.value);
              if (p) setPlayer2(p);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
          >
            {allPlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.position} - {p.ovr})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Display */}
      {player1 && player2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[player1, player2].map((player, index) => (
            <div
              key={player.id}
              className="bg-slate-800 rounded-lg p-6 border border-slate-700"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-20 h-20 rounded-full"
                />
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">{player.name}</h2>
                  <p className="text-slate-400">
                    {player.position} • {player.team}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Overall Rating</span>
                  <span className="text-2xl font-bold text-brand-500">{player.ovr}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Position</span>
                  <span className="text-white">{player.position}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">NFL Team</span>
                  <span className="text-white">{player.team}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Draft Round</span>
                  <span className="text-white">{player.draftRound}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Free Agency</span>
                  <span className="text-white">{player.faYear}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Depth Order</span>
                  <span className="text-white">#{player.depthOrder}</span>
                </div>
              </div>

              {player.attributes && player.attributes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-display font-bold text-white mb-3">ATTRIBUTES</h3>
                  <div className="space-y-2">
                    {player.attributes.map((attr, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-slate-400">{attr.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-900 rounded-full h-2">
                            <div
                              className="bg-brand-500 h-2 rounded-full"
                              style={{ width: `${(attr.value / 100) * 100}%` }}
                            />
                          </div>
                          <span className="text-white font-medium w-8">{attr.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Winner */}
      {player1 && player2 && (
        <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-slate-700 text-center">
          <p className="text-slate-400 mb-2">Higher Overall Rating</p>
          <p className="text-3xl font-display font-bold text-brand-500">
            {player1.ovr > player2.ovr
              ? player1.name
              : player2.ovr > player1.ovr
              ? player2.name
              : 'TIE'}
          </p>
        </div>
      )}
    </div>
  );
};
