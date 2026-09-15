import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  HelpCircle, 
  FileText, 
  Flame, 
  Target,
  RefreshCw
} from 'lucide-react';

interface ExamModeViewProps {
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({ onNavigate }) => {
  const { examPlan, updateExamPlan, currentSubject, subjects } = useStudy();

  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedExamIndex, setSelectedExamIndex] = useState(0);

  const upcomingExams = examPlan.upcomingExams || [
    { subject: examPlan.subject || 'Computer Networks & Architecture', date: 'In 8 days (Sept 23)', daysLeft: examPlan.daysLeft || 8 },
    { subject: 'Data Structures & Algorithms', date: 'In 14 days (Sept 29)', daysLeft: 14 },
    { subject: 'Database Management Systems', date: 'In 21 days (Oct 6)', daysLeft: 21 }
  ];

  const activeExam = upcomingExams[selectedExamIndex] || upcomingExams[0];

  const dailySchedule = examPlan.dailySchedule || (examPlan.revisionSchedule ? examPlan.revisionSchedule.map(r => ({
    day: r.dayNumber,
    focusArea: r.dateStr,
    targetHours: 2.5,
    tasks: r.tasks
  })) : []);

  const handleRegeneratePlan = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/ai/exam-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeExam.subject,
          daysLeft: activeExam.daysLeft,
          syllabus: 'Complete Units 1 to 5',
          weakTopics: ['AVL Trees', 'Subnetting', 'Transaction Isolation Levels']
        })
      });
      const data = await res.json();
      if (data.data) {
        updateExamPlan({
          ...examPlan,
          dailySchedule: data.data.dailySchedule || examPlan.dailySchedule,
          priorityTopics: data.data.priorityTopics || examPlan.priorityTopics
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono mb-1.5">
            <Calendar className="w-3.5 h-3.5" /> EXAM MODE & READINESS RADAR
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            High-Stakes Countdown & Revision Engine
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Dynamically structures your day-by-day study plan to maximize marks and eliminate last-minute cram panic.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRegeneratePlan}
          disabled={loadingSchedule}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingSchedule ? 'animate-spin' : ''}`} />
          <span>{loadingSchedule ? 'Optimizing Schedule...' : 'Re-optimize Schedule'}</span>
        </button>
      </div>

      {/* Countdown Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {upcomingExams.map((exam, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedExamIndex(idx)}
            className={`p-5 rounded-2xl border cursor-pointer transition-all ${
              selectedExamIndex === idx
                ? 'bg-gradient-to-br from-[#1b1c35] to-[#12162a] border-amber-500/60 shadow-xl shadow-amber-950/30'
                : 'bg-[#12182a] border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase">
                {exam.date}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {exam.daysLeft} DAYS LEFT
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight mt-3">
              {exam.subject}
            </h3>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Target: Grade A+</span>
              <span className="text-amber-400 font-medium">Sprint Active 🔥</span>
            </div>
          </div>
        ))}
      </div>

      {/* Priority Topics & Day-by-Day Sprint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day-by-Day Plan (2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#12182a] border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">
                Sprint Schedule: {activeExam.daysLeft}-Day Roadmap
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Allocated ~2.5 hrs/day
            </span>
          </div>

          <div className="space-y-3">
            {dailySchedule.map(item => (
              <div
                key={item.day}
                className="p-4 rounded-xl bg-[#161f36] border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-violet-900/60 border border-violet-700/60 font-mono text-xs font-bold text-violet-200">
                      Day {item.day}
                    </span>
                    <span className="text-sm font-bold text-white">{item.focusArea}</span>
                  </div>
                  <span className="text-xs text-cyan-300 font-mono">{item.targetHours}h study</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tasks.map((task, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#0e1322] border border-slate-800 text-slate-300 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{task}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Topics Classified by Weightage (1 Column) */}
        <div className="rounded-2xl bg-[#12182a] border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Syllabus Weightage</h3>
            </div>

            <div className="space-y-2.5">
              {examPlan.priorityTopics.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#161f36] border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-white block">
                      {pt.topic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Exam Weight: ~{pt.weightage}%
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      pt.priority === 'high'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : pt.priority === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {pt.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Mock Test Launcher */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/40 to-cyan-950/40 border border-cyan-500/30 space-y-2.5">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
              Exam Simulation Mock
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Launch a timed 10-question mock test under simulated exam pressure.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('quiz', { topic: activeExam.subject })}
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Start Exam Mock Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
