import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  LogIn,
  Settings,
  Trash2,
  Crown,
  Copy,
  Check,
  Shield,
  Calendar,
  Trophy
} from 'lucide-react';
import { League, LeagueRules, Page } from '../types';
import { ALL_TEAMS } from '../constants';
import {
  getLeagues,
  saveLeague,
  deleteLeague,
  setCurrentLeagueId,
  getCurrentLeagueId,
  generateInviteCode,
  findLeagueByInviteCode,
  getGMProfile,
  createDefaultGMProfile,
} from '../utils/leagueStorage';

interface LeagueHubProps {
  onNavigate: (page: Page) => void;
}

export const LeagueHub: React.FC<LeagueHubProps> = ({ onNavigate }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [currentLeagueId, setCurrentLeagueIdState] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Create League Form
  const [leagueName, setLeagueName] = useState('');
  const [maxTeams, setMaxTeams] = useState(8);
  const [draftRounds, setDraftRounds] = useState(7);
  const [timerPerPick, setTimerPerPick] = useState(90);

  // Join League Form
  const [inviteCode, setInviteCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    loadLeagues();
    const currentId = getCurrentLeagueId();
    setCurrentLeagueIdState(currentId);
  }, []);

  const loadLeagues = () => {
    const loadedLeagues = getLeagues();
    setLeagues(loadedLeagues);
  };

  const handleCreateLeague = () => {
    if (!leagueName.trim()) {
      alert('Please enter a league name');
      return;
    }

    // Get or create GM profile
    let gmProfile = getGMProfile();
    if (!gmProfile) {
      gmProfile = createDefaultGMProfile();
    }

    const newLeague: League = {
      id: `league-${Date.now()}`,
      name: leagueName,
      commissionerId: gmProfile.id,
      teams: [], // Start empty, teams will join
      draftState: null,
      trades: [],
      chat: [],
      rules: {
        maxTeams,
        draftRounds,
        timerPerPick,
        draftType: 'snake',
        rosterSize: 53,
        practiceSquadSize: 16,
      },
      createdAt: new Date().toISOString(),
      season: 2025,
      inviteCode: generateInviteCode(),
    };

    saveLeague(newLeague);
    setCurrentLeagueId(newLeague.id);
    setCurrentLeagueIdState(newLeague.id);
    loadLeagues();

    // Reset form
    setLeagueName('');
    setShowCreateModal(false);

    alert(`League created! Share invite code: ${newLeague.inviteCode}`);
  };

  const handleJoinLeague = () => {
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }

    const league = findLeagueByInviteCode(inviteCode.toUpperCase());
    if (!league) {
      setJoinError('Invalid invite code');
      return;
    }

    if (league.teams.length >= league.rules.maxTeams) {
      setJoinError('League is full');
      return;
    }

    // Set as current league
    setCurrentLeagueId(league.id);
    setCurrentLeagueIdState(league.id);
    loadLeagues();

    // Reset form
    setInviteCode('');
    setJoinError('');
    setShowJoinModal(false);

    alert(`Joined league: ${league.name}`);
  };

  const handleDeleteLeague = (leagueId: string) => {
    if (confirm('Are you sure you want to delete this league? This cannot be undone.')) {
      deleteLeague(leagueId);
      if (currentLeagueId === leagueId) {
        setCurrentLeagueIdState(null);
      }
      loadLeagues();
    }
  };

  const handleSetCurrentLeague = (leagueId: string) => {
    setCurrentLeagueId(leagueId);
    setCurrentLeagueIdState(leagueId);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
          <Users className="text-brand-500" size={36} />
          LEAGUE HUB
        </h1>
        <p className="text-slate-400 text-lg">
          Create or join multiplayer leagues. Manage your franchises and compete with other GMs.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors"
        >
          <Plus size={24} />
          Create New League
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 text-white font-bold rounded-lg transition-colors"
        >
          <LogIn size={24} />
          Join with Invite Code
        </button>
      </div>

      {/* Leagues List */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-display font-bold text-white">YOUR LEAGUES</h2>
          <p className="text-slate-400 text-sm mt-1">
            {leagues.length} {leagues.length === 1 ? 'league' : 'leagues'}
          </p>
        </div>

        {leagues.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="text-slate-600 mx-auto mb-4" size={64} />
            <p className="text-slate-400 text-lg mb-2">No leagues yet</p>
            <p className="text-slate-500 text-sm">
              Create a new league or join one with an invite code to get started
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {leagues.map((league) => {
              const isCurrentLeague = currentLeagueId === league.id;
              const gmProfile = getGMProfile();
              const isCommissioner = gmProfile?.id === league.commissionerId;

              return (
                <div
                  key={league.id}
                  className={`p-6 hover:bg-slate-700/30 transition-colors ${
                    isCurrentLeague ? 'bg-brand-500/10 border-l-4 border-brand-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{league.name}</h3>
                        {isCommissioner && (
                          <Crown className="text-yellow-500" size={20} title="Commissioner" />
                        )}
                        {isCurrentLeague && (
                          <span className="px-2 py-0.5 bg-brand-500 text-white text-xs font-bold rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users size={14} />
                          <span>
                            {league.teams.length}/{league.rules.maxTeams} Teams
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={14} />
                          <span>Created {formatDate(league.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Trophy size={14} />
                          <span>Season {league.season}</span>
                        </div>
                      </div>
                    </div>

                    {!isCurrentLeague && (
                      <button
                        onClick={() => handleSetCurrentLeague(league.id)}
                        className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold rounded transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  {/* League Details */}
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Draft Type</p>
                        <p className="text-white font-medium capitalize">
                          {league.rules.draftType}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Draft Rounds</p>
                        <p className="text-white font-medium">{league.rules.draftRounds}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Pick Timer</p>
                        <p className="text-white font-medium">{league.rules.timerPerPick}s</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Roster Size</p>
                        <p className="text-white font-medium">{league.rules.rosterSize}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invite Code */}
                  {league.inviteCode && (
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-slate-500" />
                        <span className="text-slate-400 text-sm">Invite Code:</span>
                        <code className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-brand-400 font-mono font-bold">
                          {league.inviteCode}
                        </code>
                      </div>
                      <button
                        onClick={() => copyInviteCode(league.inviteCode!)}
                        className="flex items-center gap-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                      >
                        {copiedCode === league.inviteCode ? (
                          <>
                            <Check size={14} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {isCommissioner && (
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
                      >
                        <Settings size={16} />
                        League Settings
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLeague(league.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium rounded transition-colors border border-red-500/30"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create League Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full border-2 border-brand-500">
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Plus size={24} />
                  Create New League
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">League Name</label>
                  <input
                    type="text"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    placeholder="Enter league name..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Max Teams</label>
                  <select
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  >
                    {[4, 6, 8, 10, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} Teams
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Draft Rounds</label>
                  <select
                    value={draftRounds}
                    onChange={(e) => setDraftRounds(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  >
                    {[5, 7, 10, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} Rounds
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Timer Per Pick</label>
                  <select
                    value={timerPerPick}
                    onChange={(e) => setTimerPerPick(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={90}>90 seconds</option>
                    <option value={120}>2 minutes</option>
                    <option value={180}>3 minutes</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateLeague}
                    className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Create League
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Join League Modal */}
      {showJoinModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowJoinModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-lg shadow-2xl max-w-md w-full border-2 border-brand-500">
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <LogIn size={24} />
                  Join League
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Invite Code</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(e.target.value.toUpperCase());
                      setJoinError('');
                    }}
                    placeholder="Enter 6-character code..."
                    maxLength={6}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:outline-none focus:border-brand-500"
                  />
                  {joinError && (
                    <p className="text-red-400 text-sm mt-2">{joinError}</p>
                  )}
                </div>

                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">
                    <strong className="text-white">Tip:</strong> Ask the league commissioner for the 6-character invite code. It looks like "ABC123".
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleJoinLeague}
                    className="flex-1 px-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Join League
                  </button>
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinError('');
                    }}
                    className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
