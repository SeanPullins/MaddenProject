import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <SettingsIcon />
        SETTINGS
      </h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <User size={20} />
            PROFILE
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Team Owner"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Email</label>
              <input
                type="email"
                defaultValue="owner@fanleague.com"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <Bell size={20} />
            NOTIFICATIONS
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Enable notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Trade alerts</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Draft reminders</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <Palette size={20} />
            APPEARANCE
          </h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Dark mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
                className="w-5 h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-display font-bold text-white mb-4 flex items-center gap-2">
            <Shield size={20} />
            PRIVACY & SECURITY
          </h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition-colors text-left">
              Change password
            </button>
            <button className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition-colors text-left">
              Manage API keys
            </button>
            <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-left">
              Delete account
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
