import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  Archive, 
  Search, 
  FileText, 
  Network, 
  Zap, 
  Filter, 
  ArrowRight, 
  Trash2, 
  BookOpen,
  Clock
} from 'lucide-react';

interface VaultViewProps {
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ onNavigate }) => {
  const { notes, memoryShortcuts, deleteNote, deleteMemoryShortcut } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'notes' | 'shortcuts'>('all');

  const filteredNotes = notes.filter(
    n =>
      (filterType === 'all' || filterType === 'notes') &&
      ((n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.summary || n.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.subject || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredShortcuts = memoryShortcuts.filter(
    s =>
      (filterType === 'all' || filterType === 'shortcuts') &&
      ((s.concept || s.topic || s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.mnemonic || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.subject || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
            <Archive className="w-3.5 h-3.5" /> REPOSITORY & KNOWLEDGE VAULT
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Study Resource Vault
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Central repository of all generated notes, cheat sheets, memory hooks, and study artifacts.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search notes, shortcuts, subjects, tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {(['all', 'notes', 'shortcuts'] as const).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? 'bg-cyan-500 text-black'
                  : 'bg-[#182138] text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Notes Items */}
        {filteredNotes.map(note => (
          <div
            key={note.id}
            className="p-5 rounded-2xl bg-[#12182a] border border-slate-800 hover:border-cyan-500/40 space-y-3 flex flex-col justify-between transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Note • {note.subject}
                </span>
                <span className="text-[10px] text-slate-500">{note.createdAt}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight group-hover:text-cyan-200 transition-colors">
                {note.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {note.summary || (note.content ? note.content.slice(0, 100).replace(/[#*`\n]/g, ' ') : '')}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('notes', { topic: note.title, subject: note.subject })}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => deleteNote(note.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Shortcuts Items */}
        {filteredShortcuts.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-[#12182a] border border-slate-800 hover:border-amber-500/40 space-y-3 flex flex-col justify-between transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Memory Hook • {item.subject}
                </span>
                <span className="text-[10px] text-slate-500">{item.createdAt}</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {item.concept}
              </h3>
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-semibold text-white">
                "{item.mnemonic}"
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate('memory-lab', { topic: item.concept })}
                className="text-xs text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1"
              >
                <span>Memory Lab</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => deleteMemoryShortcut(item.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && filteredShortcuts.length === 0 && (
        <div className="p-12 text-center text-slate-500 rounded-2xl bg-[#12182a] border border-slate-800">
          No resources match your search. Create notes or memory shortcuts to populate your vault!
        </div>
      )}
    </div>
  );
};
