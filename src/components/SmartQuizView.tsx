import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { QuizQuestionItem } from '../types';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Clock, 
  Target, 
  BookOpen, 
  SlidersHorizontal 
} from 'lucide-react';

interface SmartQuizViewProps {
  initialTopic?: string;
  initialSubject?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const SmartQuizView: React.FC<SmartQuizViewProps> = ({
  initialTopic = '',
  initialSubject,
  onNavigate
}) => {
  const { currentSubject, updateTopicStatus } = useStudy();

  const [topic, setTopic] = useState(initialTopic || currentSubject?.topics?.[0]?.name || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'exam-level'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  // Dynamic quiz state initialized to clean empty array (100% clean canvas, zero mock fallback)
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([]);

  // Auto-fetch if initialTopic was explicitly passed
  React.useEffect(() => {
    if (initialTopic && initialTopic.trim()) {
      setTopic(initialTopic.trim());
      handleFetchQuiz(initialTopic.trim());
    }
  }, [initialTopic]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleFetchQuiz = async (topicToOverride?: string) => {
    const targetTopic = topicToOverride || topic;
    if (!targetTopic || !targetTopic.trim()) return;
    setLoading(true);
    setQuizFinished(false);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsAnswerSubmitted(false);

    try {
      const res = await fetch('/api/ai/adaptive-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || currentSubject?.title || 'General Studies',
          topic: targetTopic.trim(),
          difficulty,
          count: questionCount
        })
      });
      const data = await res.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleConfirmAnswer = () => {
    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setIsAnswerSubmitted(false);
    } else {
      // Finish quiz
      setQuizFinished(true);

      // Calculate score and update topic mastery dynamically
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswerIndex) correct++;
      });
      const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

      const matchingTopic = currentSubject?.topics?.find(
        t => t.name.toLowerCase() === topic.toLowerCase()
      ) || currentSubject?.topics?.[0];

      if (currentSubject?.id && matchingTopic?.id) {
        if (accuracy >= 80) {
          updateTopicStatus(currentSubject.id, matchingTopic.id, 'mastered', 15);
        } else {
          updateTopicStatus(currentSubject.id, matchingTopic.id, 'needs-revision', -10);
        }
      }
    }
  };

  const currentQ = questions[currentIndex];
  const userSelected = selectedAnswers[currentIndex];

  // Calculate results
  const correctTotal = questions.filter(
    (q, idx) => selectedAnswers[idx] === q.correctAnswerIndex
  ).length;
  const accuracyPercent = Math.round((correctTotal / questions.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> SMART ADAPTIVE QUIZ
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Adaptive Knowledge Benchmark
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Dynamically adjusts difficulty to expose blind spots and verify deep conceptual understanding.
          </p>
        </div>
      </div>

      {/* Quiz Config Bar */}
      <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800/90 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder={
              currentSubject
                ? `Topic to test in ${currentSubject.name || currentSubject.title} (e.g. ${currentSubject.topics?.[0]?.name || 'Core Concept'})...`
                : "Topic to test (e.g. Enzyme Kinetics, Constitutional Law, Macroeconomics)..."
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={handleFetchQuiz}
            disabled={loading || !topic.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Quiz...' : 'Start New Quiz'}</span>
          </button>
        </div>

        {/* Difficulty & Count Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Difficulty:</span>
            {(['easy', 'medium', 'hard', 'exam-level'] as const).map(diff => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficulty(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  difficulty === diff
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'bg-[#182138] text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase">Questions:</span>
            {[3, 5, 10].map(cnt => (
              <button
                key={cnt}
                type="button"
                onClick={() => setQuestionCount(cnt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  questionCount === cnt
                    ? 'bg-cyan-500 text-black'
                    : 'bg-[#182138] text-slate-400 hover:text-slate-200'
                }`}
              >
                {cnt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Quiz Area OR Setup Board */}
      {!quizFinished ? (
        questions.length > 0 && currentQ ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#111728] border border-slate-800/90 space-y-6 shadow-2xl">
          {/* Quiz Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-400 font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-400 capitalize">Difficulty: {difficulty}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
              Question Prompt
            </span>
            <h3 className="text-lg sm:text-xl font-medium text-white leading-relaxed">
              {currentQ.question}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            {currentQ.options.map((option, idx) => {
              const isSelected = userSelected === idx;
              const isCorrect = idx === currentQ.correctAnswerIndex;

              let cardStyle = 'bg-[#151d32] border-slate-700/80 text-slate-200 hover:bg-[#1b2540]';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  cardStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                } else {
                  cardStyle = 'bg-[#12182b] border-slate-800 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-cyan-950/80 border-cyan-400 text-cyan-100 ring-1 ring-cyan-400';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${cardStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-black/40 border border-slate-700/80 flex items-center justify-center font-mono text-xs text-slate-300">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box on Answer Submission */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-[#162038] border border-cyan-500/30 space-y-1.5 animate-in fade-in duration-200">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase block">
                Explanation
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="flex justify-end gap-3 pt-2">
            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleConfirmAnswer}
                disabled={userSelected === undefined}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all disabled:opacity-50"
              >
                Confirm Choice
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-95 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        ) : (
          /* Empty State Board */
          <div className="p-10 rounded-2xl bg-[#111728] border border-slate-800/80 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400">
              <HelpCircle className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-lg font-bold text-white">
                Adaptive Knowledge Benchmark Ready
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test your recall, identify weak spots, and calibrate exam confidence. Select a topic or choose from your course curriculum below to launch.
              </p>
            </div>

            {currentSubject && currentSubject.topics && currentSubject.topics.length > 0 ? (
              <div className="space-y-3 pt-2 max-w-xl mx-auto">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Suggested Topics in {currentSubject.name || currentSubject.title}:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentSubject.topics.slice(0, 6).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTopic(t.name);
                        handleFetchQuiz(t.name);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#182138] hover:bg-[#202c4b] border border-slate-700/70 hover:border-cyan-500/50 text-xs text-slate-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('subjects')}
                  className="px-4 py-2 rounded-xl bg-[#182138] hover:bg-[#202c4b] border border-slate-700 text-xs font-semibold text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Go to Subject Workspace</span>
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* End Summary Report */
        <div className="p-8 rounded-2xl bg-[#111728] border border-violet-500/30 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mx-auto text-violet-300">
              <Award className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Quiz Complete!</h3>
            <p className="text-slate-400 text-sm">
              Here is your cognitive performance diagnostic for <strong>{topic}</strong>.
            </p>
          </div>

          {/* Score Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#161f36] border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Total Score</span>
              <span className="text-3xl font-black text-cyan-300">
                {correctTotal} / {questions.length}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#161f36] border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Accuracy</span>
              <span
                className={`text-3xl font-black ${
                  accuracyPercent >= 80 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {accuracyPercent}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#161f36] border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Topic Mastery Delta</span>
              <span className="text-3xl font-black text-violet-300">
                {accuracyPercent >= 80 ? '+15%' : '-10%'}
              </span>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="p-5 rounded-xl bg-violet-950/30 border border-violet-800/50 space-y-3">
            <span className="text-xs font-bold text-violet-300 uppercase tracking-wide block">
              Diagnostic Retention Feedback
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {accuracyPercent >= 80
                ? `Outstanding mastery of ${topic}! You have demonstrated robust conceptual recall and application. Schedule spaced repetition in 5 days.`
                : `Targeted review recommended for ${topic}. Revisit key principles and active examples in the Socratic Tutor to close remaining gaps.`}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('tutor', { topic })}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Open in AI Tutor
              </button>
              <button
                type="button"
                onClick={handleFetchQuiz}
                className="px-4 py-2 rounded-xl bg-[#182138] hover:bg-[#202d4b] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Adaptive Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
