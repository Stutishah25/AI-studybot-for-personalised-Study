import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { RecallQuestionPayload, EvaluationResponsePayload } from '../types';
import { 
  Target, 
  Sparkles, 
  Lightbulb, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  RotateCcw,
  Check,
  X
} from 'lucide-react';

interface RecallModeViewProps {
  initialTopic?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const RecallModeView: React.FC<RecallModeViewProps> = ({
  initialTopic = 'AVL Tree Rotations',
  onNavigate
}) => {
  const { currentSubject, updateTopicStatus } = useStudy();

  const [topicInput, setTopicInput] = useState(initialTopic);
  const [questionType, setQuestionType] = useState<string>('short-answer');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState<RecallQuestionPayload>({
    id: 'rq-1',
    topic: 'AVL Tree Rotations',
    questionType: 'short-answer',
    prompt: 'When a new node is inserted into the right subtree of a right child causing the AVL tree to become unbalanced (balance factor = -2), which single rotation is required to rebalance it?',
    hints: [
      'Think about the direct mirror of Left-Left (LL) insertion.',
      'The tree is heavy on the Right-Right side, so we rotate towards the left.'
    ],
    idealAnswer: 'A single Left Rotation (RR rotation) about the unbalanced node.',
    keyPointsExpected: [
      'Left rotation',
      'RR (Right-Right) imbalance case',
      'Restores balance factor back to -1, 0, or +1'
    ]
  });

  const [studentAnswer, setStudentAnswer] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [evaluation, setEvaluation] = useState<EvaluationResponsePayload | null>(null);

  const handleGenerateQuestion = async (topicToUse = topicInput) => {
    if (!topicToUse.trim()) return;
    setLoadingQuestion(true);
    setEvaluation(null);
    setStudentAnswer('');
    setHintsRevealed(0);

    try {
      const res = await fetch('/api/ai/recall-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || 'Computer Science',
          topic: topicToUse.trim(),
          questionType
        })
      });
      const data = await res.json();
      if (data.data) {
        setCurrentQuestion(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleEvaluateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim()) return;
    setLoadingEvaluation(true);

    try {
      const res = await fetch('/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.prompt,
          studentAnswer: studentAnswer.trim(),
          idealAnswer: currentQuestion.idealAnswer,
          keyPointsExpected: currentQuestion.keyPointsExpected
        })
      });
      const data = await res.json();
      if (data.data) {
        setEvaluation(data.data);

        // Dynamically update topic mastery
        if (data.data.score >= 80) {
          updateTopicStatus(currentSubject?.id || 'dsa', 't-avl', 'mastered', 15);
        } else if (data.data.score >= 50) {
          updateTopicStatus(currentSubject?.id || 'dsa', 't-avl', 'learning', 5);
        } else {
          updateTopicStatus(currentSubject?.id || 'dsa', 't-avl', 'needs-revision', -5);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvaluation(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
            <Target className="w-3.5 h-3.5" /> ACTIVE RECALL DRILL
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Active Retrieval & Rubric Evaluation
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Strengthen neural pathways by testing your brain without seeing answers upfront.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={questionType}
            onChange={e => setQuestionType(e.target.value)}
            className="bg-[#141b2e] border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            <option value="short-answer">Short Answer</option>
            <option value="mcq">Multiple Choice</option>
            <option value="explain-concept">Explain Concept</option>
            <option value="scenario">Scenario-Based</option>
          </select>
        </div>
      </div>

      {/* Drill Topic Input */}
      <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800/90 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={topicInput}
          onChange={e => setTopicInput(e.target.value)}
          placeholder="Topic to test (e.g. AVL Rotations, TCP Handshake, B-Trees)..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
        />
        <button
          type="button"
          onClick={() => handleGenerateQuestion()}
          disabled={loadingQuestion || !topicInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
        >
          <RefreshCw className={`w-4 h-4 ${loadingQuestion ? 'animate-spin' : ''}`} />
          <span>{loadingQuestion ? 'Generating...' : 'New Question'}</span>
        </button>
      </div>

      {/* Active Question Arena */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#111728] border border-slate-800/90 space-y-6 shadow-2xl">
        {/* Question Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
            Topic: {currentQuestion.topic}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 capitalize font-mono">
            {(currentQuestion.questionType || 'short-answer').replace(/-/g, ' ')}
          </span>
        </div>

        {/* Prompt Body */}
        <div className="space-y-3">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
            Question
          </span>
          <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
            {currentQuestion.prompt}
          </p>
        </div>

        {/* Multiple Choice Options if available */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setStudentAnswer(opt)}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                  studentAnswer === opt
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                    : 'bg-[#161e33] border-slate-700 text-slate-300 hover:bg-[#1b2640]'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Progressive Hint Reveal System */}
        {currentQuestion.hints && currentQuestion.hints.length > 0 && (
          <div className="p-4 rounded-xl bg-[#141c30] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Progressive Hint Ladder ({hintsRevealed}/{currentQuestion.hints.length})</span>
              </span>

              {hintsRevealed < currentQuestion.hints.length && (
                <button
                  type="button"
                  onClick={() => setHintsRevealed(h => h + 1)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium underline"
                >
                  Reveal Hint {hintsRevealed + 1}
                </button>
              )}
            </div>

            {hintsRevealed > 0 ? (
              <div className="space-y-1.5 pt-1">
                {currentQuestion.hints.slice(0, hintsRevealed).map((hint, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-[#0e1322] p-2 rounded-lg border border-slate-800">
                    <span className="text-amber-400 font-mono font-bold">Hint {idx + 1}:</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Stuck? Progressive hints nudge your memory without giving away the full answer.
              </p>
            )}
          </div>
        )}

        {/* Student Response Form */}
        <form onSubmit={handleEvaluateAnswer} className="space-y-4 pt-2">
          <label className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
            Your Answer (Explain in your own words)
          </label>
          <textarea
            rows={4}
            value={studentAnswer}
            onChange={e => setStudentAnswer(e.target.value)}
            placeholder="Type your explanation or answer here..."
            className="w-full p-4 rounded-xl bg-[#161f36] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 leading-relaxed font-sans"
          />

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={loadingEvaluation || !studentAnswer.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
            >
              <Send className="w-3.5 h-3.5 fill-black" />
              <span>{loadingEvaluation ? 'Evaluating with AI Rubric...' : 'Submit Answer'}</span>
            </button>
          </div>
        </form>

        {/* AI Evaluation Report */}
        {evaluation && (
          <div className="mt-6 p-6 rounded-2xl bg-[#131b2e] border border-violet-500/30 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Score & Verdict Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    evaluation.score >= 80
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      : evaluation.score >= 50
                      ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                      : 'bg-rose-950 text-rose-400 border border-rose-500/50'
                  }`}
                >
                  {evaluation.score}%
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {evaluation.score >= 80 ? 'Mastery Confirmed 🎉' : evaluation.score >= 50 ? 'Partial Recall ⚡' : 'Needs Revision 💡'}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Topic mastery status has been updated in your profile.
                  </span>
                </div>
              </div>
            </div>

            {/* Explanation Feedback */}
            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                Rubric Assessment
              </span>
              <p className="text-sm text-slate-200 leading-relaxed">
                {evaluation.explanation}
              </p>
            </div>

            {/* Strengths and Gaps Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> What You Got Right
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {evaluation.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-2">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                  <X className="w-4 h-4" /> Gaps / Missed Points
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {evaluation.gaps.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400">•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Ideal Reference Answer */}
            <div className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                Ideal Benchmark Answer
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {currentQuestion.idealAnswer}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-200">
                <strong className="text-violet-300">Recommended Next Step: </strong>
                {evaluation.recommendedAction}
              </div>
              <button
                type="button"
                onClick={() => onNavigate('tutor', { topic: currentQuestion.topic })}
                className="shrink-0 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Review with Tutor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
