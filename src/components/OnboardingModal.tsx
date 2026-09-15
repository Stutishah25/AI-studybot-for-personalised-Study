import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { LearningStyle, StudyDifficulty } from '../types';
import { NovaLogo } from './NovaLogo';
import { 
  Check, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useStudy();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [name, setName] = useState(profile.name || '');
  const [degree, setDegree] = useState(profile.degree || 'B.Tech Computer Engineering');
  const [yearSemester, setYearSemester] = useState(profile.yearSemester || '3rd Year / 5th Semester');
  const [subjectsText, setSubjectsText] = useState(profile.subjects.join(', '));
  const [syllabus, setSyllabus] = useState(profile.syllabus || '');
  const [examSubject, setExamSubject] = useState('Computer Networks');
  const [examDays, setExamDays] = useState('8');
  const [dailyStudyTime, setDailyStudyTime] = useState(profile.dailyStudyTime || '2.5 Hours');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>(profile.preferredLearningStyle || 'visual');
  const [difficulties, setDifficulties] = useState<StudyDifficulty[]>(profile.studyDifficulties || ['remembering', 'problems']);

  if (!isOpen) return null;

  const learningStyleOptions: Array<{ id: LearningStyle; title: string; desc: string; icon: string }> = [
    { id: 'visual', title: 'Visual', desc: 'Mind maps, flowcharts, architectural node diagrams', icon: '🧠' },
    { id: 'conceptual', title: 'Conceptual', desc: 'First-principles breakdowns, core abstractions, analogies', icon: '💡' },
    { id: 'example-based', title: 'Example-Based', desc: 'Step-by-step code samples, worked exercises', icon: '💻' },
    { id: 'short', title: 'Short & Punchy', desc: 'High-yield bullet points, 1-page summaries, formulas', icon: '⚡' },
    { id: 'detailed', title: 'Deep & Detailed', desc: 'Comprehensive academic rigor, proofs, full context', icon: '📚' },
    { id: 'practice-heavy', title: 'Practice-Heavy', desc: 'Active recall drills, quizzes, exam style questions', icon: '🎯' },
    { id: 'combination', title: 'Balanced Combination', desc: 'Dynamic mix adapted to subject complexity', icon: '✨' }
  ];

  const difficultyOptions: Array<{ id: StudyDifficulty; label: string }> = [
    { id: 'understanding', label: 'Understanding abstract concepts' },
    { id: 'remembering', label: 'Remembering formulas & details' },
    { id: 'starting', label: 'Starting to study (Procrastination)' },
    { id: 'focusing', label: 'Staying focused without distraction' },
    { id: 'problems', label: 'Solving difficult exam problems' },
    { id: 'revision', label: 'Revising before exam deadlines' },
    { id: 'multiple-subjects', label: 'Balancing multiple heavy subjects' }
  ];

  const toggleDifficulty = (id: StudyDifficulty) => {
    setDifficulties(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    const subjectsArray = subjectsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateProfile({
      name: name.trim() || 'Student',
      degree,
      yearSemester,
      subjects: subjectsArray.length ? subjectsArray : profile.subjects,
      syllabus: syllabus || profile.syllabus,
      dailyStudyTime,
      preferredLearningStyle: learningStyle,
      studyDifficulties: difficulties,
      upcomingExams: [
        { subject: examSubject, date: 'Upcoming', daysLeft: parseInt(examDays, 10) || 8 },
        ...profile.upcomingExams.slice(1)
      ],
      onboarded: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0f1422] border border-violet-500/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 bg-[#141b2d] flex items-center justify-between">
          <NovaLogo size="sm" showSubtitle={false} />
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
            <span>Step {step} of {totalSteps}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Welcome to NOVA</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h2>
                <p className="text-slate-400 text-sm">
                  Let's personalize your AI study companion to match your degree and targets.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Stuti"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182035] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Degree / Program</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182035] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Year / Semester</label>
                  <input
                    type="text"
                    value={yearSemester}
                    onChange={e => setYearSemester(e.target.value)}
                    placeholder="e.g. 3rd Year / 5th Semester"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182035] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Daily Study Target</label>
                  <select
                    value={dailyStudyTime}
                    onChange={e => setDailyStudyTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182035] border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-sm"
                  >
                    <option value="1 Hour">1 Hour / day</option>
                    <option value="2 Hours">2 Hours / day</option>
                    <option value="2.5 Hours">2.5 Hours / day</option>
                    <option value="3.5 Hours">3.5 Hours / day</option>
                    <option value="5+ Hours">5+ Hours / day (Exam crunch)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>Subjects & Upcoming Exams</span>
                </h2>
                <p className="text-slate-400 text-sm">
                  NOVA uses this to prioritize your daily revision schedule and weak topic radar.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Current Subjects (comma separated)</label>
                  <input
                    type="text"
                    value={subjectsText}
                    onChange={e => setSubjectsText(e.target.value)}
                    placeholder="Data Structures, DBMS, Computer Networks, Discrete Math..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182035] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#151c30] border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Next High-Priority Exam
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={examSubject}
                      onChange={e => setExamSubject(e.target.value)}
                      placeholder="Exam Subject Name"
                      className="px-3.5 py-2 rounded-lg bg-[#1a233b] border border-slate-700 text-white text-sm focus:border-cyan-400"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={examDays}
                        onChange={e => setExamDays(e.target.value)}
                        placeholder="Days left"
                        className="w-24 px-3.5 py-2 rounded-lg bg-[#1a233b] border border-slate-700 text-white text-sm focus:border-cyan-400"
                      />
                      <span className="text-slate-400 text-sm">days remaining</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Syllabus Overview / Target Chapters (Optional)</label>
                  <textarea
                    rows={3}
                    value={syllabus}
                    onChange={e => setSyllabus(e.target.value)}
                    placeholder="e.g. Unit 1: Trees & Rotations, Unit 2: Query Optimization, Unit 3: Virtual Memory & Paging..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#182035] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span>How Do You Learn Best?</span>
                </h2>
                <p className="text-slate-400 text-sm">
                  NOVA tunes all explanations, analogies, and mind maps to your specific cognitive style.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {learningStyleOptions.map(opt => {
                  const isSelected = learningStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLearningStyle(opt.id)}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-400/80 shadow-md shadow-violet-950/50'
                          : 'bg-[#151c30] border-slate-800 hover:border-slate-700 hover:bg-[#19223a]'
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-white">{opt.title}</span>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>What Makes Studying Difficult for You?</span>
                </h2>
                <p className="text-slate-400 text-sm">
                  Select all that apply. NOVA will actively deploy memory shortcuts, focus alarms, and active recall.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {difficultyOptions.map(diff => {
                  const isChecked = difficulties.includes(diff.id);
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => toggleDifficulty(diff.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-cyan-950/40 border-cyan-400/70 text-cyan-100'
                          : 'bg-[#151c30] border-slate-800 text-slate-300 hover:bg-[#19223a]'
                      }`}
                    >
                      <span className="text-sm font-medium">{diff.label}</span>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          isChecked
                            ? 'bg-cyan-500 border-cyan-400 text-black'
                            : 'border-slate-700 bg-[#121828]'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-[#141b2d] flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-950/40 flex items-center gap-1.5 transition-all"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 via-violet-600 to-amber-400 hover:opacity-95 text-white shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all"
            >
              Launch My Study Space <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
