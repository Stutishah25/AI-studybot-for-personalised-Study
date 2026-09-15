import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  Sparkles, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Brain, 
  Target, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  BookOpen, 
  Plus, 
  Play, 
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
  onOpenFocusMode: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenFocusMode }) => {
  const { 
    profile, 
    subjects, 
    studyPlan, 
    toggleStudyPlanItem, 
    addStudyPlanItem, 
    streak, 
    studyHours,
    revisionRadar
  } = useStudy();

  const [newPlanTime, setNewPlanTime] = useState('14:00');
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('25');
  const [showAddPlan, setShowAddPlan] = useState(false);

  // Derive time greeting (Morning, Afternoon, Evening)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const completedCount = studyPlan.filter(p => p.completed).length;
  const planProgress = studyPlan.length ? Math.round((completedCount / studyPlan.length) * 100) : 0;

  // Dynamically determine today's focus topic based on user's real topics and weak areas
  const focusTopic = React.useMemo(() => {
    // Check revision radar first
    if (revisionRadar && revisionRadar.length > 0) {
      const topRadar = revisionRadar[0];
      return {
        name: topRadar.topic,
        subject: topRadar.subject,
        submodule: topRadar.recommendedAction || 'Spaced Repetition Review',
        reason: topRadar.reason || `Retention estimated at ${topRadar.retentionEstimate}%. Reviewing now restores long-term memory.`,
        score: topRadar.retentionEstimate,
        badge: `Urgency: ${topRadar.urgency.toUpperCase()}`
      };
    }

    // Otherwise check lowest scored topic across subjects
    let candidate: { name: string; subject: string; score: number; diff: string } | null = null;
    for (const s of subjects) {
      if (!s.units) continue;
      for (const u of s.units) {
        for (const t of u.topics) {
          if (!candidate || t.quizScore < candidate.score) {
            candidate = {
              name: t.name,
              subject: s.name,
              score: t.quizScore,
              diff: t.difficulty || 'medium'
            };
          }
        }
      }
    }

    if (candidate) {
      return {
        name: candidate.name,
        subject: candidate.subject,
        submodule: 'Targeted Gap Closure',
        reason: `Your current recorded mastery is ${candidate.score}%. An active recall session will build lasting retention.`,
        score: candidate.score,
        badge: `Difficulty: ${candidate.diff.toUpperCase()}`
      };
    }

    const firstSubj = subjects[0];
    return {
      name: firstSubj?.name ? `${firstSubj.name} Foundations` : 'Core Concepts',
      subject: firstSubj?.name || 'My Courses',
      submodule: 'Active Learning Mode',
      reason: 'Build your initial mastery with active recall, flashcards, and mind maps.',
      score: 45,
      badge: 'Active Topic'
    };
  }, [revisionRadar, subjects]);

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    addStudyPlanItem({
      time: newPlanTime,
      title: newPlanTitle.trim(),
      durationMinutes: parseInt(newPlanDuration, 10) || 25,
      type: 'practice',
      topic: newPlanTitle.trim(),
      subject: subjects[0]?.name || 'General Studies'
    });
    setNewPlanTitle('');
    setShowAddPlan(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-800/50 text-violet-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>NOVA adapted your study plan based on your recent performance.</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {profile.name} 👋
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-normal">
            Let's make today's studying count.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenFocusMode}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-violet-950/50 flex items-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Focus Session</span>
          </button>
        </div>
      </div>

      {/* Primary Grid: Today's Focus & Study Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODAY'S FOCUS CARD (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12182c] via-[#141b33] to-[#11172a] border border-cyan-500/30 p-6 sm:p-7 shadow-xl">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                <Target className="w-4 h-4" /> TODAY'S FOCUS
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300">
                {focusTopic.badge}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {focusTopic.name}
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                {focusTopic.subject} • {focusTopic.submodule}
              </p>
            </div>

            {/* Why NOVA Recommends It Box */}
            <div className="p-4 rounded-xl bg-[#0c1120]/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Why NOVA recommends it:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {focusTopic.reason}
              </p>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#161f36]/70 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Est. Time</span>
                <span className="text-lg font-bold text-white">35 min</span>
              </div>
              <div className="p-3 rounded-xl bg-[#161f36]/70 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Current Mastery</span>
                <span className="text-lg font-bold text-amber-400">{focusTopic.score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#161f36]/70 border border-slate-800 text-center">
                <span className="block text-xs text-slate-400">Target Score</span>
                <span className="text-lg font-bold text-emerald-400">85%+</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('tutor', { topic: focusTopic.name, subject: focusTopic.subject })}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" /> Ask NOVA AI
              </button>
              <button
                type="button"
                onClick={() => onNavigate('mindmaps', { topic: focusTopic.name, subject: focusTopic.subject })}
                className="px-4 py-2 rounded-xl bg-[#1a233c] hover:bg-[#202c4b] border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" /> Open Mind Map
              </button>
              <button
                type="button"
                onClick={() => onNavigate('recall', { topic: focusTopic.name, subject: focusTopic.subject })}
                className="px-4 py-2 rounded-xl bg-[#1a233c] hover:bg-[#202c4b] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Target className="w-3.5 h-3.5" /> Take Recall Quiz
              </button>
              <button
                type="button"
                onClick={() => onNavigate('notes', { topic: focusTopic.name, subject: focusTopic.subject })}
                className="px-4 py-2 rounded-xl bg-[#1a233c] hover:bg-[#202c4b] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> Cheat Sheet
              </button>
            </div>
          </div>
        </div>

        {/* STUDY MOMENTUM CARD (1 Column) */}
        <div className="rounded-2xl bg-[#12182c] border border-slate-800/80 p-6 flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono tracking-widest text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" /> STUDY MOMENTUM
            </span>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              Active Pace
            </span>
          </div>

          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#161f36] border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Streak</span>
              </div>
              <span className="text-2xl font-black text-amber-400">{streak} Days</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Top 5% consistency</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161f36] border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Award className="w-3.5 h-3.5 text-violet-400" />
                <span>Mastered</span>
              </div>
              <span className="text-2xl font-black text-violet-300">14 Topics</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">+3 this week</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161f36] border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Study Hours</span>
              </div>
              <span className="text-2xl font-black text-cyan-300">{studyHours} hrs</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">Target: 20 hrs/wk</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#161f36] border border-slate-800/80">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quiz Accuracy</span>
              </div>
              <span className="text-2xl font-black text-emerald-400">78%</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">+6% vs last week</span>
            </div>
          </div>

          {/* Quick Motivational Booster */}
          <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-xs text-slate-300">
            <span className="text-violet-300 font-semibold block mb-0.5">Daily Goal Progress</span>
            <div className="w-full h-2 rounded-full bg-slate-800 mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${planProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{completedCount} of {studyPlan.length} sessions finished</span>
              <span className="font-mono text-cyan-300 font-bold">{planProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Today's Study Plan & AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODAY'S STUDY PLAN (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#12182c] border border-slate-800/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Today's Study Plan</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddPlan(!showAddPlan)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>

          {showAddPlan && (
            <form onSubmit={handleAddPlan} className="p-3.5 rounded-xl bg-[#182138] border border-slate-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Task Title (e.g. Practice Hash Tables)"
                  value={newPlanTitle}
                  onChange={e => setNewPlanTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-[#111728] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPlanTime}
                    onChange={e => setNewPlanTime(e.target.value)}
                    className="w-1/2 px-2 py-1.5 rounded-lg bg-[#111728] border border-slate-700 text-xs text-white"
                  />
                  <input
                    type="number"
                    value={newPlanDuration}
                    onChange={e => setNewPlanDuration(e.target.value)}
                    className="w-1/2 px-2 py-1.5 rounded-lg bg-[#111728] border border-slate-700 text-xs text-white"
                    placeholder="min"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPlan(false)}
                  className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Schedule List */}
          <div className="space-y-2.5">
            {studyPlan.map(item => (
              <div
                key={item.id}
                onClick={() => toggleStudyPlanItem(item.id)}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                  item.completed
                    ? 'bg-[#0f1424]/60 border-slate-800/60 opacity-60'
                    : 'bg-[#151c30] hover:bg-[#182138] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={item.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
                    className="text-slate-400 group-hover:text-cyan-400 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cyan-400">{item.time}</span>
                      <span className="text-slate-500 text-xs">—</span>
                      <span className={`text-sm font-semibold ${item.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.subject}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#0e1322] border border-slate-800 text-slate-300">
                    {item.durationMinutes} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI RECOMMENDATION & CONTINUE LEARNING (1 Column) */}
        <div className="space-y-6">
          {/* AI RECOMMENDATION CARD */}
          <div className="rounded-2xl bg-gradient-to-br from-[#161c33] to-[#12172a] border border-violet-500/40 p-5 space-y-3.5 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Study Recommendation</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "You've been getting questions on <strong className="text-cyan-300">AVL rotations wrong</strong>. Spend 15 minutes reviewing rotations before attempting another problem."
            </p>
            <button
              type="button"
              onClick={() => onNavigate('tutor', { topic: 'AVL Rotations', subject: 'Data Structures & Algorithms' })}
              className="w-full py-2 rounded-xl bg-violet-600/80 hover:bg-violet-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              Review Rotations Now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CONTINUE LEARNING CARD */}
          <div className="rounded-2xl bg-[#12182c] border border-slate-800/80 p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400" /> Continue Learning
              </span>
              <button
                type="button"
                onClick={() => onNavigate('subjects')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2">
              {subjects.slice(0, 3).map(subject => (
                <div
                  key={subject.id}
                  onClick={() => onNavigate('subjects', { subject: subject.name })}
                  className="p-3 rounded-xl bg-[#151c30] hover:bg-[#182138] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="truncate">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white block truncate">
                      {subject.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{subject.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${subject.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">{subject.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
