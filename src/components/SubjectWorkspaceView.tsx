import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
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
  TrendingUp,
  Plus,
  X,
  Lightbulb,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface SubjectWorkspaceViewProps {
  initialSubject?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const SubjectWorkspaceView: React.FC<SubjectWorkspaceViewProps> = ({
  initialSubject,
  onNavigate
}) => {
  const { 
    subjects, 
    currentSubjectId, 
    setCurrentSubjectId, 
    currentSubject, 
    updateTopicStatus, 
    setIsSubjectModalOpen,
    profile
  } = useStudy();

  const { user } = useAuth();

  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Dynamic lesson material state
  const [activeTopic, setActiveTopic] = useState<any | null>(null);
  const [lessonData, setLessonData] = useState<any | null>(null);
  const [loadingLesson, setLoadingLesson] = useState<boolean>(false);
  const [lessonCache, setLessonCache] = useState<Record<string, any>>({});
  const [revealedRecallAnswers, setRevealedRecallAnswers] = useState<Record<number, boolean>>({});

  const activeSubj = currentSubject || subjects[0];

  // When active subject changes, clear previously active topic content from memory
  useEffect(() => {
    setActiveTopic(null);
    setLessonData(null);
    setRevealedRecallAnswers({});
  }, [currentSubjectId]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleSelectSubject = (subjId: string) => {
    setCurrentSubjectId(subjId);
    setActiveTopic(null);
    setLessonData(null);
    setRevealedRecallAnswers({});
  };

  // Clicking a topic triggers an API fetch to generate full lesson material on the fly if not cached
  const handleOpenTopicLesson = async (topic: any) => {
    setActiveTopic(topic);
    setRevealedRecallAnswers({});

    const cacheKey = topic.id || topic.name;
    if (lessonCache[cacheKey]) {
      setLessonData(lessonCache[cacheKey]);
      return;
    }

    setLoadingLesson(true);
    setLessonData(null);

    try {
      const res = await fetch('/api/v2/generate-topic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectTitle: activeSubj?.name || activeSubj?.title || 'Coursework',
          topicTitle: topic.name,
          academicLevel: user?.academicLevel || profile?.academicLevel || 'Undergrad',
          stream: user?.stream || profile?.stream || 'General'
        })
      });

      const json = await res.json();
      const data = json.data || json.lesson;
      if (data) {
        setLessonData(data);
        setLessonCache(prev => ({ ...prev, [cacheKey]: data }));
      }
    } catch (err) {
      console.error('Error generating lesson content:', err);
    } finally {
      setLoadingLesson(false);
    }
  };

  const toggleRevealAnswer = (idx: number) => {
    setRevealedRecallAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // 100% CLEAN EMPTY-STATE CANVAS WHEN NO SUBJECTS EXIST
  if (!activeSubj || subjects.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
              <BookOpen className="w-3.5 h-3.5" /> SYLLABUS INTELLIGENCE & WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Subject Workspace
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm">
              Curriculum unit roadmap, topic mastery diagnostic, and on-demand AI lesson generation.
            </p>
          </div>
        </div>

        <div className="rounded-3xl bg-[#12182a] border border-cyan-500/30 p-10 sm:p-14 text-center space-y-6 max-w-2xl mx-auto my-12 shadow-2xl shadow-cyan-950/20">
          <div className="w-20 h-20 rounded-3xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">No Subjects Enrolled Yet</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Your workspace is a 100% clean canvas. Create your first custom subject to auto-generate a tailored 6–8 module syllabus and unlock master-level lessons for any concept.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-extrabold text-sm flex items-center gap-2 mx-auto shadow-xl shadow-cyan-950/50 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Add Your First Subject</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allTopics = activeSubj?.units 
    ? activeSubj.units.flatMap(u => u.topics || []) 
    : (activeSubj.topics || []);
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
            {activeSubj.name || activeSubj.title} ({activeSubj.code || activeSubj.courseCode})
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Curriculum unit roadmap, topic mastery diagnostic, and on-demand AI master lessons.
          </p>
        </div>

        {/* Dynamic Subject switcher pills */}
        <div className="flex flex-wrap gap-2">
          {subjects.map(s => {
            const isSelected = (currentSubjectId === s.id || activeSubj.id === s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSubject(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-md font-bold'
                    : 'bg-[#141b2e] text-slate-300 hover:bg-[#18223a] border border-slate-700/60'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.accentColor || '#38bdf8' }} />
                <span>{s.name || s.title}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsSubjectModalOpen(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-[#141b2e] hover:bg-[#18223a] border border-dashed border-cyan-500/40 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* Progress & Diagnostics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Overall Progress</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{activeSubj.progress || 0}%</span>
            <span className="text-xs text-slate-500">of syllabus</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${activeSubj.progress || 0}%` }}></div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Chapters / Units</span>
          <span className="text-2xl font-black text-white">{activeSubj.units?.length || 1} Units</span>
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
          <span className="block text-[10px] text-rose-300 mt-1">Requires focus drill</span>
        </div>
      </div>

      {/* Units & Topics Hierarchy */}
      <div className="space-y-4">
        {(activeSubj.units || [
          { id: `u_${activeSubj.id}_all`, unitNumber: 1, title: `${activeSubj.name || activeSubj.title} Core Curriculum`, topics: activeSubj.topics || [] }
        ]).map(unit => {
          const isExpanded = expandedUnits[unit.id] !== false;
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
                      {(unit.topics || []).length} core syllabus concepts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-300 font-semibold px-2.5 py-1 rounded-lg bg-[#0e1424] border border-slate-800">
                    Unit {unit.unitNumber || 1}
                  </span>
                </div>
              </div>

              {/* Topics Grid */}
              {isExpanded && (
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-[#0e1424]/60">
                  {(unit.topics || []).map((topic: any) => (
                    <div
                      key={topic.id}
                      className="p-4 rounded-xl bg-[#141b2e] border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group cursor-pointer"
                      onClick={() => handleOpenTopicLesson(topic)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                            <span>{topic.name}</span>
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span className="capitalize">{topic.difficulty || 'medium'}</span>
                            <span>•</span>
                            <span className={topic.quizScore >= 80 ? 'text-emerald-400' : topic.quizScore >= 60 ? 'text-cyan-300' : 'text-slate-400'}>
                              Mastery: {topic.quizScore || 0}%
                            </span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            topic.status === 'mastered'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : topic.status === 'learning'
                              ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                              : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                          }`}
                        >
                          {topic.status?.replace('-', ' ') || 'not started'}
                        </span>
                      </div>

                      {topic.summary && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {topic.summary}
                        </p>
                      )}

                      {/* Topic Action Bar */}
                      <div 
                        className="flex items-center justify-between pt-2 border-t border-slate-800/80"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleOpenTopicLesson(topic)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Study Lesson</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigate('tutor', { topic: topic.name, subject: activeSubj.name || activeSubj.title })}
                            className="px-2 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Open in Socratic Tutor"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Tutor</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigate('quiz', { topic: topic.name, subject: activeSubj.name || activeSubj.title })}
                            className="px-2 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-200 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Take Topic Quiz"
                          >
                            <Target className="w-3 h-3" />
                            <span>Quiz</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigate('notes', { topic: topic.name, subject: activeSubj.name || activeSubj.title })}
                            className="px-2 py-1.5 rounded-lg bg-[#182138] hover:bg-[#202c48] text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-all"
                            title="Create Notes"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Notes</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MASTER TOPIC LESSON BREAKDOWN MODAL (ON-DEMAND AI CURRICULUM GENERATION)  */}
      {/* ========================================================================= */}
      {activeTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0f1424] border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 overflow-hidden">
            
            {/* Modal Header Bar */}
            <div className="px-6 py-4 bg-[#141b2e] border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {activeTopic.name}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/40 text-cyan-300 font-bold uppercase">
                      {lessonData?.academicLevel || user?.academicLevel || 'Master Lesson'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {activeSubj.name || activeSubj.title} • High-Density Syllabus Breakdown
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTopic(null);
                  setLessonData(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {loadingLesson ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-400 animate-spin">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">NOVA AI Engine is Compiling Breakdown...</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Synthesizing core intuition, analogies, worked solutions, and active recall drills for {activeTopic.name}.
                    </p>
                  </div>
                </div>
              ) : lessonData ? (
                <div className="space-y-6">
                  {/* 1. Summary & Real-World Analogy */}
                  <div className="space-y-3">
                    <div className="p-5 rounded-2xl bg-[#141b2e] border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> 1. Core Definition & High-Level Intuition
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {lessonData.summary}
                      </p>
                    </div>

                    {lessonData.realWorldAnalogy && (
                      <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 space-y-1">
                        <span className="text-xs font-bold text-violet-300 uppercase tracking-wide flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-amber-400" /> Real-World Mental Analogy
                        </span>
                        <p className="text-sm text-slate-200 italic leading-relaxed">
                          "{lessonData.realWorldAnalogy}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 2. Deep-Dive Key Concepts */}
                  {lessonData.keyConcepts && lessonData.keyConcepts.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-cyan-400" /> 2. Deep-Dive Conceptual Breakdown
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {lessonData.keyConcepts.map((kc: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-[#141b2e] border border-slate-800 space-y-2">
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-md bg-cyan-950 border border-cyan-800/40 text-cyan-400 flex items-center justify-center text-xs font-mono">
                                {idx + 1}
                              </span>
                              <span>{kc.title}</span>
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {kc.explanation}
                            </p>
                            {kc.keyTerms && kc.keyTerms.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/60">
                                {kc.keyTerms.map((term: string, tIdx: number) => (
                                  <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0e1424] text-cyan-300 border border-slate-800">
                                    {term}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Essential Formulas & Governing Rules */}
                  {lessonData.formulasOrRules && lessonData.formulasOrRules.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" /> 3. Governing Invariants, Formulas & Rules
                      </h3>
                      <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-2">
                        {lessonData.formulasOrRules.map((rule: string, rIdx: number) => (
                          <div key={rIdx} className="flex items-start gap-2.5 text-xs text-slate-200 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4. Worked Step-by-Step Example */}
                  {lessonData.workedExample && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-400" /> 4. Worked Problem & Step-by-Step Walkthrough
                      </h3>
                      <div className="p-5 rounded-2xl bg-[#141b2e] border border-slate-800 space-y-3">
                        <div className="text-sm font-semibold text-white">
                          <strong className="text-cyan-300">Problem: </strong>
                          {lessonData.workedExample.problem}
                        </div>

                        {lessonData.workedExample.stepByStepSolution && (
                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Solution Steps:
                            </span>
                            {lessonData.workedExample.stepByStepSolution.map((step: string, sIdx: number) => (
                              <div key={sIdx} className="p-2.5 rounded-lg bg-[#0e1424] border border-slate-800/80 text-xs text-slate-200">
                                {step}
                              </div>
                            ))}
                          </div>
                        )}

                        {lessonData.workedExample.finalAnswer && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 font-bold flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Final Verified Answer: {lessonData.workedExample.finalAnswer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 5. Common Exam Pitfalls */}
                  {lessonData.examPitfalls && lessonData.examPitfalls.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-400" /> 5. Common Exam Pitfalls & Misconceptions
                      </h3>
                      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-2">
                        {lessonData.examPitfalls.map((pitfall: string, pIdx: number) => (
                          <div key={pIdx} className="flex items-start gap-2.5 text-xs text-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                            <span>{pitfall}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6. Active Recall Flashcards Drill */}
                  {lessonData.activeRecallQuestions && lessonData.activeRecallQuestions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-cyan-400" /> 6. Quick Active-Recall Self-Testing ({lessonData.activeRecallQuestions.length} Q&As)
                      </h3>
                      <div className="space-y-2.5">
                        {lessonData.activeRecallQuestions.map((q: any, qIdx: number) => {
                          const isRevealed = revealedRecallAnswers[qIdx];
                          return (
                            <div key={qIdx} className="p-4 rounded-xl bg-[#141b2e] border border-slate-800 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-xs font-medium text-white">
                                  <strong>Q{qIdx + 1}: </strong> {q.question}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleRevealAnswer(qIdx)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#182138] hover:bg-[#202c4b] border border-slate-700 text-cyan-300 flex items-center gap-1 shrink-0"
                                >
                                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  <span>{isRevealed ? 'Hide' : 'Reveal Answer'}</span>
                                </button>
                              </div>

                              {isRevealed && (
                                <div className="p-3 rounded-lg bg-[#0e1424] border border-cyan-800/40 text-xs text-cyan-200 font-mono animate-in fade-in">
                                  <strong>Answer: </strong> {q.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  Failed to load lesson material. Please try again.
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="px-6 py-4 bg-[#141b2e] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400">
                Continue studying with NOVA interactive tools:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTopic(null);
                    onNavigate('tutor', { topic: activeTopic.name, subject: activeSubj.name || activeSubj.title });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Socratic Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTopic(null);
                    onNavigate('quiz', { topic: activeTopic.name, subject: activeSubj.name || activeSubj.title });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Take Quiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTopic(null);
                    onNavigate('notes', { topic: activeTopic.name, subject: activeSubj.name || activeSubj.title });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#182138] hover:bg-[#202c48] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Make Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
