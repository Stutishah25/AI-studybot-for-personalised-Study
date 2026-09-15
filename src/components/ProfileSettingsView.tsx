import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  User, 
  Settings, 
  RotateCcw, 
  Sparkles, 
  Check, 
  GraduationCap, 
  Brain, 
  Clock, 
  Calendar 
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onOpenOnboarding: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onOpenOnboarding }) => {
  const { profile, updateProfile, resetToDemoData } = useStudy();

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    resetToDemoData();
    setResetConfirm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800/80 flex items-center justify-between">
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

        <button
          type="button"
          onClick={onOpenOnboarding}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors shadow-md"
        >
          Retake Onboarding Flow
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#12182a] border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 p-[2px]">
            <div className="w-full h-full bg-[#0e1322] rounded-[14px] flex items-center justify-center font-bold text-2xl text-white">
              {profile.name.charAt(0)}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{profile.name}</h2>
            <p className="text-sm text-cyan-300 font-medium">{profile.degree}</p>
            <span className="text-xs text-slate-400">{profile.yearSemester}</span>
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
              {profile.subjects.length} Subjects
            </span>
          </div>
        </div>

        {/* Difficulties Identified */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Targeted Study Challenges (NOVA Interventions Active)
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.studyDifficulties.map(diff => (
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

      {/* System Settings & Reset Card */}
      <div className="p-6 rounded-2xl bg-[#12182a] border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" /> System & Data Controls
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Reset all progress, notes, and study plans to factory demo student state (Stuti • B.Tech Computer Engineering).
        </p>

        {resetConfirm ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-3">
            <p className="text-xs text-rose-200 font-semibold">
              Are you sure? This will wipe locally modified notes and test scores.
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
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Demo Student Data
          </button>
        )}
      </div>
    </div>
  );
};
