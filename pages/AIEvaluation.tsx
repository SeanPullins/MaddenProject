import React, { useMemo, useState } from 'react';
import { useTeams } from '../utils/rosterStore';
import { Team, Player } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';

const OFFENSIVE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C'];
const DEFENSIVE_POSITIONS = ['ED', 'DT', 'LB', 'CB', 'S'];

// Helper function to simplify roster data before sending to API
const simplifyRoster = (players: Player[]) => {
  if (!Array.isArray(players)) return "No roster data available.";
  return players.map(p => {
    const isStarter = p.depthOrder === 1 ? "(Starter)" : "";
    const isExtra = p.draftRound?.includes('$') ? "($)" : "";
    // ONLY send name, pos, ovr, and status. Drop everything else.
    return `${p.name}: ${p.position} - ${p.ovr} OVR ${isStarter} ${isExtra}`;
  }).join("\n");
};

export const AIEvaluation: React.FC = () => {
  const ALL_TEAMS = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(ALL_TEAMS[0]?.id ?? '');
  const selectedTeam = useMemo(
    () => ALL_TEAMS.find(team => team.id === selectedTeamId) ?? ALL_TEAMS[0],
    [ALL_TEAMS, selectedTeamId]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [error, setError] = useState<string>('');

  const getOffensivePlayers = (team: Team): Player[] => {
    return team.roster.filter(p => OFFENSIVE_POSITIONS.includes(p.position));
  };

  const getDefensivePlayers = (team: Team): Player[] => {
    return team.roster.filter(p => DEFENSIVE_POSITIONS.includes(p.position));
  };

  const buildPrompt = (team: Team): string => {
    // Use simplified roster data to reduce payload size
    const slimRoster = simplifyRoster(team.roster);

    return `Team: ${team.name} (${team.owner})

ROSTER:
${slimRoster}

Identify scoring opportunities for League Year Winner.`;
  };

  const runAIEvaluation = async () => {
    if (!selectedTeam) return;
    setIsLoading(true);
    setError('');
    setAiResponse('');

    try {
      const prompt = buildPrompt(selectedTeam);

      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        // Log response details for debugging
        const responseText = await response.text();
        console.error('Gemini function error response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });

        // Try to parse error message from JSON response
        let errorMessage = 'Failed to get AI response';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use the raw text
          errorMessage = responseText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.text) {
        console.error('Missing text in response:', data);
        throw new Error('No text content in AI response');
      }

      setAiResponse(data.text);
    } catch (err: any) {
      console.error('AI Evaluation error:', err);
      setError(err.message || 'Failed to generate AI evaluation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseAIResponse = (response: string) => {
    // Since we're getting brief bullet points, just return the raw response
    return {
      overview: response,
      strengths: '',
      weaknesses: '',
      suggestions: '',
      actions: '',
    };
  };

  const sections = aiResponse ? parseAIResponse(aiResponse) : null;

  if (!selectedTeam) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles className="text-brand-500" size={36} />
          AI TEAM EVALUATION
        </h1>
        <p className="text-slate-400 text-lg">
          Get AI-powered strategic insights and recommendations for your fantasy team
        </p>
      </div>

      {/* Team Selection */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-6">
        <label className="block text-slate-400 text-sm mb-3 font-medium">Select Team</label>
        <div className="flex items-center gap-4">
          <select
            value={selectedTeam.id}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 text-lg"
          >
            {ALL_TEAMS.map(team => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.owner})
              </option>
            ))}
          </select>
          <TeamLogo src={selectedTeam.avatarUrl} alt={selectedTeam.name} size="lg" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-slate-300">
            <span className="text-sm text-slate-400">Record:</span> <span className="font-bold">{selectedTeam.record}</span>
            <span className="mx-3 text-slate-600">•</span>
            <span className="text-sm text-slate-400">Roster:</span> <span className="font-bold">{selectedTeam.roster.length} players</span>
          </div>
        </div>
      </div>

      {/* AI Evaluation Button */}
      <div className="mb-6">
        <button
          onClick={runAIEvaluation}
          disabled={isLoading}
          className={`w-full px-6 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-3 text-lg ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Sparkles size={24} />
          {isLoading ? 'Analyzing team...' : 'Run AI Evaluation'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h3 className="text-white font-bold mb-1">Error</h3>
              <p className="text-slate-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Response Display */}
      {sections && (
        <div className="space-y-6">
          {/* Roster Overview */}
          {sections.overview && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-brand-500" size={24} />
                ROSTER OVERVIEW
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {sections.overview}
              </div>
            </div>
          )}

          {/* Strengths */}
          {sections.strengths && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-500" size={24} />
                STRENGTHS
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {sections.strengths}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {sections.weaknesses && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
                <TrendingDown className="text-red-500" size={24} />
                WEAKNESSES
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {sections.weaknesses}
              </div>
            </div>
          )}

          {/* Draft / Trade Suggestions */}
          {sections.suggestions && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-blue-500" size={24} />
                DRAFT / TRADE SUGGESTIONS
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {sections.suggestions}
              </div>
            </div>
          )}

          {/* Immediate Actions */}
          {sections.actions && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-display font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-yellow-500" size={24} />
                IMMEDIATE ACTIONS
              </h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {sections.actions}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!aiResponse && !isLoading && !error && (
        <div className="bg-slate-800/50 rounded-lg p-12 border border-slate-700 text-center">
          <Sparkles className="text-slate-600 mx-auto mb-4" size={48} />
          <p className="text-slate-400 text-lg mb-2">No evaluation yet</p>
          <p className="text-slate-500 text-sm">
            Select a team and click "Run AI Evaluation" to get strategic insights
          </p>
        </div>
      )}
    </div>
  );
};
