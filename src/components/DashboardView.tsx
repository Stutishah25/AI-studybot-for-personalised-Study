import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { NavRoute } from './Sidebar';
import { AddSubjectModal } from './AddSubjectModal';
import { StudyBuddyMascot } from './StudyBuddyMascot';
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
  BookOpen, 
  Plus, 
  Play, 
  Zap,
  TrendingUp,
  Award,
  GraduationCap,
  Layers,
  AlertCircle,
  Radio,
  ChevronRight,
  HelpCircle,
  Check,
  Search,
  Lightbulb,
  Copy,
  Bookmark,
  Send,
  Eye,
  EyeOff,
  Compass,
  Key,
  Scroll,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
  onOpenFocusMode: () => void;
}

type PromptActionId = 
  | 'explain-simply' 
  | 'give-example' 
  | 'make-notes' 
  | 'create-mindmap' 
  | 'give-shortcut' 
  | 'test-me';

type LearningModeId = 
  | 'eli10' 
  | 'exam-answer' 
  | 'practice-questions';

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenFocusMode }) => {
  const { 
    profile, 
    subjects, 
    currentSubjectId,
    setCurrentSubjectId,
    currentSubject,
    studyPlan, 
    toggleStudyPlanItem, 
    addStudyPlanItem, 
    streak, 
    studyHours,
    revisionRadar,
    addNote
  } = useStudy();

  const { user } = useAuth();

  // State
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string>('all');
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanTime, setNewPlanTime] = useState('14:00');
  const [newPlanDuration, setNewPlanDuration] = useState('25');

  // Study Hub Interactive Engine State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState<PromptActionId>('explain-simply');
  const [selectedMode, setSelectedMode] = useState<LearningModeId>('exam-answer');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeLessonOutput, setActiveLessonOutput] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [revealedFlashcards, setRevealedFlashcards] = useState<Record<number, boolean>>({});

  const studentName = user?.name || profile?.name || 'Student';
  const academicLevel = user?.academicLevel || profile?.academicLevel || 'Undergrad';
  const academicStream = user?.stream || profile?.stream || 'General';
  const learningStyle = profile?.preferredLearningStyle 
    ? `${profile.preferredLearningStyle.charAt(0).toUpperCase() + profile.preferredLearningStyle.slice(1)} & Conceptual`
    : 'Visual & Conceptual';

  const hasSubjects = subjects && subjects.length > 0;
  const activeSubject = currentSubject || subjects.find(s => s.id === currentSubjectId) || subjects[0];

  // Set default search input to active subject's first topic if available
  useEffect(() => {
    if (activeSubject?.topics && activeSubject.topics.length > 0 && !searchQuery) {
      setSearchQuery(activeSubject.topics[0].name);
    }
  }, [activeSubject]);

  // Primary Prompt Actions (Friendly Muted Bronze Pill Buttons)
  const primaryPromptActions: Array<{ id: PromptActionId; label: string; icon: React.ElementType; description: string }> = [
    { id: 'explain-simply', label: 'Explain Simply', icon: Lightbulb, description: 'Core intuition & analogy' },
    { id: 'give-example', label: 'Give Example', icon: BookOpen, description: 'Concrete practical walkthrough' },
    { id: 'make-notes', label: 'Make Notes', icon: Scroll, description: 'High-yield revision cheat sheet' },
    { id: 'create-mindmap', label: 'Create Mind Map', icon: Brain, description: 'Conceptual hierarchy' },
    { id: 'give-shortcut', label: 'Give Shortcut', icon: Key, description: 'Memory hooks & heuristics' },
    { id: 'test-me', label: 'Test Me', icon: Target, description: 'Active recall check' }
  ];

  // Learning Mode Toggles
  const learningModeToggles: Array<{ id: LearningModeId; label: string }> = [
    { id: 'eli10', label: "Explain Like I'm 10" },
    { id: 'exam-answer', label: 'Exam Answer' },
    { id: 'practice-questions', label: 'Practice Questions' }
  ];

  // Visual Tool Identifiers (3D Tactile Indicator Specs)
  const visualToolIdentifiers = [
    {
      name: 'Core Intuition',
      icon: Lightbulb,
      tag: 'Analogy Lens',
      color: 'text-amber-300',
      bg: 'bg-amber-950/20 border-amber-500/30',
      desc: 'Connects abstract formulas to everyday physical mechanics.'
    },
    {
      name: 'Deep Diagnostic',
      icon: Search,
      tag: 'Knowledge Scan',
      color: 'text-teal-300',
      bg: 'bg-teal-950/20 border-teal-500/30',
      desc: 'Exposes hidden assumptions, boundary constraints, and edge-cases.'
    },
    {
      name: 'High-Yield Notes',
      icon: Scroll,
      tag: 'Parchment Synthesis',
      color: 'text-[#E2C78E]',
      bg: 'bg-[#1C1811] border-[#C5A059]/40',
      desc: 'Structured summaries formatted for rapid pre-exam review.'
    },
    {
      name: 'Memory Keys',
      icon: Key,
      tag: 'Invariant Hooks',
      color: 'text-amber-400',
      bg: 'bg-amber-950/25 border-amber-600/30',
      desc: 'Mnemonics and mental anchors that lock key rules into long-term recall.'
    },
    {
      name: 'Syllabus Compass',
      icon: Compass,
      tag: 'Curriculum Radar',
      color: 'text-cyan-300',
      bg: 'bg-cyan-950/20 border-cyan-500/30',
      desc: 'Dynamic pacing calibrated directly to your exam countdown.'
    }
  ];

  // Dynamic Default Master Lesson for the active subject when no query has been synthesized yet
  const defaultLessonForSubject = useMemo(() => {
    if (!activeSubject) return null;
    const topicName = activeSubject.topics?.[0]?.name || `${activeSubject.name || activeSubject.title} Foundations`;
    return {
      topicTitle: topicName,
      academicLevel: academicLevel,
      action: selectedAction,
      mode: selectedMode,
      summary: `Foundational conceptual pillars of ${activeSubject.name || activeSubject.title}: understanding invariant governing constraints, structural mechanisms, and high-yield rules tested in examinations.`,
      realWorldAnalogy: `Think of ${topicName} like the suspension cables of a grand bridge: tension and load are dynamically distributed so the system maintains balance and withstands unexpected perturbations without catastrophic failure.`,
      keyConcepts: [
        {
          title: 'Structural Invariants & Governing Axioms',
          explanation: `Every state transition or query must preserve the foundational invariants of ${activeSubject.name || activeSubject.title}, guaranteeing predictable performance across all operational boundaries.`,
          keyTerms: ['System Invariants', 'Boundary Conditions', 'State Equilibrium']
        },
        {
          title: 'Dynamic Operational Thresholds',
          explanation: 'Governing parameters bound worst-case resource allocation, ensuring that peak stress cases remain strictly within theoretical expectations.',
          keyTerms: ['Worst-Case Bounds', 'Threshold Conservation']
        }
      ],
      formulasOrRules: [
        'Balance Criterion: Absolute deviation Δ ≤ Governing Tolerance',
        'State Conservation: Integrated System Energy = Constant under closed operations'
      ],
      workedExample: {
        problem: `Analyze a standard exam scenario in ${topicName}: identify the primary boundary constraint and determine the restored equilibrium state.`,
        stepByStepSolution: [
          'Step 1: Isolate given system parameters and verify baseline initial conditions.',
          'Step 2: Apply the governing transformation formula to resolve any imbalance.',
          'Step 3: Verify boundary limits to prove that invariant stability is fully restored.'
        ],
        finalAnswer: 'Equilibrium successfully restored within optimal O(1) state transitions.'
      },
      examPitfalls: [
        'Overlooking edge cases such as empty initial bounds or boundary extremes.',
        'Confusing transient temporary states with steady-state equilibrium.'
      ],
      activeRecallQuestions: [
        {
          question: `Why is preserving invariants essential during state transformations in ${topicName}?`,
          answer: 'To prevent structural degradation and guarantee that queries and operations terminate within deterministic mathematical bounds.'
        },
        {
          question: 'What boundary test is most frequently exploited by examiners to test conceptual gaps?',
          answer: 'Single-element or boundary-limit inputs where default propagation assumptions break down.'
        }
      ]
    };
  }, [activeSubject, academicLevel, selectedAction, selectedMode]);

  const currentDisplayLesson = activeLessonOutput || defaultLessonForSubject;

  // Handle Dynamic AI Synthesis from Search Input or Action Pills
  const handleSynthesizeContent = async (actionToUse = selectedAction, modeToUse = selectedMode, overrideQuery?: string) => {
    const queryToUse = (overrideQuery || searchQuery || activeSubject?.topics?.[0]?.name || '').trim();
    if (!queryToUse) return;

    setIsSynthesizing(true);
    setCopied(false);
    setSavedNote(false);
    setRevealedFlashcards({});
    setSelectedAction(actionToUse);
    setSelectedMode(modeToUse);

    try {
      const res = await fetch('/api/v2/generate-topic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectTitle: activeSubject?.name || activeSubject?.title || 'Coursework',
          topicTitle: queryToUse,
          academicLevel,
          stream: academicStream,
          action: actionToUse,
          mode: modeToUse
        })
      });

      const json = await res.json();
      const data = json.data || json.lesson;
      if (data) {
        setActiveLessonOutput(data);
      }
    } catch (err) {
      console.error('Failed to synthesize study hub lesson:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Copy structured lesson content
  const handleCopyContent = (lesson = currentDisplayLesson) => {
    if (!lesson) return;
    const text = `TOPIC: ${lesson.topicTitle}
ACADEMIC LEVEL: ${lesson.academicLevel}

CORE SUMMARY:
${lesson.summary}

REAL-WORLD ANALOGY:
${lesson.realWorldAnalogy}

CORE PRINCIPLES & CONCEPTS:
${(lesson.keyConcepts || []).map((c: any) => `• ${c.title}: ${c.explanation}`).join('\n')}

GOVERNING RULES & FORMULAS:
${(lesson.formulasOrRules || []).join('\n')}

WORKED EXAMPLE:
Problem: ${lesson.workedExample?.problem}
Final Answer: ${lesson.workedExample?.finalAnswer}

EXAM PITFALLS:
${(lesson.examPitfalls || []).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save to Notes Studio
  const handleSaveToNotes = (lesson = currentDisplayLesson) => {
    if (!lesson) return;
    addNote({
      title: `${lesson.topicTitle} — Master Study Breakdown`,
      subject: activeSubject?.name || 'Coursework',
      content: `## ${lesson.topicTitle}\n\n**Core Intuition:**\n${lesson.summary}\n\n**Simple Analogy:**\n*${lesson.realWorldAnalogy}*\n\n### Key Concepts\n${(lesson.keyConcepts || []).map((c: any) => `#### ${c.title}\n${c.explanation}\nKey Terms: ${(c.keyTerms || []).join(', ')}`).join('\n\n')}\n\n### Essential Formulas\n${(lesson.formulasOrRules || []).join('\n- ')}\n\n### Worked Example\n**Problem:** ${lesson.workedExample?.problem}\n**Final Answer:** ${lesson.workedExample?.finalAnswer}`,
      summary: lesson.summary,
      type: 'detailed',
      tags: ['study-hub', activeSubject?.name?.toLowerCase().replace(/\s+/g, '-') || 'general', 'master-lesson']
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  // Filtered topics and subjects
  const filteredSubjects = useMemo(() => {
    if (activeSubjectFilter === 'all') return subjects;
    return subjects.filter(s => s.id === activeSubjectFilter);
  }, [subjects, activeSubjectFilter]);

  // Dynamically determine today's high-yield focus topic based on weak areas
  const focusTopic = useMemo(() => {
    if (!hasSubjects) return null;

    if (revisionRadar && revisionRadar.length > 0) {
      const matchingRadar = activeSubjectFilter === 'all'
        ? revisionRadar[0]
        : revisionRadar.find(r => {
            const subj = subjects.find(s => s.id === activeSubjectFilter);
            return subj && r.subject.toLowerCase() === subj.name.toLowerCase();
          }) || revisionRadar[0];

      if (matchingRadar) {
        return {
          name: matchingRadar.topic,
          subject: matchingRadar.subject,
          submodule: matchingRadar.recommendedAction || 'Spaced Repetition Recovery',
          reason: matchingRadar.reason || `Retention estimated at ${matchingRadar.retentionEstimate}%. Reviewing now restores long-term recall.`,
          score: matchingRadar.retentionEstimate,
          badge: `Urgency: ${matchingRadar.urgency.toUpperCase()}`,
          isCritical: matchingRadar.urgency === 'high'
        };
      }
    }

    let candidate: { name: string; subject: string; score: number; diff: string } | null = null;
    const pool = activeSubjectFilter === 'all' ? subjects : filteredSubjects;

    for (const s of pool) {
      const topicList = s.topics || (s.units ? s.units.flatMap(u => u.topics) : []);
      for (const t of topicList) {
        if (!candidate || (t.quizScore !== undefined && t.quizScore < candidate.score)) {
          candidate = {
            name: t.name,
            subject: s.name || s.title || 'Course',
            score: t.quizScore || 0,
            diff: t.difficulty || 'medium'
          };
        }
      }
    }

    if (candidate) {
      return {
        name: candidate.name,
        subject: candidate.subject,
        submodule: 'Targeted Gap Closure',
        reason: `Recorded quiz mastery is ${candidate.score}%. An active recall session will build lasting retention.`,
        score: candidate.score,
        badge: `Difficulty: ${candidate.diff.toUpperCase()}`,
        isCritical: candidate.score < 50
      };
    }

    const firstSubj = subjects[0];
    const firstTopic = firstSubj?.topics?.[0]?.name || `${firstSubj?.name || 'Unit 1'} Foundations`;
    return {
      name: firstTopic,
      subject: firstSubj?.name || firstSubj?.title || 'Coursework',
      submodule: 'Active Learning Session',
      reason: 'Build your baseline mastery with active recall, flashcards, and interactive concept maps.',
      score: 30,
      badge: 'Active Topic',
      isCritical: false
    };
  }, [hasSubjects, revisionRadar, subjects, activeSubjectFilter, filteredSubjects]);

  const completedCount = studyPlan.filter(p => p.completed).length;
  const planProgress = studyPlan.length ? Math.round((completedCount / studyPlan.length) * 100) : 0;

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) return;
    addStudyPlanItem({
      time: newPlanTime,
      title: newPlanTitle.trim(),
      durationMinutes: parseInt(newPlanDuration, 10) || 25,
      type: 'practice',
      topic: newPlanTitle.trim(),
      subject: activeSubject?.name || 'General Studies'
    });
    setNewPlanTitle('');
    setShowAddPlan(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. FRIENDLY STUDY BUDDY HEADER & GREETING                                 */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            {/* Friendly Greeting in Elegant Serif */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight">
              Welcome back! Ready to study?
            </h1>

            {/* Dynamic Academic Persona & Subject Sub-Header */}
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[#C5A059] font-medium">
                Subject Study Hub: {activeSubject ? (activeSubject.name || activeSubject.title) : 'Enrolled Coursework'}
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400">
                Tailored to your <span className="text-white font-medium">{learningStyle}</span> learning profile
              </span>
            </p>
          </div>

          {/* Header Controls: Subject Selector, Streak, Focus Room & User Avatar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Subject Selector Dropdown */}
            {hasSubjects && (
              <div className="relative">
                <select
                  value={currentSubjectId}
                  onChange={e => setCurrentSubjectId(e.target.value)}
                  className="appearance-none px-3.5 py-2 pr-9 rounded-xl bg-[#171B22] border border-[#2A2F37] hover:border-[#C5A059]/50 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#C5A059] transition-all cursor-pointer shadow-sm"
                  aria-label="Active subject selector"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name || s.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#C5A059] absolute right-3 top-3 pointer-events-none" />
              </div>
            )}

            {/* Study Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1811] border border-[#C5A059]/40 text-[#E2C78E] text-xs font-semibold shadow-sm select-none">
              <Flame className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
              <span className="font-mono tracking-wide">{streak}d streak</span>
            </div>

            {/* Focus Room Trigger Button with Spring Physics */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="button"
              onClick={onOpenFocusMode}
              className="px-4 py-2 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#C5A059]/50 hover:border-[#C5A059] text-[#E2C78E] hover:text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-black/40 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Focus Room</span>
            </motion.button>

            {/* Friendly Mascot Companion Badge */}
            <StudyBuddyMascot size="md" status="Ready to Tutor" />

            {/* User Profile Avatar with Muted Bronze Ring & Spring Physics */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="button"
              onClick={() => onNavigate('profile')}
              className="relative w-10 h-10 rounded-2xl bg-[#171B22] border border-[#C5A059]/40 hover:border-[#C5A059] flex items-center justify-center text-xs font-bold text-[#E2C78E] shadow-sm transition-all overflow-hidden cursor-pointer"
              title={`User Profile: ${studentName} (${academicLevel})`}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={studentName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-sm font-bold text-[#C5A059]">
                  {studentName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-teal-400 ring-2 ring-[#12151A]" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. ACTION BAR & CONTEXTUAL PROMPT PILLS                                    */}
      {/* ========================================================================= */}
      <section className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-7 space-y-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#2A2F37]/80">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Learning Engine</span>
          </div>

          {/* Learning Mode Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-400 mr-1 hidden sm:inline">Depth:</span>
            {learningModeToggles.map(mode => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => {
                    setSelectedMode(mode.id);
                    if (searchQuery.trim()) {
                      handleSynthesizeContent(selectedAction, mode.id);
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#C5A059] text-black shadow-md font-bold'
                      : 'bg-[#171B22] text-slate-400 hover:text-slate-200 border border-[#2A2F37]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Clean Dark Input Bar with Prominent "Teach" Action Button */}
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSynthesizeContent()}
              placeholder={
                activeSubject
                  ? `Enter any concept or question in ${activeSubject.name || activeSubject.title} (e.g. ${activeSubject.topics?.[0]?.name || 'Core Topic'})...`
                  : "Search any academic topic, question, or syllabus concept..."
              }
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B0D10] border border-[#2A2F37] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/40 transition-all shadow-inner"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => handleSynthesizeContent()}
            disabled={isSynthesizing || !searchQuery.trim()}
            className="px-7 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#D4B472] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#C5A059]/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black text-black" />
            <span>{isSynthesizing ? 'Teaching...' : 'Teach'}</span>
          </motion.button>
        </div>

        {/* Primary Prompt Actions (Muted Pill Buttons) */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Contextual Study Actions:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {primaryPromptActions.map(action => {
              const Icon = action.icon;
              const isSelected = selectedAction === action.id;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSynthesizeContent(action.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all tactile-pill flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-[#1C1811] border-[#C5A059] text-white shadow-md'
                      : 'bg-[#171B22] border-[#2A2F37] text-slate-300 hover:border-[#C5A059]/50 hover:bg-[#1E242E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C5A059]' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold truncate">{action.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {action.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. EXPLANATION & CONTENT DISPLAY CARDS (MUTED BRONZE & OBSIDIAN)          */}
      {/* ========================================================================= */}
      {isSynthesizing ? (
        <div className="p-12 rounded-3xl bg-[#12151A] border border-[#2A2F37] text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-[#1C1811] border border-[#C5A059]/50 flex items-center justify-center mx-auto text-[#C5A059] animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl text-white font-medium">NOVA Companion is Synthesizing Lesson...</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Structuring core intuition, real-world analogies, worked examples, and exam traps for <span className="text-[#C5A059]">{searchQuery}</span>.
            </p>
          </div>
        </div>
      ) : currentDisplayLesson ? (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Top Bar for Output Panel: Title + Copy / Save */}
          <div className="p-5 rounded-2xl bg-[#12151A] border border-[#2A2F37] flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1C1811] border border-[#C5A059]/50 flex items-center justify-center text-[#C5A059]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-white tracking-tight">
                  {currentDisplayLesson.topicTitle}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span>{currentDisplayLesson.academicLevel}</span>
                  <span>•</span>
                  <span className="text-[#C5A059] uppercase">{selectedAction.replace('-', ' ')}</span>
                  <span>•</span>
                  <span className="text-teal-400 capitalize">{selectedMode.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Interactive Copy & Save Action Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                type="button"
                onClick={() => handleCopyContent(currentDisplayLesson)}
                className="px-3.5 py-1.5 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] hover:border-[#C5A059]/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C5A059]" />}
                <span>{copied ? 'Copied Full Lesson!' : 'Copy'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                type="button"
                onClick={() => handleSaveToNotes(currentDisplayLesson)}
                className="px-3.5 py-1.5 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] hover:border-[#C5A059]/50 text-xs font-semibold text-[#E2C78E] hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                {savedNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5 text-[#C5A059]" />}
                <span>{savedNote ? 'Saved in Notes!' : 'Save to Notes'}</span>
              </motion.button>
            </div>
          </div>

          {/* 4. CORE TAKEAWAY CALLOUT CARD (#C5A059 BORDER ACCENT & INNER GRADIENT) */}
          <div className="bronze-callout-card p-6 sm:p-7 space-y-5">
            {/* Header Kicker */}
            <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-3">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E2C78E] font-bold flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-[#C5A059]" /> Core Takeaway Callout
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Exam-Yield Diagnostic
              </span>
            </div>

            {/* SIMPLE ANALOGY & CORE PRINCIPLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* SIMPLE ANALOGY */}
              <div className="space-y-2 p-4.5 rounded-2xl bg-[#0B0D10]/85 border border-[#C5A059]/30 shadow-inner">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> SIMPLE ANALOGY
                </span>
                <p className="text-sm text-slate-200 leading-relaxed italic font-sans">
                  "{currentDisplayLesson.realWorldAnalogy || `Think of ${currentDisplayLesson.topicTitle} like a foundational governing rule: when balanced, the entire system functions with optimal efficiency.`}"
                </p>
              </div>

              {/* CORE PRINCIPLE */}
              <div className="space-y-2 p-4.5 rounded-2xl bg-[#0B0D10]/85 border border-teal-500/30 shadow-inner">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> CORE PRINCIPLE
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {currentDisplayLesson.summary}
                </p>
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#C5A059]/20">
              <span className="text-xs text-slate-400 font-mono">
                Continue deeper practice in specialized study labs:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('tutor', { topic: currentDisplayLesson.topicTitle, subject: activeSubject?.name })}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#D4B472] text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Socratic Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('quiz', { topic: currentDisplayLesson.topicTitle, subject: activeSubject?.name })}
                  className="px-3.5 py-1.5 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Test Me (Quiz)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('mindmaps', { topic: currentDisplayLesson.topicTitle, subject: activeSubject?.name })}
                  className="px-3.5 py-1.5 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Mind Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Key Concepts & Deep-Dive Breakdown */}
          {currentDisplayLesson.keyConcepts && currentDisplayLesson.keyConcepts.length > 0 && (
            <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-7 space-y-4 shadow-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#C5A059]" /> Key Concepts & Theoretical Mechanism
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentDisplayLesson.keyConcepts.map((kc: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0B0D10] border border-[#2A2F37] space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#1C1811] border border-[#C5A059]/40 text-[#E2C78E] flex items-center justify-center text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <span>{kc.title}</span>
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {kc.explanation}
                    </p>
                    {kc.keyTerms && kc.keyTerms.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t border-[#2A2F37]/60">
                        {kc.keyTerms.map((term: string, tIdx: number) => (
                          <span key={tIdx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171B22] text-[#E2C78E] border border-[#2A2F37]">
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

          {/* Worked Problem & Step-by-Step Walkthrough */}
          {currentDisplayLesson.workedExample && (
            <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-7 space-y-4 shadow-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" /> Worked Example Walkthrough
              </span>
              <div className="p-5 rounded-2xl bg-[#0B0D10] border border-[#2A2F37] space-y-3">
                <div className="text-sm font-medium text-white">
                  <strong className="text-[#C5A059]">Problem Statement: </strong>
                  {currentDisplayLesson.workedExample.problem}
                </div>

                {currentDisplayLesson.workedExample.stepByStepSolution && (
                  <div className="space-y-2 pt-2 border-t border-[#2A2F37]">
                    <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                      Step-by-Step Resolution:
                    </span>
                    {currentDisplayLesson.workedExample.stepByStepSolution.map((step: string, sIdx: number) => (
                      <div key={sIdx} className="p-2.5 rounded-xl bg-[#12151A] border border-[#2A2F37] text-xs text-slate-200">
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {currentDisplayLesson.workedExample.finalAnswer && (
                  <div className="p-3 rounded-xl bg-[#1C1811] border border-[#C5A059]/40 text-xs text-[#E2C78E] font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#C5A059]" />
                    <span>Final Verified Answer: {currentDisplayLesson.workedExample.finalAnswer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Active Recall Flashcards with Reveal Toggles */}
          {currentDisplayLesson.activeRecallQuestions && currentDisplayLesson.activeRecallQuestions.length > 0 && (
            <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-7 space-y-4 shadow-xl">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C5A059]" /> Instant Active Recall Check ({currentDisplayLesson.activeRecallQuestions.length} Questions)
              </span>
              <div className="space-y-2.5">
                {currentDisplayLesson.activeRecallQuestions.map((q: any, qIdx: number) => {
                  const isRevealed = revealedFlashcards[qIdx];
                  return (
                    <div key={qIdx} className="p-4 rounded-2xl bg-[#0B0D10] border border-[#2A2F37] space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-medium text-white leading-relaxed">
                          <strong className="text-[#C5A059]">Q{qIdx + 1}: </strong> {q.question}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedFlashcards(prev => ({ ...prev, [qIdx]: !prev[qIdx] }))}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] text-[#E2C78E] flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'Hide' : 'Reveal Answer'}</span>
                        </button>
                      </div>

                      {isRevealed && (
                        <div className="p-3 rounded-xl bg-[#1C1811] border border-[#C5A059]/40 text-xs text-[#E2C78E] font-mono animate-in fade-in">
                          <strong>Answer: </strong> {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.section>
      ) : null}

      {/* ========================================================================= */}
      {/* 4. VISUAL TOOL IDENTIFIERS (3D TACTILE INDICATORS)                        */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block font-semibold">
            Academic Toolkit & 3D Tactile Identifiers:
          </span>
          <span className="text-[11px] font-mono text-[#C5A059] hidden sm:inline">
            Tactile Study Lenses
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {visualToolIdentifiers.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-4.5 rounded-2xl bg-[#12151A] border border-[#2A2F37] hover:border-[#C5A059]/50 transition-all space-y-2.5 shadow-xl group cursor-default tactile-3d-box"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl ${tool.bg} border flex items-center justify-center ${tool.color} shadow-inner`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {tool.tag}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-[#E2C78E] transition-colors flex items-center justify-between">
                  <span>{tool.name}</span>
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {tool.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WORKSPACE BENTO: FOCUS TOPIC & STUDY PLAN                             */}
      {/* ========================================================================= */}
      {!hasSubjects ? (
        /* Clean Canvas Hero When No Subjects Exist */
        <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#1C1811] border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#C5A059]">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
              Your Workspace is Clean & Ready
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enrolled subjects, automated syllabus roadmaps, and spaced repetition analytics will populate dynamically as you add coursework.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            type="button"
            onClick={() => setIsAddSubjectModalOpen(true)}
            className="px-6 py-3 rounded-2xl bg-[#C5A059] hover:bg-[#D4B472] text-black font-extrabold text-xs flex items-center gap-2 mx-auto shadow-lg shadow-[#C5A059]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Your First Subject</span>
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Today's High-Yield Focus Concept */}
          <div className="lg:col-span-2 space-y-6">
            {focusTopic && (
              <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-7 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#2A2F37] pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] font-bold uppercase">
                    <Target className="w-4 h-4" /> Today's Priority Concept
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#1C1811] text-[#E2C78E] border border-[#C5A059]/30">
                    {focusTopic.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400 block font-mono">
                    Course: {focusTopic.subject}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {focusTopic.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {focusTopic.reason}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(focusTopic.name);
                      handleSynthesizeContent('explain-simply', selectedMode, focusTopic.name);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4B472] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Synthesize Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('quiz', { topic: focusTopic.name, subject: focusTopic.subject })}
                    className="px-4 py-2 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Launch Recall Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('tutor', { topic: focusTopic.name, subject: focusTopic.subject })}
                    className="px-4 py-2 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Socratic Tutor</span>
                  </button>
                </div>
              </div>
            )}

            {/* Enrolled Courses Syllabus Peek */}
            <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 sm:p-7 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2A2F37] pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C5A059]" /> Enrolled Curriculum Modules
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('subjects')}
                  className="text-xs text-[#C5A059] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>Open Full Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {subjects.slice(0, 4).map(s => {
                  const topicCount = s.topics ? s.topics.length : (s.units ? s.units.flatMap(u => u.topics).length : 0);
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setCurrentSubjectId(s.id);
                        onNavigate('subjects');
                      }}
                      className="p-4 rounded-2xl bg-[#0B0D10] border border-[#2A2F37] hover:border-[#C5A059]/40 transition-all cursor-pointer group space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B22] text-[#E2C78E] border border-[#2A2F37]">
                          {s.courseCode || s.code || 'COURSE'}
                        </span>
                        <span className="text-xs font-mono text-teal-400 font-bold">
                          {s.progress || 0}%
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#E2C78E] transition-colors truncate">
                        {s.name || s.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{topicCount} Syllabus Topics</span>
                        <span className="text-[#C5A059] group-hover:translate-x-0.5 transition-transform">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Study Plan Checklist */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#12151A] border border-[#2A2F37] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#2A2F37] pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A059]" /> Daily Study Plan
                </span>
                <span className="text-xs font-mono text-[#E2C78E]">
                  {completedCount}/{studyPlan.length} Done
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#0B0D10] rounded-full overflow-hidden border border-[#2A2F37]">
                <div 
                  className="h-full bg-[#C5A059] transition-all duration-300"
                  style={{ width: `${planProgress}%` }}
                />
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {studyPlan.length > 0 ? (
                  studyPlan.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleStudyPlanItem(item.id)}
                      className={`p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                        item.completed
                          ? 'bg-[#0B0D10]/60 border-[#2A2F37] text-slate-500 line-through'
                          : 'bg-[#0B0D10] border-[#2A2F37] hover:border-[#C5A059]/40 text-slate-200'
                      }`}
                    >
                      <button type="button" className="mt-0.5 shrink-0 text-[#C5A059]">
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 truncate">
                        <span className="font-medium block truncate">{item.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>{item.time}</span>
                          <span>•</span>
                          <span>{item.durationMinutes}m</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    No study plan items scheduled for today.
                  </div>
                )}
              </div>

              {/* Add Study Plan Form Trigger */}
              {!showAddPlan ? (
                <button
                  type="button"
                  onClick={() => setShowAddPlan(true)}
                  className="w-full py-2 rounded-xl bg-[#171B22] hover:bg-[#1E242E] border border-[#2A2F37] text-xs font-semibold text-[#E2C78E] hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Study Goal</span>
                </button>
              ) : (
                <form onSubmit={handleAddPlan} className="space-y-2 pt-2 border-t border-[#2A2F37]">
                  <input
                    type="text"
                    value={newPlanTitle}
                    onChange={e => setNewPlanTitle(e.target.value)}
                    placeholder="E.g. Review reaction mechanisms"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#0B0D10] border border-[#2A2F37] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={newPlanTime}
                      onChange={e => setNewPlanTime(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-[#0B0D10] border border-[#2A2F37] text-xs text-slate-200"
                    />
                    <select
                      value={newPlanDuration}
                      onChange={e => setNewPlanDuration(e.target.value)}
                      className="px-2 py-1 rounded-lg bg-[#0B0D10] border border-[#2A2F37] text-xs text-slate-200"
                    >
                      <option value="15">15m</option>
                      <option value="25">25m</option>
                      <option value="45">45m</option>
                      <option value="60">60m</option>
                    </select>
                    <button
                      type="submit"
                      className="flex-1 py-1 rounded-lg bg-[#C5A059] hover:bg-[#D4B472] text-black font-bold text-xs"
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Add Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectModalOpen}
        onClose={() => setIsAddSubjectModalOpen(false)}
      />
    </div>
  );
};
