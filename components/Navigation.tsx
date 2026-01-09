import React from 'react';
import { Page } from '../types';
import { Menu, X, Home, Users, UserCircle, Trophy, GitCompare, FileText, TrendingUp, Settings, MessageCircle } from 'lucide-react';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const navItems = [
    { page: Page.DASHBOARD, label: 'Dashboard', icon: Home },
    { page: Page.TEAMS, label: 'Teams', icon: Users },
    { page: Page.MY_TEAM, label: 'My Team', icon: UserCircle },
    { page: Page.PLAYERS, label: 'Players', icon: Users },
    { page: Page.STANDINGS, label: 'Standings', icon: Trophy },
    { page: Page.COMPARISON, label: 'Compare', icon: GitCompare },
    { page: Page.DRAFTS, label: 'Drafts', icon: FileText },
    { page: Page.HIT_RATES, label: 'Hit Rates', icon: TrendingUp },
    { page: Page.MESSAGE_BOARD, label: 'Message Board', icon: MessageCircle },
    { page: Page.SETTINGS, label: 'Settings', icon: Settings },
  ];

  // Mobile bottom nav items (most important pages)
  const mobileBottomNavItems = [
    { page: Page.DASHBOARD, label: 'Home', icon: Home },
    { page: Page.MY_TEAM, label: 'My Team', icon: UserCircle },
    { page: Page.MESSAGE_BOARD, label: 'Board', icon: MessageCircle },
    { page: Page.SETTINGS, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation Sidebar */}
      <nav
        className={`
          fixed lg:relative top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800
          transform transition-transform duration-300 z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-brand-500">
              FANLEAGUE
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-sans normal-case tracking-normal">
              Where the Best GM Meets Madden
            </p>
          </div>

          <ul className="space-y-2">
            {navItems.map(({ page, label, icon: Icon }) => (
              <li key={page}>
                <button
                  onClick={() => {
                    onNavigate(page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      currentPage === page
                        ? 'bg-brand-500 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 safe-area-inset-bottom">
        <div className="grid grid-cols-4 h-16">
          {mobileBottomNavItems.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`
                flex flex-col items-center justify-center gap-1
                transition-colors duration-200
                min-h-[44px] touch-manipulation
                ${
                  currentPage === page
                    ? 'text-brand-500'
                    : 'text-slate-400 active:text-white'
                }
              `}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};
