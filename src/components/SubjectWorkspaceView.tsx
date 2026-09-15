import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Brain, 
  FileText, 
  Zap, 
  HelpCircle, 
  Target,
  ChevronDown,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface SubjectWorkspaceViewProps {
  initialSubject?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const SubjectWorkspaceView: React.FC<SubjectWorkspaceViewProps> = ({
  initialSubject,
  onNavigate
}) => {
  const { subjects, currentSubjectId, setCurrentSubjectId, currentSubject, updateTopicStatus } = useStudy();

  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    'u-dsa-1': true,
    'u-dsa-2': true,
    'u-dsa-3': true
  });

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const activeSubj = currentSubject || subjects[0];

  const allTopics = activeSubj?.units.flatMap(u => u.topics) || [];
  const masteredCount = allTopics.filter(t => t.status === 'mastered').length;
  const weakCount = allTopics.filter(t => t.status === 'needs-revision').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
            <BookOpen className="w-3.5 h-3.5" /> SYLLABUS INTELLIGENCE & WORKSPACE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {activeSubj.name} ({activeSubj.code})
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Curriculum unit roadmap, topic mastery diagnostic, and 1-click remediation tools.
          </p>
        </div>

        {/* Subject switcher pills */}
        <div className="flex flex-wrap gap-2">
          {subjects.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentSubjectId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                currentSubjectId === s.id
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'bg-[#141b2e] text-slate-300 hover:bg-[#18223a] border border-slate-700/60'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Progress & Diagnostics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Overall Progress</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{activeSubj.progress}%</span>
            <span className="text-xs text-slate-500">of syllabus</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${activeSubj.progress}%` }}></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Chapters / Units</span>
          <span className="text-2xl font-black text-white">{activeSubj.units.length} Units</span>
          <span className="block text-[10px] text-slate-500 mt-1">{allTopics.length} Total Topics</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Mastered Topics</span>
          <span className="text-2xl font-black text-emerald-400">{masteredCount}</span>
          <span className="block text-[10px] text-emerald-300 mt-1">Quiz score ≥ 80%</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Needs Revision</span>
          <span className="text-2xl font-black text-rose-400">{weakCount} Weak</span>
          <span className="block text-[10px] text-rose-300 mt-1">Requires immediate drill</span>
        </div>
      </div>

      {/* Units & Topics Hierarchy */}
      <div className="space-y-4">
        {activeSubj.units.map(unit => {
          const isExpanded = !!expandedUnits[unit.id];
          return (
            <div
              key={unit.id}
              className="rounded-2xl bg-[#12182a] border border-slate-800 overflow-hidden shadow-lg"
            >
              {/* Unit Title Bar */}
              <div
                onClick={() => toggleUnit(unit.id)}
                className="p-4 sm:p-5 bg-[#141b2e] hover:bg-[#182138] cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button type="button" className="text-slate-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {unit.title}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {unit.topics.length} core concepts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/40">
                    {unit.topics.filter(t => t.status === 'mastered').length} / {unit.topics.length} Mastered
                  </span>
                </div>
              </div>

              {/* Topics Grid */}
              {isExpanded && (
                <div className="p-4 sm:p-5 divide-y divide-slate-800/80 space-y-3">
                  {unit.topics.map(topic => (
                    <div
                      key={topic.id}
                      className="pt-3 first:pt-0 flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {topic.name}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                              topic.status === 'mastered'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : topic.status === 'learning'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : topic.status === 'needs-revision'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {topic.status.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span>Diagnostic Score: <strong className="text-cyan-300">{topic.quizScore}%</strong></span>
                          <span>•</span>
                          <span>Last reviewed: {topic.lastReviewedDaysAgo}d ago</span>
                        </div>
                      </div>

                      {/* 1-Click Remediation Action Tools */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onNavigate('tutor', { topic: topic.name, subject: activeSubj.name })}
                          className="px-2.5 py-1 rounded-lg bg-[#162038] hover:bg-[#1f2c4e] text-violet-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Explain in AI Tutor"
                        >
                          <Sparkles className="w-3 h-3 text-violet-400" /> Tutor
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('notes', { topic: topic.name, subject: activeSubj.name })}
                          className="px-2.5 py-1 rounded-lg bg-[#162038] hover:bg-[#1f2c4e] text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Generate Notes"
                        >
                          <FileText className="w-3 h-3 text-amber-400" /> Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('mindmaps', { topic: topic.name, subject: activeSubj.name })}
                          className="px-2.5 py-1 rounded-lg bg-[#162038] hover:bg-[#1f2c4e] text-cyan-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Open Mind Map"
                        >
                          <Brain className="w-3 h-3 text-cyan-400" /> Map
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate('recall', { topic: topic.name, subject: activeSubj.name })}
                          className="px-2.5 py-1 rounded-lg bg-[#162038] hover:bg-[#1f2c4e] text-emerald-300 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Active Recall Drill"
                        >
                          <HelpCircle className="w-3 h-3 text-emerald-400" /> Recall
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
