import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, BookOpen, Clock, Brain, Calendar, ArrowRight, Check, Plus, X, GraduationCap } from 'lucide-react';
import { LearningStyle, StudyDifficulty } from '../types';

export const OnboardingModal: React.FC = () => {
  const { profile, updateProfile, addSubject, addExam } = useStudy();
  const { user } = useAuth();

  // If user is not logged in or already onboarded, don't show
  if (!user || profile.onboarded) return null;

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [name, setName] = useState(user.name || profile.name || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [college, setCollege] = useState(profile.college || '');
  const [yearSemester, setYearSemester] = useState(profile.yearSemester || 'Year 2 • Semester 3');
  
  // Subjects input
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');

  // Learning style
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('visual');

  // Daily study time
  const [dailyStudyTime, setDailyStudyTime] = useState('2-3 hours');

  // Difficulties
  const [difficulties, setDifficulties] = useState<StudyDifficulty[]>([
    'remembering-info',
    'revising-before-exams'
  ]);

  // Upcoming Exam
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  const learningStyleOptions: Array<{ id: LearningStyle; title: string; desc: string }> = [
    { id: 'visual', title: 'Visual', desc: 'Mind maps, diagrams, concept charts & spatial organization' },
    { id: 'conceptual', title: 'Conceptual', desc: 'First-principles breakdowns, foundational logic & mental models' },
    { id: 'example-based', title: 'Example-based', desc: 'Real-world analogies, code snippets & case studies' },
    { id: 'short', title: 'Short & Concise', desc: 'Ultra-condensed summaries, cheat sheets & quick takeaways' },
    { id: 'detailed', title: 'Detailed', desc: 'Rigorous explanations, step-by-step proofs & full notes' },
    { id: 'practice-heavy', title: 'Practice-heavy', desc: 'Active recall drills, practice problems & mock quizzes' },
    { id: 'combination', title: 'Mixed / Balanced', desc: 'Adaptive blend of concepts, analogies, and quizzes' }
  ];

  const difficultyOptions: Array<{ id: StudyDifficulty; label: string }> = [
    { id: 'understanding-concepts', label: 'Understanding abstract concepts' },
    { id: 'remembering-info', label: 'Remembering formulas & definitions' },
    { id: 'starting-to-study', label: 'Overcoming procrastination to start' },
    { id: 'staying-focused', label: 'Staying focused during long sessions' },
    { id: 'solving-problems', label: 'Applying theory to hard exam problems' },
    { id: 'revising-before-exams', label: 'Retaining material before exams' },
    { id: 'managing-multiple-subjects', label: 'Balancing multiple heavy courses' }
  ];

  const handleAddSubject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newSubjectInput.trim() && !subjectList.includes(newSubjectInput.trim())) {
      setSubjectList([...subjectList, newSubjectInput.trim()]);
      setNewSubjectInput('');
    }
  };

  const handleRemoveSubject = (nameToRemove: string) => {
    setSubjectList(subjectList.filter(s => s !== nameToRemove));
  };

  const toggleDifficulty = (id: StudyDifficulty) => {
    if (difficulties.includes(id)) {
      setDifficulties(difficulties.filter(d => d !== id));
    } else {
      setDifficulties([...difficulties, id]);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);

    try {
      // 1. Create subjects on backend for this user
      const subjectsToCreate = subjectList.length > 0 ? subjectList : ['Data Structures', 'Database Systems'];
      for (const subjName of subjectsToCreate) {
        await addSubject({
          name: subjName,
          code: subjName.substring(0, 3).toUpperCase() + '101',
          description: `Syllabus topics and revision materials for ${subjName}.`,
          units: [
            {
              id: `u_${Date.now()}_1`,
              unitNumber: 1,
              title: `${subjName} — Unit 1: Foundations`,
              topics: [
                {
                  id: `t_${Date.now()}_1`,
                  name: `Introduction to ${subjName}`,
                  unitId: `u_${Date.now()}_1`,
                  subjectId: 'temp',
                  status: 'needs-revision',
                  quizScore: 0,
                  confidenceScore: 40,
                  lastReviewedDaysAgo: 1,
                  difficulty: 'medium',
                  notesCount: 0
                }
              ]
            }
          ]
        });
      }

      // 2. Add upcoming exam if provided
      if (examSubject && examDate) {
        await addExam(examSubject, examDate, 'A');
      }

      // 3. Update user profile to onboarded
      await updateProfile({
        name: name || user.name || 'Student',
        degree: degree || 'Engineering / Sciences',
        college,
        yearSemester,
        subjects: subjectsToCreate,
        preferredLearningStyle: learningStyle,
        dailyStudyTime,
        studyDifficulties: difficulties,
        onboarded: true
      });
    } catch (err) {
      console.error('Onboarding submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#12182a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Step Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800 bg-gradient-to-b from-[#182138] to-[#12182a]">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Onboarding</span>
            </div>
            <span className="text-xs font-mono text-slate-400">Step {step} of 4</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mt-3">
            Welcome to NOVA, {user.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Let's customize your personal study operating system to match your syllabus, learning style, and goals.
          </p>
        </div>

        {/* Wizard Steps */}
        <div className="p-6 space-y-6">
          {/* STEP 1: Academic Background */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                What are you studying?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Degree / Major</label>
                  <input
                    type="text"
                    value={degree}
                    onChange={e => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science, Pre-Med, Economics"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">College / University (Optional)</label>
                  <input
                    type="text"
                    value={college}
                    onChange={e => setCollege(e.target.value)}
                    placeholder="e.g. SPIT, Stanford, UCLA"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Year & Current Semester</label>
                  <input
                    type="text"
                    value={yearSemester}
                    onChange={e => setYearSemester(e.target.value)}
                    placeholder="e.g. 3rd Year • Semester 5"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Current Subjects */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Add your current subjects
              </h3>
              <p className="text-xs text-slate-400">
                Type each course or subject you're enrolled in this semester. NOVA will generate personalized revision plans and mind maps for each.
              </p>

              <form onSubmit={handleAddSubject} className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectInput}
                  onChange={e => setNewSubjectInput(e.target.value)}
                  placeholder="e.g. Computer Networks, Biochemistry, Macroeconomics"
                  className="flex-1 px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubject()}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* Subject Chips */}
              <div className="flex flex-wrap gap-2 pt-2 min-h-[60px] p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                {subjectList.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No subjects added yet. Type a subject name above and click Add.</span>
                ) : (
                  subjectList.map(subj => (
                    <div
                      key={subj}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 text-xs font-medium animate-fadeIn"
                    >
                      <span>{subj}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subj)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Quick suggestions */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-2">Quick popular suggestions:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['Data Structures', 'Database Systems', 'Operating Systems', 'Calculus III', 'Microbiology', 'Organic Chemistry'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (!subjectList.includes(s)) setSubjectList([...subjectList, s]);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Learning Style */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                How do you understand concepts best?
              </h3>
              <p className="text-xs text-slate-400">
                NOVA tailors explanations, notes, and interactive analogies to your cognitive learning style.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {learningStyleOptions.map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setLearningStyle(opt.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      learningStyle === opt.id
                        ? 'bg-cyan-500/10 border-cyan-500/60 shadow-sm shadow-cyan-900/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200">{opt.title}</span>
                      {learningStyle === opt.id && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Study Habits & Exam Target */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Daily Available Study Time
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {['1-2 hours', '2-3 hours', '3-4 hours', '5+ hours'].map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setDailyStudyTime(time)}
                      className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                        dailyStudyTime === time
                          ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Next Upcoming Exam (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={examSubject}
                    onChange={e => setExamSubject(e.target.value)}
                    placeholder="Exam Subject (e.g. Data Structures)"
                    className="px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400 block mb-2">
                  Areas you find challenging (Select all that apply):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {difficultyOptions.map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDifficulty(d.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        difficulties.includes(d.id)
                          ? 'bg-violet-500/15 border-violet-500 text-violet-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span>{d.label}</span>
                      {difficulties.includes(d.id) && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-6 pt-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinishOnboarding}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create My Study Space</span>
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
