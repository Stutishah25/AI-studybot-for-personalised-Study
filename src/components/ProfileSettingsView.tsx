import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Settings, 
  RotateCcw, 
  Sparkles, 
  Check, 
  GraduationCap, 
  Brain, 
  Clock, 
  Calendar,
  BookOpen,
  LogOut,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onOpenOnboarding: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onOpenOnboarding }) => {
  const { profile, updateProfile, resetToDemoData, setIsSubjectModalOpen } = useStudy();
  const { user, logout, setIsAuthModalOpen, setAuthModalView } = useAuth();

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    resetToDemoData();
    setResetConfirm(false);
  };

  const handleRetakeOnboarding = async () => {
    await updateProfile({ onboarded: false });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/40 text-violet-300 text-xs font-mono mb-1.5">
            <User className="w-3.5 h-3.5" /> STUDENT PROFILE & PREFERENCES
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Personalization Settings
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            NOVA continuously tunes its pedagogical models to your degree, cognitive style, and exam horizons.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Manage Subjects</span>
          </button>
          <button
            type="button"
            onClick={handleRetakeOnboarding}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Retake Onboarding</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#12182a] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 p-[2px]">
              <div className="w-full h-full bg-[#0e1322] rounded-[14px] flex items-center justify-center font-bold text-2xl text-white">
                {(user?.name || profile.name).charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{user?.name || profile.name}</h2>
              <p className="text-sm text-cyan-300 font-medium">{profile.degree || 'Student'}</p>
              <span className="text-xs text-slate-400">{profile.yearSemester}</span>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              user?.isDemo
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            }`}>
              {user?.isDemo ? (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>Demo Mode</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Personal Account</span>
                </>
              )}
            </span>
            {user?.email && <p className="text-[11px] text-slate-400 mt-1">{user.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#161f36] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Brain className="w-3.5 h-3.5 text-violet-400" /> Learning Style
            </span>
            <span className="text-base font-bold text-white capitalize">
              {profile.preferredLearningStyle}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#161f36] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Daily Study Target
            </span>
            <span className="text-base font-bold text-white">
              {profile.dailyStudyTime}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#161f36] border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Enrolled Subjects
            </span>
            <span className="text-base font-bold text-white">
              {profile.subjects ? profile.subjects.length : 0} Subjects
            </span>
          </div>
        </div>

        {/* Difficulties Identified */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Targeted Study Challenges (NOVA Interventions Active)
          </span>
          <div className="flex flex-wrap gap-2">
            {(profile.studyDifficulties || []).map(diff => (
              <span
                key={diff}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#161f36] border border-cyan-500/30 text-cyan-200"
              >
                ✓ {diff.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Account & Session Controls */}
      <div className="p-6 rounded-2xl bg-[#12182a] border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" /> Account & Session Management
        </h3>
        
        {user?.isDemo ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-200">You are currently using the demo workspace.</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Sign up with your college email to save your own subjects, syllabus, notes, and revision progress permanently.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthModalView('signup');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 shadow-md"
            >
              Create My Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              Sign out of your active NOVA session on this device.
            </p>
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>

      {/* System Settings & Reset Card */}
      <div className="p-6 rounded-2xl bg-[#12182a] border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-slate-400" /> Demo State Reset
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Reset all progress, notes, and study plans to factory demo student state (Sample B.Tech Computer Engineering workspace).
        </p>

        {resetConfirm ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
            <p className="text-xs text-rose-200 font-semibold">
              Are you sure? This will reload the default sample curriculum.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs"
              >
                Yes, Reset Everything
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2 rounded-xl bg-[#161f36] hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 font-medium text-xs flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Demo Workspace
          </button>
        )}
      </div>
    </div>
  );
};
