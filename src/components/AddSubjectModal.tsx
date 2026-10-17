import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { AcademicLevel, AcademicStream } from '../types';
import {
  BookOpen,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  X,
  Check,
  ChevronRight,
  AlertCircle,
  Clock,
  ArrowRight,
  Lightbulb,
  FileText
} from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectCreated?: (subjectId: string) => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onSubjectCreated
}) => {
  const { addSubject, subjects } = useStudy();
  const { user } = useAuth();

  // Form State
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>(
    user?.academicLevel || 'Undergrad'
  );
  const [stream, setStream] = useState<AcademicStream>(
    user?.stream || 'Computer Science'
  );
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [targetExamDate, setTargetExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 35);
    return d.toISOString().split('T')[0];
  });
  const [customNotes, setCustomNotes] = useState('');
  const [accentColor, setAccentColor] = useState('#38bdf8');
  const [colorTheme, setColorTheme] = useState('cyan');

  // Interactive generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreviewTopics, setGeneratedPreviewTopics] = useState<Array<{ name: string; difficulty: 'easy' | 'medium' | 'hard'; summary: string }> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync initial stream/level with user profile when modal opens
  useEffect(() => {
    if (user?.academicLevel) setAcademicLevel(user.academicLevel);
    if (user?.stream) setStream(user.stream);
  }, [user, isOpen]);

  // Quick subject suggestions based on stream and academic level
  const suggestions: Record<AcademicStream, string[]> = {
    'Computer Science': [
      'Software Engineering & Systems',
      'Operating Systems & Architecture',
      'Database Systems & Analytics',
      'Computer Networks & Protocols',
      'Theory of Computation'
    ],
    'Pre-Med': [
      'Organic Chemistry I & II',
      'Human Anatomy & Physiology',
      'Biochemistry & Metabolism',
      'General Microbiology',
      'Cellular & Molecular Biology'
    ],
    'Business/Econ': [
      'Principles of Microeconomics',
      'Corporate Finance & Valuation',
      'Financial Accounting',
      'Marketing & Consumer Strategy',
      'Macroeconomic Policy'
    ],
    'Law': [
      'Constitutional Law',
      'Contracts & Commercial Law',
      'Torts & Civil Liability',
      'Criminal Law & Procedure',
      'Legal Research & Writing'
    ],
    'Humanities': [
      'World History & Civilizations',
      'Literary Analysis & Criticism',
      'Introduction to Moral Philosophy',
      'Sociological Foundations',
      'Rhetoric & Argumentation'
    ],
    'General': [
      'Calculus & Mathematical Modeling',
      'General Chemistry',
      'Physics: Mechanics & Waves',
      'Psychology: Human Behavior',
      'Critical Thinking & Logic'
    ]
  };

  const levelOptions: Array<{ value: AcademicLevel; label: string; desc: string }> = [
    { value: 'Middle School', label: 'Middle School', desc: 'Grades 6–8' },
    { value: 'High School', label: 'High School', desc: 'Grades 9–12' },
    { value: 'AP/IB', label: 'AP / IB', desc: 'Advanced Placement & Diploma' },
    { value: 'Undergrad', label: 'Undergraduate', desc: 'College & University' },
    { value: 'Postgrad', label: 'Postgraduate', desc: 'Master’s / PhD / Law / Med' }
  ];

  const streamOptions: Array<{ value: AcademicStream; label: string; icon: string }> = [
    { value: 'Computer Science', label: 'Computer Science', icon: '💻' },
    { value: 'Pre-Med', label: 'Pre-Med / Health', icon: '🩺' },
    { value: 'Business/Econ', label: 'Business & Econ', icon: '📈' },
    { value: 'Law', label: 'Law & Jurisprudence', icon: '⚖️' },
    { value: 'Humanities', label: 'Humanities & Arts', icon: '📚' },
    { value: 'General', label: 'General / STEM', icon: '🔬' }
  ];

  const colorPalettes = [
    { name: 'cyan', hex: '#38bdf8', label: 'Cyan' },
    { name: 'violet', hex: '#a78bfa', label: 'Violet' },
    { name: 'emerald', hex: '#34d399', label: 'Emerald' },
    { name: 'amber', hex: '#fbbf24', label: 'Amber' },
    { name: 'rose', hex: '#fb7185', label: 'Rose' },
    { name: 'indigo', hex: '#818cf8', label: 'Indigo' }
  ];

  // Auto-generate course code when title changes
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!courseCode || courseCode.length <= 6) {
      const letters = val.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase();
      if (letters) {
        setCourseCode(`${letters}101`);
      }
    }
  };

  const calculateDaysLeft = () => {
    if (!targetExamDate) return null;
    const diff = new Date(targetExamDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a subject title.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await addSubject({
        title: title.trim(),
        name: title.trim(),
        courseCode: (courseCode.trim() || `${title.slice(0, 3).toUpperCase()}101`),
        code: (courseCode.trim() || `${title.slice(0, 3).toUpperCase()}101`),
        academicLevel,
        stream,
        targetExamDate,
        color: colorTheme,
        accentColor,
        customNotes: customNotes.trim(),
        description: customNotes.trim() || `Course curriculum for ${title.trim()} (${academicLevel} • ${stream})`,
        topics: generatedPreviewTopics ? generatedPreviewTopics.map((pt, idx) => ({
          id: `t_${Date.now()}_${idx}`,
          name: pt.name,
          difficulty: pt.difficulty,
          summary: pt.summary,
          quizScore: 0,
          confidenceScore: 35,
          status: 'needs-revision',
          lastReviewedDaysAgo: 0
        })) : undefined
      } as any);

      // Reset & close
      setTitle('');
      setCourseCode('');
      setCustomNotes('');
      setGeneratedPreviewTopics(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create subject. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const daysLeft = calculateDaysLeft();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#060912]/80 backdrop-blur-md"
          />

          {/* Modal Container with Spring Physics */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 320
            }}
            className="relative w-full max-w-2xl bg-[#0f1422] border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Top Glowing Header Accent */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500" />

            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between bg-gradient-to-b from-[#141b2e] to-[#0f1422]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>UNIVERSAL CURRICULUM ARCHITECT</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Add Custom Subject
                </h2>
                <p className="text-xs text-slate-400">
                  NOVA auto-generates 6–8 syllabus topics calibrated to your exact grade level and academic stream.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1. Academic Level Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-cyan-400" /> Academic Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {levelOptions.map(lvl => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setAcademicLevel(lvl.value)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        academicLevel === lvl.value
                          ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-sm ring-1 ring-cyan-500/40'
                          : 'bg-[#121828] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-bold leading-tight truncate">{lvl.label}</span>
                      <span className="block text-[10px] text-slate-500 truncate mt-0.5">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Stream Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-violet-400" /> Academic Stream / Domain
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {streamOptions.map(st => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setStream(st.value)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                        stream === st.value
                          ? 'bg-violet-500/15 border-violet-500/60 text-white shadow-sm ring-1 ring-violet-500/40'
                          : 'bg-[#121828] border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{st.icon}</span>
                      <span className="text-xs font-semibold truncate">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Subject Title & Course Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Subject Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => handleTitleChange(e.target.value)}
                    placeholder="e.g. Organic Chemistry, Macroeconomics, AP Biology"
                    className="w-full px-3.5 py-2.5 bg-[#121828] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Course Code
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={e => setCourseCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CHEM201"
                    className="w-full px-3.5 py-2.5 bg-[#121828] border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Quick Topic Chips Suggestions */}
              {suggestions[stream] && (
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Common {stream} courses:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions[stream].map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => handleTitleChange(sug)}
                        className="px-2.5 py-1 rounded-lg bg-[#141b2e] border border-slate-800/80 text-[11px] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Target Exam Date & Visual Palette */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Target Exam / Assessment Date
                    </span>
                    {daysLeft !== null && (
                      <span className="text-[11px] font-mono text-cyan-300">
                        {daysLeft} days left
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={targetExamDate}
                    onChange={e => setTargetExamDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#121828] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Subject Color Accent
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {colorPalettes.map(palette => (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => {
                          setColorTheme(palette.name);
                          setAccentColor(palette.hex);
                        }}
                        style={{ backgroundColor: palette.hex }}
                        className={`w-7 h-7 rounded-lg transition-transform ${
                          colorTheme === palette.name
                            ? 'ring-2 ring-white scale-110 shadow-lg'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        title={palette.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Custom Syllabus Notes (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Syllabus Notes / Focus Areas (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={e => setCustomNotes(e.target.value)}
                  placeholder="Paste specific topics, chapters, or textbook units you want NOVA to prioritize..."
                  className="w-full px-3.5 py-2 bg-[#121828] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit & Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  NOVA will auto-generate 6–8 topics upon creation.
                </p>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isGenerating || !title.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        <span>Generating Curriculum...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                        <span>Create Subject & Syllabus</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
