import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { NovaLogo } from './NovaLogo';
import { StudyBuddyMascot } from './StudyBuddyMascot';
import { 
  Search, 
  Flame, 
  Menu, 
  ChevronDown,
  Timer,
  BookOpen,
  LogOut,
  User as UserIcon,
  Compass,
  Sparkles,
  Plus
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenCommandBar: () => void;
  onOpenFocusMode: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenCommandBar,
  onOpenFocusMode,
  onOpenProfile
}) => {
  const { profile, subjects, currentSubjectId, setCurrentSubjectId, streak, setIsSubjectModalOpen } = useStudy();
  const { user, isAuthenticated, setIsAuthModalOpen, setAuthModalView, logout } = useAuth();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#2A2F37] bg-[#0B0D10]/95 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#12151A] lg:hidden transition-colors border border-transparent hover:border-[#2A2F37]"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <NovaLogo size="sm" showSubtitle={false} />
        </div>
      </div>

      {/* Center: Global AI Command Bar Trigger */}
      <div className="flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenCommandBar}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#12151A] border border-[#2A2F37] hover:border-[#C5A059]/60 hover:bg-[#171B22] transition-all group text-left shadow-inner"
        >
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-200">
            <Search className="w-4 h-4 text-[#C5A059] group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Ask NOVA to teach, summarize, test or plan...
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[#1C222B] text-[10px] text-[#C5A059] font-mono border border-[#2A2F37]">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Subject Switcher, Streak, Focus Mode & Study Buddy */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subject Quick Selector & Add Subject */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="relative">
            <select
              value={currentSubjectId}
              onChange={e => setCurrentSubjectId(e.target.value)}
              aria-label="Select active study subject"
              className="appearance-none bg-[#12151A] border border-[#2A2F37] rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 hover:border-[#C5A059]/40 focus:outline-none focus:border-[#C5A059] cursor-pointer"
            >
              {subjects.length > 0 ? (
                subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.title}
                  </option>
                ))
              ) : (
                <option value="">No Subjects</option>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(true)}
            title="Manage Subjects & Syllabus"
            className="p-1.5 rounded-xl bg-[#12151A] border border-[#2A2F37] hover:border-[#C5A059]/50 text-slate-400 hover:text-[#C5A059] transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Study Momentum Streak Badge (Muted Bronze Accent) */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C1811] border border-[#C5A059]/40 text-[#E2C78E] text-xs font-semibold select-none shadow-sm"
          title={`${streak} Days Consecutive Study Streak!`}
        >
          <Flame className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
          <span className="font-mono">{streak}d</span>
        </div>

        {/* Focus Mode Button (Tactile Obsidian & Bronze) */}
        <button
          type="button"
          onClick={onOpenFocusMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#12151A] hover:bg-[#1A1F26] border border-[#C5A059]/40 hover:border-[#C5A059] text-[#E2C78E] hover:text-white text-xs font-medium transition-all shadow-sm"
          title="Enter Distraction-Free Study Sanctuary"
        >
          <Timer className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="hidden sm:inline">Focus Room</span>
        </button>

        {/* Friendly Mascot Badge */}
        <StudyBuddyMascot size="sm" showStatus={false} />

        {/* Auth / Profile Area */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setAuthModalView('login');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalView('signup');
                setIsAuthModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-sm"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-2">
              {user?.isDemo && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalView('signup');
                    setIsAuthModalOpen(true);
                  }}
                  className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium hover:bg-amber-500/20 transition-all"
                >
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>Demo Mode • Save Account</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#13192a] border border-transparent hover:border-slate-800 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm">
                  <div className="w-full h-full bg-[#0d1220] rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
                    {(user?.name || profile.name || 'S').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="hidden xl:flex flex-col">
                  <span className="text-xs font-semibold text-white leading-tight">
                    {user?.name || profile.name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {user?.isDemo ? 'Demo Workspace' : profile.degree || 'Student'}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-[#12182a] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-200 truncate">{user?.name || profile.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-cyan-400" />
                    <span>Profile & Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsSubjectModalOpen(true);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Manage Subjects & Syllabus</span>
                  </button>

                  {user?.isDemo ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setAuthModalView('signup');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Create Real Account</span>
                    </button>
                  ) : null}
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
