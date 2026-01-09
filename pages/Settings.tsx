import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Moon, Sun, ChevronDown } from 'lucide-react';

const THEME_STORAGE_KEY = 'fanleague_theme_preference';

export const Settings: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Mobile collapsible sections (only used on mobile)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profile: true,
    notifications: false,
    appearance: false,
    privacy: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: 'dark' | 'light') => {
    // Use data-theme attribute for CSS variable-based theming
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <SettingsIcon />
        SETTINGS
      </h1>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('profile')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <User size={20} />
              PROFILE
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.profile ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.profile ? 'block' : 'hidden md:block'} px-6 pb-6 space-y-4`}>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Team Owner"
                className="w-full px-4 py-3 md:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Email</label>
              <input
                type="email"
                defaultValue="owner@fanleague.com"
                className="w-full px-4 py-3 md:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('notifications')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Bell size={20} />
              NOTIFICATIONS
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.notifications ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.notifications ? 'block' : 'hidden md:block'} px-6 pb-6 space-y-3`}>
            <label className="flex items-center justify-between cursor-pointer min-h-[44px] touch-manipulation">
              <span className="text-slate-300">Enable notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-6 h-6 md:w-5 md:h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer min-h-[44px] touch-manipulation">
              <span className="text-slate-300">Trade alerts</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-6 h-6 md:w-5 md:h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer min-h-[44px] touch-manipulation">
              <span className="text-slate-300">Draft reminders</span>
              <input
                type="checkbox"
                defaultChecked
                className="w-6 h-6 md:w-5 md:h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('appearance')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Palette size={20} />
              APPEARANCE
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.appearance ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.appearance ? 'block' : 'hidden md:block'} px-6 pb-6 space-y-3`}>
            <label className="block text-slate-400 text-sm mb-3">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`flex items-center justify-center gap-2 px-4 py-4 md:py-3 rounded-lg border-2 transition-all min-h-[44px] touch-manipulation ${
                  theme === 'dark'
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 active:border-brand-500'
                }`}
              >
                <Moon size={18} />
                <span className="font-medium">Dark Mode</span>
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`flex items-center justify-center gap-2 px-4 py-4 md:py-3 rounded-lg border-2 transition-all min-h-[44px] touch-manipulation ${
                  theme === 'light'
                    ? 'bg-brand-500 border-brand-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600 active:border-brand-500'
                }`}
              >
                <Sun size={18} />
                <span className="font-medium">Light Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('privacy')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Shield size={20} />
              PRIVACY & SECURITY
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.privacy ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.privacy ? 'block' : 'hidden md:block'} px-6 pb-6 space-y-3`}>
            <button className="w-full px-4 py-3 md:py-2 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 text-white rounded-lg transition-colors text-left min-h-[44px] touch-manipulation">
              Change password
            </button>
            <button className="w-full px-4 py-3 md:py-2 bg-slate-900 hover:bg-slate-700 active:bg-slate-600 text-white rounded-lg transition-colors text-left min-h-[44px] touch-manipulation">
              Manage API keys
            </button>
            <button className="w-full px-4 py-3 md:py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg transition-colors text-left min-h-[44px] touch-manipulation">
              Delete account
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex flex-col md:flex-row justify-end gap-3">
          <button className="px-6 py-3 md:py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white rounded-lg transition-colors min-h-[44px] touch-manipulation">
            Cancel
          </button>
          <button className="px-6 py-3 md:py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-bold rounded-lg transition-colors min-h-[44px] touch-manipulation">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
