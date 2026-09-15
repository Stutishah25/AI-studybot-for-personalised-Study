import React from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  BarChart3, 
  Flame, 
  Clock, 
  Target, 
  Award, 
  TrendingUp, 
  Calendar,
  Layers,
  Brain
} from 'lucide-react';

interface AnalyticsViewProps {
  onNavigate: (route: NavRoute) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const { streak, studyHours, subjects } = useStudy();

  const weeklyHours = [
    { day: 'Mon', hours: 3.2 },
    { day: 'Tue', hours: 2.8 },
    { day: 'Wed', hours: 4.1 },
    { day: 'Thu', hours: 1.5 },
    { day: 'Fri', hours: 3.5 },
    { day: 'Sat', hours: 2.4 },
    { day: 'Sun', hours: 1.0 }
  ];

  const maxWeeklyHours = Math.max(...weeklyHours.map(d => d.hours));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> COGNITIVE RETENTION ANALYTICS
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Performance Diagnostic & Study Telemetry
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Quantified metrics on study pace, memory retention efficiency, and subject coverage.
        </p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Study Streak</span>
          </div>
          <span className="text-3xl font-black text-amber-400">{streak} Days</span>
          <span className="block text-[10px] text-slate-400">Consistency score: 94%</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Total Hours</span>
          </div>
          <span className="text-3xl font-black text-cyan-300">{studyHours} hrs</span>
          <span className="block text-[10px] text-slate-400">This semester</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Quiz Accuracy</span>
          </div>
          <span className="text-3xl font-black text-emerald-400">78%</span>
          <span className="block text-[10px] text-slate-400">+6% increase</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Award className="w-4 h-4 text-violet-400" />
            <span>Mastered Concepts</span>
          </div>
          <span className="text-3xl font-black text-violet-300">14 Topics</span>
          <span className="block text-[10px] text-slate-400">Validated via recall</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Hours Bar Chart */}
        <div className="p-6 rounded-2xl bg-[#12182a] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Weekly Study Rhythm
            </h3>
            <span className="text-xs font-mono text-cyan-300 font-bold">18.5 hrs logged</span>
          </div>

          {/* Clean Custom Bar Chart */}
          <div className="pt-6 flex items-end justify-between gap-3 h-44 border-b border-slate-800 pb-2">
            {weeklyHours.map(d => {
              const heightPercent = Math.round((d.hours / maxWeeklyHours) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-300 transition-colors">
                    {d.hours}h
                  </span>
                  <div className="w-full bg-[#162038] rounded-t-lg overflow-hidden h-28 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-cyan-400 group-hover:brightness-125 transition-all rounded-t-lg"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono text-slate-300 font-semibold">{d.day}</span>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Peak cognitive focus happens midweek (Wednesday 4.1h). Saturday & Sunday are light revision sessions.
          </p>
        </div>

        {/* Subject Mastery Distribution */}
        <div className="p-6 rounded-2xl bg-[#12182a] border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" /> Subject Coverage & Progress
            </h3>
            <span className="text-xs font-mono text-slate-400">5 Registered Subjects</span>
          </div>

          <div className="space-y-4 pt-2">
            {subjects.map(s => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{s.name}</span>
                  <span className="font-mono text-cyan-300 font-bold">{s.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                    style={{ width: `${s.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Data Structures & Algorithms has the highest velocity, while Computer Networks has the upcoming exam in 8 days.
          </p>
        </div>
      </div>
    </div>
  );
};
