import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

interface ExamModeViewProps {
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({ onNavigate }) => {
  const { examPlan, updateExamPlan, currentSubject, subjects, setIsSubjectModalOpen } = useStudy();

  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedExamIndex, setSelectedExamIndex] = useState(0);

  // Derive exams from user's actual subjects or examPlan, zero mock defaults
  const subjectExams = subjects
    .filter(s => s.targetExamDate)
    .map(s => {
      const diff = new Date(s.targetExamDate).getTime() - new Date().getTime();
      const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      return {
        subject: s.name || s.title,
        date: `In ${days} days (${s.targetExamDate})`,
        daysLeft: days
      };
    });

  const upcomingExams = (examPlan.upcomingExams && examPlan.upcomingExams.length > 0)
    ? examPlan.upcomingExams
    : subjectExams;

  const activeExam = upcomingExams[selectedExamIndex] || upcomingExams[0];

  const dailySchedule = examPlan.dailySchedule || (examPlan.revisionSchedule ? examPlan.revisionSchedule.map(r => ({
    day: r.dayNumber,
    focusArea: r.dateStr,
    targetHours: 2.5,
    tasks: r.tasks
  })) : []);

  const handleRegeneratePlan = async () => {
    if (!activeExam) return;
    setLoadingSchedule(true);
    try {
      const res = await fetch('/api/ai/exam-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeExam.subject,
          daysLeft: activeExam.daysLeft,
          syllabus: 'Core Topics and Syllabus Units',
          weakTopics: []
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

        {upcomingExams.length > 0 && (
          <button
            type="button"
            onClick={handleRegeneratePlan}
            disabled={loadingSchedule}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSchedule ? 'animate-spin' : ''}`} />
            <span>{loadingSchedule ? 'Optimizing Schedule...' : 'Re-optimize Schedule'}</span>
          </button>
        )}
      </div>

      {upcomingExams.length === 0 ? (
        <div className="rounded-2xl bg-[#12182a] border border-slate-800 p-8 text-center space-y-3">
          <Calendar className="w-10 h-10 text-amber-400/80 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Upcoming Exams Scheduled</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Set an exam target date when creating a subject, and NOVA will generate a personalized day-by-day revision roadmap.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md mx-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Subject with Exam Date</span>
            </button>
          </div>
        </div>
      ) : (
        <>
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
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase truncate max-w-[150px]">
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
                    Sprint Schedule: {activeExam?.daysLeft || 14}-Day Roadmap
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Target: 2.5 hrs/day</span>
              </div>

              {dailySchedule.length > 0 ? (
                <div className="space-y-3">
                  {dailySchedule.map((day, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[#151c30] border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Day {day.day}
                          </span>
                          <span className="text-xs font-bold text-white">{day.focusArea}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {day.targetHours} hours planned
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-700 mt-2">
                        {day.tasks.map((task: string, tIdx: number) => (
                          <div key={tIdx} className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 rounded-xl bg-[#141b2e] border border-slate-800 space-y-2">
                  <p className="text-xs">No roadmap generated yet for this exam.</p>
                  <button
                    type="button"
                    onClick={handleRegeneratePlan}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold"
                  >
                    Generate AI Sprint Plan
                  </button>
                </div>
              )}
            </div>

            {/* High-Yield Weightage & Priority Topics (1 Column) */}
            <div className="rounded-2xl bg-[#12182a] border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-400" />
                    <h3 className="text-base font-bold text-white">Priority Topics</h3>
                  </div>
                  <span className="text-xs font-mono text-rose-400">High Weightage</span>
                </div>

                {examPlan.priorityTopics && examPlan.priorityTopics.length > 0 ? (
                  <div className="space-y-2.5">
                    {examPlan.priorityTopics.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#151c30] border border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                            {pt.topic}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            pt.priority === 'High'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {pt.priority}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Exam Weight: {pt.weightage}</span>
                            <span>{pt.confidence}% confidence</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 rounded-full"
                              style={{ width: `${pt.confidence}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Topics will appear here once optimized.</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-[#141b2e] border border-slate-700/80 space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NOVA Exam Insight</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Focusing on core foundational invariants yields the highest point-per-hour return in active exams.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
