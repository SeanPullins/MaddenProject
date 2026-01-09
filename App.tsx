import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Franchise } from './pages/Franchise';
import { MyTeam } from './pages/MyTeam';
import { LeagueTeams } from './pages/LeagueTeams';
import { MessageBoard } from './pages/MessageBoard';
import { Players } from './pages/Players';
import { Standings } from './pages/Standings';
import { PlayerComparison } from './pages/PlayerComparison';
import { Drafts } from './pages/Drafts';
import { HitRates } from './pages/HitRates'; // Added
import { Settings } from './pages/Settings';
import { Page } from './types';
import { Loader2 } from 'lucide-react';
import { CRUISE_SHIP_CRUSADERS } from './constants';

const THEME_STORAGE_KEY = 'fanleague_theme_preference';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LANDING);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
        console.log("UI complete. Data loaded.");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Apply theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light' | null;
    const theme = savedTheme || 'dark';

    // Use data-theme attribute for CSS variable-based theming
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case Page.LANDING: return <Landing onNavigate={setCurrentPage} />;
      case Page.DASHBOARD: return <Dashboard onNavigate={setCurrentPage} />;
      case Page.MESSAGE_BOARD: return <MessageBoard />;
      case Page.TEAMS: return <LeagueTeams onNavigate={setCurrentPage} />;
      case Page.MY_TEAM: return <MyTeam />;
      case Page.PLAYERS: return <Players />;
      case Page.DRAFTS: return <Drafts />;
      case Page.HIT_RATES: return <HitRates />; // Added
      case Page.STANDINGS: return <Standings />;
      case Page.COMPARISON: return <PlayerComparison />;
      case Page.SETTINGS: return <Settings />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  if (isLoading) {
      return (
          <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
              <p className="font-display tracking-widest text-sm">LOADING FANTASY SHELL...</p>
          </div>
      );
  }

  // Landing page has its own layout without navigation
  if (currentPage === Page.LANDING) {
    return renderPage();
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative pt-16 lg:pt-0 pb-20 lg:pb-0">
        {/* Top Fade for aesthetics */}
        <div className="sticky top-0 z-30 h-8 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none lg:hidden" />

        {renderPage()}

      </main>
    </div>
  );
};

export default App;