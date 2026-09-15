import React from 'react';
import { useStudy } from '../context/StudyContext';
import { NovaLogo } from './NovaLogo';
import { 
  Search, 
  Flame, 
  Clock, 
  Sparkles, 
  Menu, 
  ChevronDown,
  Timer
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
  const { profile, subjects, currentSubjectId, setCurrentSubjectId, streak } = useStudy();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#13192a] lg:hidden transition-colors"
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
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#111728] border border-slate-800/90 hover:border-cyan-500/50 hover:bg-[#141b2f] transition-all group text-left"
        >
          <div className="flex items-center gap-2.5 text-slate-400 group-hover:text-slate-200">
            <Search className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-medium truncate">
              Ask NOVA to teach, summarize, test or plan...
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">
              ⌘K
            </kbd>
          </div>
        </button>
      </div>

      {/* Right: Subject Switcher, Streak, Focus Mode & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Subject Quick Selector */}
        <div className="hidden md:flex items-center relative">
          <select
            value={currentSubjectId}
            onChange={e => setCurrentSubjectId(e.target.value)}
            aria-label="Select active study subject"
            className="appearance-none bg-[#13192a] border border-slate-800 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 hover:border-slate-700 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Study Momentum Streak Badge */}
        <div 
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold select-none"
          title={`${streak} Days Consecutive Study Streak!`}
        >
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
          <span>{streak}d</span>
        </div>

        {/* Focus Mode Button */}
        <button
          type="button"
          onClick={onOpenFocusMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-500/30 hover:from-violet-600/40 hover:to-cyan-500/40 border border-cyan-500/30 text-cyan-200 text-xs font-medium transition-all"
          title="Enter Distraction-Free Study Sanctuary"
        >
          <Timer className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Focus Room</span>
        </button>

        {/* Student Avatar / Profile Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#13192a] border border-transparent hover:border-slate-800 transition-all text-left"
          title="View Student Profile"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-sm">
            <div className="w-full h-full bg-[#0d1220] rounded-[10px] flex items-center justify-center font-bold text-xs text-white">
              {profile.name.charAt(0) || 'S'}
            </div>
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-white leading-tight">{profile.name}</span>
            <span className="text-[10px] text-slate-400 capitalize">{profile.preferredLearningStyle}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
