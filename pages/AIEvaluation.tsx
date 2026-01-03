import React, { useState } from 'react';
import { ALL_TEAMS } from '../constants';
import { Player } from '../types';
import { Sparkles, Loader2 } from 'lucide-react';

export const AIEvaluation: React.FC = () => {
  const allPlayers: Player[] = ALL_TEAMS.flatMap((team) => team.roster);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(allPlayers[0] || null);
  const [evaluation, setEvaluation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = async () => {
    if (!selectedPlayer) return;

    setIsLoading(true);
    setEvaluation('');

    // Simulate AI evaluation (replace with actual Gemini API call when ready)
    setTimeout(() => {
      const mockEvaluation = `
**${selectedPlayer.name} - ${selectedPlayer.position} Analysis**

**Overall Assessment:** ${selectedPlayer.ovr}/100

**Strengths:**
- Strong overall rating of ${selectedPlayer.ovr} indicates elite performance potential
- Drafted in ${selectedPlayer.draftRound}, showing good value
- Currently playing for ${selectedPlayer.team}

**Position Outlook:**
As a ${selectedPlayer.position}, this player fills a critical role in the franchise. The depth order of ${selectedPlayer.depthOrder} suggests ${
        selectedPlayer.depthOrder === 1 ? 'starter status' : 'backup/developmental role'
      }.

**Contract Status:**
Free agency expected in ${selectedPlayer.faYear}. Consider extension negotiations if performance warrants.

**Recommendation:**
${
  selectedPlayer.ovr >= 90
    ? 'Elite franchise cornerstone. Build around this player.'
    : selectedPlayer.ovr >= 80
    ? 'High-quality starter with Pro Bowl potential.'
    : selectedPlayer.ovr >= 70
    ? 'Solid contributor with room for development.'
    : 'Developmental prospect or depth piece.'
}
      `.trim();

      setEvaluation(mockEvaluation);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
        <Sparkles className="text-brand-500" />
        AI PLAYER EVALUATION
      </h1>
      <p className="text-slate-400 mb-8">
        Get AI-powered insights and analysis on player performance and potential
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selection Panel */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-display font-bold text-white mb-4">SELECT PLAYER</h2>

          <select
            value={selectedPlayer?.id || ''}
            onChange={(e) => {
              const p = allPlayers.find((p) => p.id === e.target.value);
              if (p) setSelectedPlayer(p);
            }}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 mb-6"
          >
            {allPlayers
              .sort((a, b) => b.ovr - a.ovr)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.position} - OVR {p.ovr})
                </option>
              ))}
          </select>

          {selectedPlayer && (
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedPlayer.imageUrl}
                  alt={selectedPlayer.name}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                  <p className="text-slate-400">
                    {selectedPlayer.position} • {selectedPlayer.team}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-400">OVR:</span>{' '}
                  <span className="text-white font-bold">{selectedPlayer.ovr}</span>
                </div>
                <div>
                  <span className="text-slate-400">Draft:</span>{' '}
                  <span className="text-white">{selectedPlayer.draftRound}</span>
                </div>
                <div>
                  <span className="text-slate-400">FA Year:</span>{' '}
                  <span className="text-white">{selectedPlayer.faYear}</span>
                </div>
                <div>
                  <span className="text-slate-400">Depth:</span>{' '}
                  <span className="text-white">#{selectedPlayer.depthOrder}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleEvaluate}
            disabled={!selectedPlayer || isLoading}
            className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate AI Evaluation
              </>
            )}
          </button>

          <p className="text-slate-500 text-xs mt-3 text-center">
            Note: AI evaluation currently uses mock data. Gemini API integration coming soon.
          </p>
        </div>

        {/* Evaluation Results */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-display font-bold text-white mb-4">EVALUATION RESULTS</h2>

          {evaluation ? (
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-line">{evaluation}</div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Sparkles size={48} className="mb-4 opacity-50" />
              <p>Select a player and click "Generate AI Evaluation" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
