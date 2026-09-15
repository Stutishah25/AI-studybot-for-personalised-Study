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
  initialTopic = 'Binary Search Trees & AVL',
  initialSubject,
  onNavigate
}) => {
  const { currentSubject, updateTopicStatus } = useStudy();

  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'exam-level'>('medium');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  // Quiz execution state
  const [questions, setQuestions] = useState<QuizQuestionItem[]>([
    {
      id: 'q1',
      question: 'What is the maximum balance factor allowed for any node in an AVL tree to remain valid?',
      options: ['0', '1', '2', '3'],
      correctAnswerIndex: 1,
      explanation: 'In AVL trees, the balance factor (Height(Left) - Height(Right)) must strictly be within {-1, 0, +1}. Any value of +2 or -2 triggers an immediate rotation.'
    },
    {
      id: 'q2',
      question: 'Which sequence of rotations balances a Left-Right (LR) heavy subtree imbalance?',
      options: [
        'Single Left rotation',
        'Single Right rotation',
        'Left rotation on child, then Right rotation on parent',
        'Right rotation on child, then Left rotation on parent'
      ],
      correctAnswerIndex: 2,
      explanation: 'An LR imbalance requires a double rotation: first a Left rotation on the left child, followed by a Right rotation on the parent node.'
    },
    {
      id: 'q3',
      question: 'What is the worst-case search time complexity in a self-balancing AVL tree with N nodes?',
      options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
      correctAnswerIndex: 1,
      explanation: 'Because AVL trees guarantee that the height is strictly bounded by ~1.44 * log2(N), the worst-case search complexity is strictly O(log N).'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleFetchQuiz = async () => {
    if (!topic.trim()) return;
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
          subject: currentSubject?.name || 'Computer Science',
          topic: topic.trim(),
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

      // Calculate score and update topic mastery
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswerIndex) correct++;
      });
      const accuracy = Math.round((correct / questions.length) * 100);

      if (accuracy >= 80) {
        updateTopicStatus(currentSubject?.id || 'dsa', 't-avl', 'mastered', 15);
      } else {
        updateTopicStatus(currentSubject?.id || 'dsa', 't-avl', 'needs-revision', -10);
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
            placeholder="Topic to test (e.g. Trees, B-Trees, Normalization, Paging)..."
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

      {/* Main Quiz Area */}
      {!quizFinished ? (
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
              Recommended Revision Plan
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {accuracyPercent >= 80
                ? 'Excellent retention! Your understanding of tree invariants and rotations is solid. Schedule your next revision in 5 days.'
                : 'Double rotations (LR / RL) caused hesitation. Review the simple see-saw analogy and worked C++ example in the AI Tutor before moving to Graphs.'}
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
