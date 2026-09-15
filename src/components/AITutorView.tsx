import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { TutorActionType, TutorResponsePayload } from '../types';
import { 
  Sparkles, 
  Send, 
  Lightbulb, 
  BookOpen, 
  Brain, 
  Zap, 
  HelpCircle, 
  Baby, 
  Award, 
  ListChecks, 
  Bookmark, 
  Network, 
  Check, 
  AlertCircle,
  Copy,
  ChevronDown,
  CornerDownLeft
} from 'lucide-react';

interface AITutorViewProps {
  initialTopic?: string;
  initialSubject?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  initialTopic = 'AVL Tree Rotations',
  initialSubject,
  onNavigate
}) => {
  const { 
    profile, 
    subjects, 
    currentSubject, 
    currentSubjectId, 
    setCurrentSubjectId, 
    addNote, 
    addMemoryShortcut,
    saveMindMap
  } = useStudy();

  const [topic, setTopic] = useState(initialTopic);
  const [selectedAction, setSelectedAction] = useState<TutorActionType>('explain-simply');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [savedShortcut, setSavedShortcut] = useState(false);

  // Selected answer in the mini quiz
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Initial rich sample response so it never looks empty
  const [tutorData, setTutorData] = useState<TutorResponsePayload>({
    topic: 'AVL Tree Rotations',
    action: 'explain-simply',
    explanation:
      'An AVL tree is a self-balancing Binary Search Tree where the height difference (Balance Factor) between left and right subtrees cannot exceed 1. When an insertion or deletion throws this balance off (Balance Factor becomes +2 or -2), the tree restores balance immediately using rotations: Left Rotation (LL), Right Rotation (RR), Left-Right (LR), or Right-Left (RL).',
    analogy:
      'Imagine balancing a see-saw with books. If one kid stacks too many books on the far right end, the see-saw tips violently. Instead of rebuilding the entire playground, you simply nudge the center pivot toward the heavier side so both sides level out smoothly.',
    coreIdea:
      'Rotations swap ancestor-descendant links to reduce tree height back to O(log N) without violating the Binary Search Tree invariant (left < root < right).',
    example:
      '// Right Rotation (RR) when Left Subtree is too heavy:\nNode* rightRotate(Node* y) {\n    Node* x = y->left;\n    Node* T2 = x->right;\n    x->right = y;\n    y->left = T2;\n    // Update heights\n    y->height = max(height(y->left), height(y->right)) + 1;\n    x->height = max(height(x->left), height(x->right)) + 1;\n    return x; // New root\n}',
    commonMistakes: [
      'Forgetting to update the heights of both the old and new root after swapping pointers.',
      'Confusing Left-Right (LR) with Right-Left (RL): In LR, we first rotate the child LEFT, then the parent RIGHT.',
      'Assuming rotations alter the in-order traversal of the tree (in-order remains strictly sorted!).'
    ],
    memoryShortcut: 'LL needs R rotation. RR needs L rotation. Opposite directions restore equilibrium!',
    miniQuiz: {
      question: 'In an AVL tree, what is the balance factor of a perfectly balanced node with equal left and right subtree heights?',
      options: ['-1', '0', '+1', 'Any number'],
      correctAnswerIndex: 1,
      explanation: 'Balance Factor is defined as Height(Left) - Height(Right). When both heights are equal, the difference is 0.'
    }
  });

  const actionButtons: Array<{ id: TutorActionType; label: string; icon: React.ElementType }> = [
    { id: 'explain-simply', label: 'Explain Simply', icon: Lightbulb },
    { id: 'give-example', label: 'Give Example', icon: BookOpen },
    { id: 'make-notes', label: 'Make Notes', icon: Bookmark },
    { id: 'create-mindmap', label: 'Create Mind Map', icon: Network },
    { id: 'give-shortcut', label: 'Give Shortcut', icon: Zap },
    { id: 'test-me', label: 'Test Me', icon: HelpCircle },
    { id: 'explain-like-im-10', label: 'Explain Like I’m 10', icon: Baby },
    { id: 'exam-answer', label: 'Exam Answer', icon: Award },
    { id: 'give-practice-questions', label: 'Practice Questions', icon: ListChecks }
  ];

  const handleFetchTutor = async (actionToUse = selectedAction) => {
    if (!topic.trim()) return;
    setLoading(true);
    setSelectedAction(actionToUse);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    setSavedNote(false);
    setSavedShortcut(false);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || 'Computer Science',
          topic: topic.trim(),
          action: actionToUse,
          profile
        })
      });
      const data = await res.json();
      if (data.data) {
        setTutorData(data.data);
      }
    } catch (err) {
      console.error('Error fetching tutor response:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    addNote({
      title: `${tutorData.topic || 'Concept'} — ${(tutorData.action || 'explain-simply').replace(/-/g, ' ').toUpperCase()}`,
      subject: currentSubject?.name || 'General',
      type: 'detailed',
      summary: tutorData.coreIdea,
      content: `${tutorData.explanation}\n\n### Analogy\n${tutorData.analogy}\n\n### Example\n\`\`\`\n${tutorData.example}\n\`\`\`\n\n### Key Takeaway\n${tutorData.coreIdea}`,
      tags: ['AI Tutor', currentSubject?.code || 'CS', tutorData.topic]
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  const handleSaveShortcut = () => {
    if (!tutorData.memoryShortcut) return;
    addMemoryShortcut({
      concept: tutorData.topic,
      subject: currentSubject?.name || 'General',
      mnemonic: tutorData.memoryShortcut,
      visualAssociation: tutorData.analogy,
      whyItWorks: 'Ties spatial rotations to equilibrium balance.',
      tags: ['AI Generated', 'Tutor']
    });
    setSavedShortcut(true);
    setTimeout(() => setSavedShortcut(false), 2500);
  };

  const handleOpenMindMap = () => {
    onNavigate('mindmaps', { topic: tutorData.topic, subject: currentSubject?.name });
  };

  const handleCopyText = () => {
    const fullText = `${tutorData.topic}\n\n${tutorData.explanation}\n\nAnalogy:\n${tutorData.analogy}\n\nCore Idea:\n${tutorData.coreIdea}\n\nExample:\n${tutorData.example}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
            <Sparkles className="w-3.5 h-3.5" /> NOVA AI STUDY TUTOR
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Context-Aware Subject Tutor
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Tailored to your <strong className="text-violet-300 capitalize">{profile.preferredLearningStyle}</strong> learning profile.
          </p>
        </div>

        {/* Context Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={currentSubjectId}
              onChange={e => setCurrentSubjectId(e.target.value)}
              className="bg-[#141b2e] border border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400 appearance-none pr-7"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Interactive Prompt & Action Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#12182a] border border-slate-800/90 space-y-4 shadow-lg">
        {/* Topic Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetchTutor()}
            placeholder="Enter any concept or topic (e.g. Red-Black Trees, ACID Properties, Cache Coherence)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => handleFetchTutor()}
            disabled={loading || !topic.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-cyan-950/40"
          >
            {loading ? 'Teaching...' : 'Teach'}
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Action Prompt Buttons */}
        <div className="flex flex-wrap gap-2 pt-1">
          {actionButtons.map(btn => {
            const Icon = btn.icon;
            const isCurrent = selectedAction === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleFetchTutor(btn.id)}
                disabled={loading}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isCurrent
                    ? 'bg-violet-600 text-white border border-violet-400/80 shadow-sm'
                    : 'bg-[#182138] text-slate-300 hover:bg-[#202c4b] border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rich Structured Tutor Response Layout */}
      <div className="rounded-2xl bg-[#111728] border border-slate-800/90 overflow-hidden shadow-xl">
        {/* Response Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800/90 bg-[#141c30] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              {tutorData.topic}
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-xs font-medium text-violet-300 capitalize">
              {(tutorData.action || 'explain').replace(/-/g, ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Response Content Body */}
        <div className="p-6 md:p-8 space-y-6 font-sans">
          {/* 1. Main Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Explanation
            </h3>
            <p className="text-slate-100 text-base leading-relaxed whitespace-pre-line">
              {tutorData.explanation}
            </p>
          </div>

          {/* 2. Simple Analogy Box */}
          {tutorData.analogy && (
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-wide">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Simple Real-World Analogy</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans italic">
                "{tutorData.analogy}"
              </p>
            </div>
          )}

          {/* 3. Core Idea Box */}
          {tutorData.coreIdea && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Core Takeaway & Principle</span>
              </div>
              <p className="text-sm font-medium text-cyan-100 leading-relaxed">
                {tutorData.coreIdea}
              </p>
            </div>
          )}

          {/* 4. Concrete Code / Math Example */}
          {tutorData.example && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Concrete Example / Implementation
              </h3>
              <pre className="p-4 rounded-xl bg-[#090d18] border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed">
                <code>{tutorData.example}</code>
              </pre>
            </div>
          )}

          {/* 5. Common Mistakes List */}
          {tutorData.commonMistakes && tutorData.commonMistakes.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Common Traps & Exam Pitfalls
              </h3>
              <ul className="space-y-2">
                {tutorData.commonMistakes.map((mistake, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2.5 bg-[#141b2d] p-2.5 rounded-lg border border-slate-800"
                  >
                    <span className="text-amber-400 font-bold shrink-0">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Memory Shortcut Hook */}
          {tutorData.memoryShortcut && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Memory Lab Shortcut</span>
                </div>
                <p className="text-sm font-semibold text-white tracking-wide">
                  "{tutorData.memoryShortcut}"
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveShortcut}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-medium transition-colors"
              >
                {savedShortcut ? 'Saved! ⭐' : 'Save Shortcut'}
              </button>
            </div>
          )}

          {/* 7. Interactive Mini Quiz */}
          {tutorData.miniQuiz && (
            <div className="p-5 rounded-xl bg-[#141c30] border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Instant Knowledge Check
                </span>
                <span className="text-[10px] text-slate-400">1 Question Drill</span>
              </div>

              <p className="text-sm font-medium text-white">
                {tutorData.miniQuiz.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {tutorData.miniQuiz.options.map((opt, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  const isCorrect = idx === tutorData.miniQuiz?.correctAnswerIndex;
                  let btnStyle = 'bg-[#182138] border-slate-700 text-slate-200 hover:bg-[#1f2b48]';

                  if (quizSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-cyan-950/70 border-cyan-400 text-cyan-200';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedQuizOption(idx);
                        setQuizSubmitted(true);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <div className="p-3 rounded-lg bg-[#0e1322] border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-300">Explanation: </strong>
                  {tutorData.miniQuiz.explanation}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Response Action Integration Footer */}
        <div className="px-6 py-4 border-t border-slate-800/90 bg-[#141c30] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-mono">
            Direct Workspace Integrations:
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToNotes}
              className="px-3.5 py-1.5 rounded-xl bg-[#192238] hover:bg-[#202c48] border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>{savedNote ? 'Saved in Notes Studio!' : 'Save to Notes'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenMindMap}
              className="px-3.5 py-1.5 rounded-xl bg-[#192238] hover:bg-[#202c48] border border-slate-700 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 transition-colors"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Visualize as Mind Map</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('recall', { topic: tutorData.topic, subject: currentSubject?.name })}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shadow-md"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Launch Active Recall</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
