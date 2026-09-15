import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { MemoryShortcutItem } from '../types';
import { 
  Zap, 
  Sparkles, 
  Plus, 
  Copy, 
  Trash2, 
  BookOpen, 
  Lightbulb, 
  Check, 
  Layers, 
  HelpCircle,
  Brain
} from 'lucide-react';

interface MemoryLabViewProps {
  initialTopic?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const MemoryLabView: React.FC<MemoryLabViewProps> = ({
  initialTopic = 'OSI 7 Layers',
  onNavigate
}) => {
  const { memoryShortcuts, addMemoryShortcut, deleteMemoryShortcut, currentSubject } = useStudy();

  const [topicInput, setTopicInput] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom shortcut creator modal/form
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customConcept, setCustomConcept] = useState('');
  const [customMnemonic, setCustomMnemonic] = useState('');
  const [customVisual, setCustomVisual] = useState('');
  const [customWhy, setCustomWhy] = useState('');

  const handleGenerateShortcut = async () => {
    if (!topicInput.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/shortcut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || 'Computer Science',
          concept: topicInput.trim()
        })
      });
      const data = await res.json();
      if (data.data) {
        addMemoryShortcut({
          concept: data.data.concept || topicInput.trim(),
          subject: currentSubject?.name || 'General Studies',
          mnemonic: data.data.mnemonic || '',
          story: data.data.story,
          visualAssociation: data.data.visualAssociation,
          whyItWorks: data.data.whyItWorks,
          tags: ['AI Generated', currentSubject?.code || 'CS']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customConcept.trim() || !customMnemonic.trim()) return;

    addMemoryShortcut({
      concept: customConcept.trim(),
      subject: currentSubject?.name || 'Custom',
      mnemonic: customMnemonic.trim(),
      visualAssociation: customVisual.trim() || undefined,
      whyItWorks: customWhy.trim() || 'Custom associative peg hook',
      tags: ['Student Created']
    });

    setCustomConcept('');
    setCustomMnemonic('');
    setCustomVisual('');
    setCustomWhy('');
    setShowCustomModal(false);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono mb-1.5">
            <Zap className="w-3.5 h-3.5" /> MEMORY SHORTCUT ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cognitive Hooks & Mnemonics Lab
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Anchor difficult abstract rules into permanent memory using visual associations, rhymes, and stories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#141b2e] hover:bg-[#182138] border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4 text-cyan-400" /> Create Custom Shortcut
        </button>
      </div>

      {/* AI Mnemonic Generator Bar */}
      <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800/90 space-y-3 shadow-xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateShortcut()}
            placeholder="Difficult concept to memorize (e.g. ACID Properties, CPU Scheduling Algorithms, OSI Layers)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={handleGenerateShortcut}
            disabled={loading || !topicInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-90 text-black font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{loading ? 'Forging Hook...' : 'Generate Shortcut'}</span>
          </button>
        </div>
      </div>

      {/* Custom Shortcut Creator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e1320] border border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Create Memory Shortcut
            </h3>
            <form onSubmit={handleCreateCustom} className="space-y-3">
              <input
                type="text"
                placeholder="Concept (e.g. Deadlock 4 Coffman Conditions)"
                value={customConcept}
                onChange={e => setCustomConcept(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#182138] border border-slate-700 text-white text-xs"
                required
              />
              <input
                type="text"
                placeholder="Mnemonic / Acronym (e.g. Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait -> MHNC)"
                value={customMnemonic}
                onChange={e => setCustomMnemonic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#182138] border border-slate-700 text-white text-xs"
                required
              />
              <textarea
                placeholder="Visual Association / Story (e.g. Imagine a traffic gridlock where 4 cars refuse to yield...)"
                rows={2}
                value={customVisual}
                onChange={e => setCustomVisual(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#182138] border border-slate-700 text-white text-xs"
              />
              <input
                type="text"
                placeholder="Why it works (Cognitive Reason)"
                value={customWhy}
                onChange={e => setCustomWhy(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#182138] border border-slate-700 text-white text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vault Grid of Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memoryShortcuts.map(item => (
          <div
            key={item.id}
            className="rounded-2xl bg-[#12182b] border border-slate-800/80 hover:border-amber-500/40 p-6 flex flex-col justify-between space-y-4 shadow-xl group transition-all"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  {item.subject}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.id, `${item.concept}: ${item.mnemonic}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#182138] transition-colors"
                  title="Copy Shortcut"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Concept Title */}
              <h3 className="text-lg font-bold text-white tracking-tight">
                {item.concept}
              </h3>

              {/* Mnemonic Hook Banner */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-violet-950/40 border border-amber-500/30">
                <span className="text-[10px] uppercase tracking-wider font-mono text-amber-300 block mb-1">
                  Mnemonic Phrase
                </span>
                <p className="text-sm font-bold text-white tracking-wide">
                  "{item.mnemonic}"
                </p>
              </div>

              {/* Visual or Narrative */}
              {item.story && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Narrative Story Hook
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{item.story}"
                  </p>
                </div>
              )}

              {item.visualAssociation && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    Mental Visual Model
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.visualAssociation}
                  </p>
                </div>
              )}

              {item.whyItWorks && (
                <div className="p-2.5 rounded-lg bg-[#0e1322] border border-slate-800 text-[11px] text-slate-400">
                  <strong className="text-amber-300 font-semibold">Why it works: </strong>
                  {item.whyItWorks}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('tutor', { topic: item.concept })}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Tutor
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => onNavigate('recall', { topic: item.concept })}
                  className="text-xs text-violet-300 hover:text-violet-200 font-medium flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Practice
                </button>
              </div>

              <button
                type="button"
                onClick={() => deleteMemoryShortcut(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                title="Delete Shortcut"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
