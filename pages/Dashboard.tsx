import React from 'react';
import { Page } from '../types';
import { ALL_TEAMS } from '../constants';
import { TrendingUp, Users, Trophy, Search, GitCompare, Award, ArrowRight } from 'lucide-react';
import { TeamLogo } from '../components/TeamLogo';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-4">
        DASHBOARD
      </h1>

      {/* Intro */}
      <p className="text-slate-300 text-lg mb-8 max-w-3xl">
        Welcome to <span className="text-brand-500 font-bold">FanLeague</span> — a premium fantasy football platform
        powered by <span className="text-brand-500 font-semibold">Madden NFL ratings and attributes</span>.
        Manage your franchise, track player performance, analyze draft success, and compete in a league
        where player value is driven by real Madden game data.
      </p>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 mb-8">
        <h2 className="text-xl font-display font-bold text-white mb-4">QUICK ACTIONS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate(Page.PLAYERS)}
            className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Search className="text-brand-500" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">Browse Players</p>
                <p className="text-slate-400 text-sm">Search & filter all players</p>
              </div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-brand-500 transition-colors" size={20} />
          </button>

          <button
            onClick={() => onNavigate(Page.COMPARISON)}
            className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <GitCompare className="text-brand-500" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">Compare Players</p>
                <p className="text-slate-400 text-sm">Side-by-side analysis</p>
              </div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-brand-500 transition-colors" size={20} />
          </button>

          <button
            onClick={() => onNavigate(Page.STANDINGS)}
            className="flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-brand-500 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-500/20 rounded-lg">
                <Award className="text-brand-500" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white font-bold">View Standings</p>
                <p className="text-slate-400 text-sm">Check league rankings</p>
              </div>
            </div>
            <ArrowRight className="text-slate-600 group-hover:text-brand-500 transition-colors" size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 rounded-lg">
              <Users className="text-brand-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Teams</p>
              <p className="text-2xl font-bold text-white">{ALL_TEAMS.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 rounded-lg">
              <TrendingUp className="text-brand-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Players</p>
              <p className="text-2xl font-bold text-white">
                {ALL_TEAMS.reduce((sum, team) => sum + team.roster.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-500/20 rounded-lg">
              <Trophy className="text-brand-500" size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Season</p>
              <p className="text-2xl font-bold text-white">2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Overview */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-2xl font-display font-bold text-white mb-6">LEAGUE TEAMS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_TEAMS.map((team) => (
            <div
              key={team.id}
              className="bg-slate-900 rounded-lg p-4 border border-slate-700 hover:border-brand-500 transition-colors cursor-pointer"
              onClick={() => onNavigate(Page.TEAMS)}
            >
              <div className="flex items-center gap-3 mb-2">
                <TeamLogo
                  src={team.avatarUrl}
                  alt={team.name}
                  size="lg"
                />
                <div>
                  <h3 className="font-bold text-white">{team.name}</h3>
                  <p className="text-sm text-slate-400">{team.owner}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Record:</span>
                <span className="text-white font-medium">{team.record}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Roster:</span>
                <span className="text-white font-medium">{team.roster.length} players</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
