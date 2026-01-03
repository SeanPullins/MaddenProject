import React from 'react';
import { Page } from '../types';
import { ALL_TEAMS } from '../constants';
import { TrendingUp, Users, Trophy } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8">
        DASHBOARD
      </h1>

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
                <img
                  src={team.avatarUrl}
                  alt={team.name}
                  className="w-12 h-12 rounded-full"
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
