import React, { useState } from 'react';
import { ALL_TEAMS } from '../constants';
import { Team, Player } from '../types';
import { TeamLogo } from '../components/TeamLogo';
import { Sparkles, TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';

const OFFENSIVE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL', 'OT', 'OG', 'C'];
const DEFENSIVE_POSITIONS = ['ED', 'DT', 'LB', 'CB', 'S'];

export const AIEvaluation: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team>(ALL_TEAMS[0]);
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
    const offensivePlayers = getOffensivePlayers(team);
    const defensivePlayers = getDefensivePlayers(team);

    const offenseByPosition: { [key: string]: Player[] } = {};
    offensivePlayers.forEach(player => {
      if (!offenseByPosition[player.position]) {
        offenseByPosition[player.position] = [];
      }
      offenseByPosition[player.position].push(player);
    });

    const defenseByPosition: { [key: string]: Player[] } = {};
    defensivePlayers.forEach(player => {
      if (!defenseByPosition[player.position]) {
        defenseByPosition[player.position] = [];
      }
      defenseByPosition[player.position].push(player);
    });

    const offenseText = Object.entries(offenseByPosition)
      .map(([pos, players]) => {
        const playerList = players.map(p => `${p.name} (${p.ovr})`).join(', ');
        return `${pos}: ${playerList}`;
      })
      .join('\n');

    const defenseText = Object.entries(defenseByPosition)
      .map(([pos, players]) => {
        const playerList = players.map(p => `${p.name} (${p.ovr})`).join(', ');
        return `${pos}: ${playerList}`;
      })
      .join('\n');

    return `You are an expert Madden NFL fantasy football analyst. Analyze the following team and provide detailed strategic insights.

Team: ${team.name}
Owner: ${team.owner}
Record: ${team.record}

OFFENSIVE ROSTER:
${offenseText}

DEFENSIVE ROSTER:
${defenseText}

Please provide a comprehensive analysis in the following format:

## Roster Overview
[Provide a high-level summary of the team's composition, strengths, and weaknesses]

## Strengths
[List and explain 3-5 key strengths of this roster]

## Weaknesses
[List and explain 3-5 key weaknesses or areas of concern]

## Draft / Trade Suggestions
[Provide specific recommendations for positions to target in the draft or via trade]

## Immediate Actions
[List 3-5 specific, actionable steps the owner should take to improve this team]

Focus on Madden ratings (OVR), positional depth, and strategic fit. Be specific and actionable.`;
  };

  const runAIEvaluation = async () => {
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();

      if (!data.text) {
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
    const sections = {
      overview: '',
      strengths: '',
      weaknesses: '',
      suggestions: '',
      actions: '',
    };

    // Simple parser - split by headers
    const overviewMatch = response.match(/## Roster Overview\s*([\s\S]*?)(?=##|$)/);
    const strengthsMatch = response.match(/## Strengths\s*([\s\S]*?)(?=##|$)/);
    const weaknessesMatch = response.match(/## Weaknesses\s*([\s\S]*?)(?=##|$)/);
    const suggestionsMatch = response.match(/## Draft \/ Trade Suggestions\s*([\s\S]*?)(?=##|$)/);
    const actionsMatch = response.match(/## Immediate Actions\s*([\s\S]*?)(?=##|$)/);

    if (overviewMatch) sections.overview = overviewMatch[1].trim();
    if (strengthsMatch) sections.strengths = strengthsMatch[1].trim();
    if (weaknessesMatch) sections.weaknesses = weaknessesMatch[1].trim();
    if (suggestionsMatch) sections.suggestions = suggestionsMatch[1].trim();
    if (actionsMatch) sections.actions = actionsMatch[1].trim();

    return sections;
  };

  const sections = aiResponse ? parseAIResponse(aiResponse) : null;

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
            onChange={(e) => {
              const team = ALL_TEAMS.find(t => t.id === e.target.value);
              if (team) setSelectedTeam(team);
            }}
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
