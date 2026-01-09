import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, UserCircle, Palette, Moon, Sun, ChevronDown, MessageCircle, Info, Shield } from 'lucide-react';

const THEME_STORAGE_KEY = 'fanleague_theme_preference';
const MY_TEAM_STORAGE_KEY = 'fanleague_my_team';
const MESSAGE_PREFS_STORAGE_KEY = 'fanleague_message_preferences';

interface MessagePreferences {
  rememberUsername: boolean;
  autoScroll: boolean;
  relativeTimestamps: boolean;
}

export const Settings: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [myTeamName, setMyTeamName] = useState('');
  const [messagePrefs, setMessagePrefs] = useState<MessagePreferences>({
    rememberUsername: true,
    autoScroll: true,
    relativeTimestamps: true,
  });

  // Mobile collapsible sections (only used on mobile)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    myTeam: true,
    appearance: false,
    messageBoard: false,
    about: false,
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

    // Load My Team name
    const savedTeamName = localStorage.getItem(MY_TEAM_STORAGE_KEY);
    if (savedTeamName) {
      setMyTeamName(savedTeamName);
    }

    // Load Message Board preferences
    const savedPrefs = localStorage.getItem(MESSAGE_PREFS_STORAGE_KEY);
    if (savedPrefs) {
      setMessagePrefs(JSON.parse(savedPrefs));
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

  const handleMyTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMyTeamName(value);
    localStorage.setItem(MY_TEAM_STORAGE_KEY, value);
  };

  const handleMessagePrefChange = (key: keyof MessagePreferences, value: boolean) => {
    const newPrefs = { ...messagePrefs, [key]: value };
    setMessagePrefs(newPrefs);
    localStorage.setItem(MESSAGE_PREFS_STORAGE_KEY, JSON.stringify(newPrefs));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <SettingsIcon />
        SETTINGS
      </h1>

      <div className="space-y-6">
        {/* My Team Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('myTeam')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <UserCircle size={20} />
              MY TEAM
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.myTeam ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.myTeam ? 'block' : 'hidden md:block'} px-6 pb-6`}>
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Team Name</label>
              <input
                type="text"
                value={myTeamName}
                onChange={handleMyTeamChange}
                placeholder="Enter your team name"
                className="w-full px-4 py-3 md:py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 min-h-[44px] touch-manipulation"
                maxLength={50}
              />
            </div>
            <p className="text-slate-500 text-sm flex items-start gap-2">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              <span>This team will be used as your default context across FanLeague.</span>
            </p>
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

        {/* Message Board Preferences */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('messageBoard')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <MessageCircle size={20} />
              MESSAGE BOARD
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.messageBoard ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.messageBoard ? 'block' : 'hidden md:block'} px-6 pb-6 space-y-3`}>
            <label className="flex items-center justify-between cursor-pointer min-h-[44px] touch-manipulation">
              <span className="text-slate-300">Remember my username</span>
              <input
                type="checkbox"
                checked={messagePrefs.rememberUsername}
                onChange={(e) => handleMessagePrefChange('rememberUsername', e.target.checked)}
                className="w-6 h-6 md:w-5 md:h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer min-h-[44px] touch-manipulation">
              <span className="text-slate-300">Auto-scroll to new messages</span>
              <input
                type="checkbox"
                checked={messagePrefs.autoScroll}
                onChange={(e) => handleMessagePrefChange('autoScroll', e.target.checked)}
                className="w-6 h-6 md:w-5 md:h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer min-h-[44px] touch-manipulation">
              <span className="text-slate-300">Show relative timestamps</span>
              <input
                type="checkbox"
                checked={messagePrefs.relativeTimestamps}
                onChange={(e) => handleMessagePrefChange('relativeTimestamps', e.target.checked)}
                className="w-6 h-6 md:w-5 md:h-5 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
          <button
            onClick={() => toggleSection('about')}
            className="w-full p-6 md:cursor-default flex items-center justify-between md:pointer-events-none"
          >
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Info size={20} />
              ABOUT
            </h2>
            <ChevronDown
              size={24}
              className={`md:hidden text-slate-400 transition-transform ${
                expandedSections.about ? 'rotate-180' : ''
              }`}
            />
          </button>
          <div className={`${expandedSections.about ? 'block' : 'hidden md:block'} px-6 pb-6 space-y-3`}>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">Version</span>
              <span className="text-white font-medium">2.5.0</span>
            </div>
            <div className="border-t border-slate-700 pt-3 space-y-2">
              <a
                href="#"
                className="block text-slate-300 hover:text-brand-500 transition-colors py-2"
                onClick={(e) => e.preventDefault()}
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="block text-slate-300 hover:text-brand-500 transition-colors py-2"
                onClick={(e) => e.preventDefault()}
              >
                Terms of Service
              </a>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs text-center">
                © 2025 FanLeague. Where the Best GM Meets Madden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
