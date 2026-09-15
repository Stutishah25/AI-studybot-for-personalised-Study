import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CornerDownLeft, 
  X, 
  Brain, 
  BookOpen, 
  Lightbulb, 
  Flame, 
  Clock, 
  FileText,
  Target
} from 'lucide-react';

interface CommandBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string, prefill?: { topic?: string; subject?: string }) => void;
}

export const CommandBarModal: React.FC<CommandBarModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { profile } = useStudy();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    intent?: string;
    suggestedRoute?: string;
    topic?: string;
    responseSummary?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAiResult(null);
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    { text: 'Explain recursion with an analogy', icon: Lightbulb, route: 'tutor' },
    { text: 'Make a mind map of DBMS', icon: Brain, route: 'mindmaps' },
    { text: 'Quiz me on BST', icon: Target, route: 'quiz' },
    { text: 'Create 1-page notes on paging', icon: FileText, route: 'notes' },
    { text: 'Give me a mnemonic for OSI layers', icon: Sparkles, route: 'memory-lab' },
    { text: 'I have 40 minutes. What should I study?', icon: Clock, route: 'home' },
    { text: 'What should I revise today?', icon: Flame, route: 'revision-radar' }
  ];

  const handleExecute = async (inputQuery: string) => {
    const q = inputQuery.trim();
    if (!q) return;
    setLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, profile })
      });
      const data = await res.json();
      if (data.data) {
        setAiResult(data.data);
      }
    } catch (err) {
      console.error(err);
      setAiResult({
        intent: 'explain',
        suggestedRoute: 'tutor',
        topic: q,
        responseSummary: `NOVA is ready to assist with "${q}". Click below to explore in the AI Tutor.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute(query);
    }
  };

  const handleSelectRoute = () => {
    if (!aiResult) return;
    onNavigate(aiResult.suggestedRoute || 'tutor', { topic: aiResult.topic || query });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0e1320] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-800 bg-[#131a2b] flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder="Ask NOVA to teach, summarize, test or plan..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleExecute(query)}
            disabled={loading || !query.trim()}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Run'}
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="p-5 max-h-[65vh] overflow-y-auto space-y-4">
          {aiResult ? (
            <div className="p-4 rounded-xl bg-[#161f36] border border-cyan-500/30 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> NOVA Recommendation
                </span>
                <span className="text-xs font-mono text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-800/80">
                  {aiResult.intent}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                {aiResult.responseSummary}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSelectRoute}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  Open in {(aiResult.suggestedRoute || 'tutor').replace(/-/g, ' ').toUpperCase()}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Suggested Commands
              </span>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setQuery(prompt.text);
                        handleExecute(prompt.text);
                      }}
                      className="p-3 rounded-xl bg-[#131929] hover:bg-[#192238] border border-slate-800/80 hover:border-cyan-500/40 text-left flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-800/80 group-hover:bg-cyan-950/60 flex items-center justify-center text-slate-300 group-hover:text-cyan-400 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-slate-200 group-hover:text-white font-medium">
                          "{prompt.text}"
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-[#101624] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">ESC</kbd> to close</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">↵</kbd> to execute</span>
          </div>
          <span className="text-cyan-400/80 font-mono">NOVA Intelligence Engine</span>
        </div>
      </div>
    </div>
  );
};
