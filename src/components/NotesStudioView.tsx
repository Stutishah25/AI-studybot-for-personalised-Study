import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { NoteType } from '../types';
import { 
  FileText, 
  Sparkles, 
  Upload, 
  Copy, 
  Download, 
  Edit3, 
  Save, 
  Trash2, 
  Brain, 
  HelpCircle, 
  Check, 
  Layers, 
  FileSpreadsheet, 
  SlidersHorizontal,
  FolderPlus
} from 'lucide-react';

interface NotesStudioViewProps {
  initialTopic?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const NotesStudioView: React.FC<NotesStudioViewProps> = ({
  initialTopic = '',
  onNavigate
}) => {
  const { notes, addNote, updateNote, deleteNote, currentSubject } = useStudy();

  const [inputMode, setInputMode] = useState<'topic' | 'paste' | 'upload'>('topic');
  const [topicInput, setTopicInput] = useState(initialTopic);
  const [sourceText, setSourceText] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<NoteType>('one-page-cheat-sheet');
  const [selectedLength, setSelectedLength] = useState<'ultra-short' | 'quick' | 'detailed'>('quick');
  const [paperTheme, setPaperTheme] = useState<'warm-ivory' | 'digital-dark'>('warm-ivory');

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const formatOptions: Array<{ id: NoteType; label: string }> = [
    { id: 'quick-revision', label: 'Quick Revision' },
    { id: 'detailed', label: 'Detailed Notes' },
    { id: 'exam-notes', label: 'Exam Notes' },
    { id: 'one-page-cheat-sheet', label: 'One-page Cheat Sheet' },
    { id: 'definitions', label: 'Important Definitions' },
    { id: 'formulas', label: 'Formulas' },
    { id: 'examples', label: 'Examples' },
    { id: 'mistakes', label: 'Common Mistakes' }
  ];

  const handleGenerate = async () => {
    const topicToUse = inputMode === 'topic' ? topicInput.trim() : (topicInput || 'Pasted Material');
    if (!topicToUse) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || 'Computer Science',
          topic: topicToUse,
          format: selectedFormat,
          length: selectedLength,
          sourceText: inputMode === 'paste' ? sourceText : undefined
        })
      });
      const data = await res.json();
      if (data.data) {
        addNote({
          title: data.data.title || `${topicToUse} — ${selectedFormat}`,
          subject: currentSubject?.name || 'General',
          type: selectedFormat,
          summary: data.data.summary || `AI Generated ${selectedFormat} notes for ${topicToUse}`,
          content: data.data.content || '',
          tags: data.data.tags || [topicToUse, 'AI Notes']
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!activeNote) return;
    setEditTitle(activeNote.title);
    setEditContent(activeNote.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!activeNote) return;
    updateNote(activeNote.id, {
      title: editTitle,
      content: editContent
    });
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeNote) return;
    const blob = new Blob([`${activeNote.title}\n\n${activeNote.content}`], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(activeNote.title || 'study_notes').replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setSourceText(event.target?.result as string);
        setInputMode('paste');
        if (!topicInput) setTopicInput(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs font-mono mb-1.5">
            <FileText className="w-3.5 h-3.5" /> SMART NOTES STUDIO
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Curated Academic Notes & Cheat Sheets
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Generate high-yield revision notes, one-page cheat sheets, and formula sheets.
          </p>
        </div>

        {/* Paper Theme Switcher */}
        <div className="flex items-center gap-2 bg-[#12182a] border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setPaperTheme('warm-ivory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              paperTheme === 'warm-ivory'
                ? 'bg-[#fcfbf9] text-amber-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📜 Warm Paper
          </button>
          <button
            type="button"
            onClick={() => setPaperTheme('digital-dark')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              paperTheme === 'digital-dark'
                ? 'bg-slate-800 text-cyan-300 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💻 Midnight Clean
          </button>
        </div>
      </div>

      {/* Generator Configuration Panel */}
      <div className="p-5 rounded-2xl bg-[#12182a] border border-slate-800/90 space-y-4 shadow-xl">
        {/* Source Mode Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setInputMode('topic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'topic'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Topic Query
          </button>
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'paste'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'upload'
                ? 'bg-cyan-500 text-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Document
          </button>
        </div>

        {/* Dynamic Input Control */}
        {inputMode === 'topic' && (
          <input
            type="text"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            placeholder="Topic to summarize (e.g. Cache Memory Mapping, SQL Normal Forms, Dijkstra's Algorithm)..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />
        )}

        {inputMode === 'paste' && (
          <div className="space-y-2">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="Note Title / Topic"
              className="w-full px-4 py-2 rounded-xl bg-[#182138] border border-slate-700 text-white text-xs focus:border-cyan-400"
            />
            <textarea
              rows={4}
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
              placeholder="Paste textbook excerpt, lecture transcript, or raw notes here..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>
        )}

        {inputMode === 'upload' && (
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl cursor-pointer bg-[#182138]/50 hover:bg-[#182138] transition-all group">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
            <span className="text-sm font-semibold text-slate-200">
              Drop file here or click to browse
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Supports .txt, .md, syllabus dumps
            </span>
            <input
              type="file"
              accept=".txt,.md,.text"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}

        {/* Format and Length Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Format pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {formatOptions.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormat(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedFormat === f.id
                    ? 'bg-violet-600 text-white font-semibold shadow-sm'
                    : 'bg-[#182138] text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Length & Generate Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#182138] border border-slate-700 rounded-xl p-0.5">
              {(['ultra-short', 'quick', 'detailed'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSelectedLength(l)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-all ${
                    selectedLength === l ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'
                  }`}
                >
                  {l.replace('-', ' ')}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || (!topicInput && !sourceText)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-black font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 fill-black" />
              <span>{loading ? 'Synthesizing...' : 'Generate Notes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio View: Note List Sidebar + Notebook Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Notes Library List */}
        <div className="lg:col-span-1 rounded-2xl bg-[#12182a] border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderPlus className="w-3.5 h-3.5 text-cyan-400" /> Saved Notes ({notes.length})
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto">
            {notes.length > 0 ? (
              notes.map(note => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => {
                    setActiveNoteId(note.id);
                    setIsEditing(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all group ${
                    activeNote?.id === note.id
                      ? 'bg-violet-950/50 border-violet-500/50 shadow-md'
                      : 'bg-[#151c30] border-slate-800/80 hover:border-slate-700 hover:bg-[#182238]'
                  }`}
                >
                  <span className="text-xs font-semibold text-white block truncate">
                    {note.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {note.summary || (note.content ? note.content.slice(0, 80).replace(/[#*`\n]/g, ' ') : 'Saved Study Note')}
                  </span>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                    <span className="capitalize">{(note.type || note.noteType || 'study-notes').replace(/-/g, ' ')}</span>
                    <span>{note.createdAt}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-5 text-center text-slate-500 rounded-xl bg-[#0e1424] border border-slate-800/80 space-y-1">
                <FileText className="w-5 h-5 text-slate-600 mx-auto" />
                <p className="text-xs font-medium text-slate-400">No notes saved yet</p>
                <p className="text-[10px] text-slate-600">Generated notes will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Notebook Paper Canvas */}
        <div className="lg:col-span-3 space-y-3">
          {activeNote ? (
            <div className="space-y-3">
              {/* Note Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#12182a] border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">
                    {activeNote.subject} • {activeNote.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 rounded-lg bg-[#182138] hover:bg-[#202c48] border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-[#182138] hover:bg-[#202c48] border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-3 py-1.5 rounded-lg bg-[#182138] hover:bg-[#202c48] border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Markdown
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('quiz', { topic: activeNote.title, subject: activeNote.subject })}
                    className="px-3 py-1.5 rounded-lg bg-violet-600/80 hover:bg-violet-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Quiz Me
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('mindmaps', { topic: activeNote.title, subject: activeNote.subject })}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Brain className="w-3.5 h-3.5" /> Mind Map
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Content Canvas */}
              {isEditing ? (
                <div className="p-6 rounded-2xl bg-[#12182a] border border-slate-800 space-y-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full text-xl font-bold bg-[#182138] border border-slate-700 px-4 py-2 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                  <textarea
                    rows={16}
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full font-mono text-sm bg-[#182138] border border-slate-700 p-4 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>
              ) : paperTheme === 'warm-ivory' ? (
                /* Warm Ivory Notebook Card with subtle ruled paper vibe */
                <div className="notebook-paper p-8 sm:p-10 rounded-2xl shadow-2xl space-y-6 relative overflow-hidden min-h-[500px]">
                  {/* Subtle red margin line on left */}
                  <div className="absolute top-0 bottom-0 left-12 w-[1.5px] bg-rose-300/60 hidden sm:block pointer-events-none"></div>

                  <div className="sm:pl-8 space-y-4">
                    <div className="border-b-2 border-amber-900/10 pb-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-amber-950 font-serif tracking-tight">
                        {activeNote.title}
                      </h2>
                      <p className="text-xs font-sans text-amber-800/80 mt-1">
                        {activeNote.summary}
                      </p>
                    </div>

                    <div className="prose prose-amber max-w-none text-amber-950 font-sans leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                      {activeNote.content}
                    </div>

                    {activeNote.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-6 border-t border-amber-900/10">
                        {activeNote.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-100/80 text-amber-900 border border-amber-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Midnight Dark Clean Studio Canvas */
                <div className="p-8 sm:p-10 rounded-2xl bg-[#0f1424] border border-slate-800 shadow-2xl space-y-6 min-h-[500px]">
                  <div className="border-b border-slate-800 pb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {activeNote.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{activeNote.summary}</p>
                  </div>

                  <div className="text-slate-200 font-sans leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                    {activeNote.content}
                  </div>

                  {activeNote.tags && (
                    <div className="flex flex-wrap gap-1.5 pt-6 border-t border-slate-800/80">
                      {activeNote.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#182138] text-cyan-300 border border-slate-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 rounded-2xl bg-[#12182a] border border-slate-800">
              No notes selected. Generate or create one above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
