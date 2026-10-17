import React from 'react';
import { NovaLogo } from './NovaLogo';
import { 
  Home, 
  BookOpen, 
  Sparkles, 
  FileText, 
  Network, 
  Zap, 
  Target, 
  HelpCircle, 
  Calendar, 
  Radar, 
  BarChart3, 
  Archive, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export type NavRoute = 
  | 'home'
  | 'subjects'
  | 'tutor'
  | 'notes'
  | 'mindmaps'
  | 'memory-lab'
  | 'recall'
  | 'quiz'
  | 'exam-mode'
  | 'revision-radar'
  | 'analytics'
  | 'vault'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems: Array<{
    id: NavRoute;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
  }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor', icon: Sparkles, badge: 'NOVA', badgeColor: 'bg-[#1C1811] text-[#E2C78E] border-[#C5A059]/40' },
    { id: 'notes', label: 'Notes Studio', icon: FileText },
    { id: 'mindmaps', label: 'Mind Maps', icon: Network, badge: 'Interactive', badgeColor: 'bg-teal-950/40 text-teal-300 border-teal-800/40' },
    { id: 'memory-lab', label: 'Memory Lab', icon: Zap },
    { id: 'recall', label: 'Recall Mode', icon: Target },
    { id: 'quiz', label: 'Smart Quiz', icon: HelpCircle },
    { id: 'exam-mode', label: 'Exam Mode', icon: Calendar, badge: 'Active', badgeColor: 'bg-[#1C1811] text-[#E2C78E] border-[#C5A059]/40' },
    { id: 'revision-radar', label: 'Revision Radar', icon: Radar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'vault', label: 'My Vault', icon: Archive }
  ];

  const handleSelect = (route: NavRoute) => {
    onNavigate(route);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#0B0D10] border-r border-[#2A2F37] flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header with Logo & Collapse Toggle */}
        <div className="h-16 px-4 border-b border-[#2A2F37] flex items-center justify-between">
          <div 
            onClick={() => handleSelect('home')} 
            className="cursor-pointer overflow-hidden whitespace-nowrap"
          >
            {isCollapsed ? (
              <NovaLogo size="sm" showSubtitle={false} />
            ) : (
              <NovaLogo size="md" showSubtitle={true} />
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#12151A] border border-transparent hover:border-[#2A2F37] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#161B22] text-[#E2C78E] border border-[#C5A059]/40 font-semibold shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#12151A] border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'text-[#C5A059]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Subtle active indicator pill in Muted Bronze */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#C5A059]"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User / Settings Menu */}
        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-[#090d16]">
          <button
            type="button"
            onClick={() => handleSelect('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentRoute === 'profile'
                ? 'bg-[#141c30] text-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111728]'
            }`}
            title={isCollapsed ? 'Profile' : undefined}
          >
            <User className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span className="truncate">Profile</span>}
          </button>

          <button
            type="button"
            onClick={() => handleSelect('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              currentRoute === 'settings'
                ? 'bg-[#141c30] text-cyan-300'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111728]'
            }`}
            title={isCollapsed ? 'Settings' : undefined}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            {!isCollapsed && <span className="truncate">Settings</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
