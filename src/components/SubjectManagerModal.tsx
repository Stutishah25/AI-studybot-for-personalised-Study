import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Subject, SubjectUnit } from '../types';
import { BookOpen, Plus, Trash2, Edit2, Sparkles, X, Check, FileText, ChevronRight } from 'lucide-react';

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addSubject, deleteSubject, parseSyllabus } = useStudy();

  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'syllabus'>('list');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  // Add Subject Form
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [accentColor, setAccentColor] = useState('#818cf8');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paste Syllabus Form
  const [syllabusSubject, setSyllabusSubject] = useState(subjects[0]?.name || '');
  const [syllabusText, setSyllabusText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[] | null>(null);

  if (!isOpen) return null;

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addSubject({
        name: name.trim(),
        code: code.trim() || `${name.slice(0, 3).toUpperCase()}101`,
        description: description.trim() || `Course syllabus and study notes for ${name}.`,
        accentColor,
        color: 'indigo'
      });
      setName('');
      setCode('');
      setDescription('');
      setActiveTab('list');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParseSyllabus = async () => {
    if (!syllabusText.trim()) return;
    setIsParsing(true);
    setParsedPreview(null);

    try {
      const units = await parseSyllabus(syllabusText, syllabusSubject);
      setParsedPreview(units);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyParsedSyllabus = async () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    setIsSubmitting(true);

    try {
      // Map parsed units to SubjectUnit format
      const units: SubjectUnit[] = parsedPreview.map((u, uIdx) => ({
        id: `u_${Date.now()}_${uIdx}`,
        unitNumber: u.unitNumber || uIdx + 1,
        title: u.title || `Unit ${uIdx + 1}`,
        topics: (u.topics || []).map((tName: string, tIdx: number) => ({
          id: `t_${Date.now()}_${uIdx}_${tIdx}`,
          name: typeof tName === 'string' ? tName : (tName as any).name || 'Topic',
          unitId: `u_${Date.now()}_${uIdx}`,
          subjectId: 'temp',
          status: 'needs-revision',
          quizScore: 0,
          confidenceScore: 35,
          lastReviewedDaysAgo: 1,
          difficulty: 'medium',
          notesCount: 0
        }))
      }));

      await addSubject({
        name: syllabusSubject.trim() || 'New Subject',
        code: `${syllabusSubject.slice(0, 3).toUpperCase()}101`,
        description: `Imported syllabus with ${units.length} units and ${units.flatMap(u => u.topics).length} topics.`,
        accentColor: '#38bdf8',
        color: 'cyan',
        units
      });

      setSyllabusText('');
      setParsedPreview(null);
      setActiveTab('list');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#12182a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-b from-[#182138] to-[#12182a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Subject & Syllabus Management</h2>
              <p className="text-xs text-slate-400">Configure your active semester courses and structured syllabus.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'list'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            My Subjects ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'syllabus'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Syllabus Importer</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: SUBJECTS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {subjects.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-400">No subjects added yet. Add a subject or use the AI Syllabus Importer.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add Your First Subject
                  </button>
                </div>
              ) : (
                subjects.map(subj => {
                  const topicCount = subj.units ? subj.units.flatMap(u => u.topics).length : 0;
                  return (
                    <div
                      key={subj.id}
                      className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0"
                          style={{ backgroundColor: subj.accentColor || '#818cf8' }}
                        />
                        <div>
                          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            <span>{subj.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {subj.code}
                            </span>
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {subj.units ? `${subj.units.length} Units • ${topicCount} Topics` : '0 Units'} • {subj.progress}% mastery
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => deleteSubject(subj.id)}
                          title="Delete Subject"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ADD SUBJECT */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Molecular Biology, Differential Equations, Macroeconomics"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="e.g. BIO201, MATH302"
                    className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Accent Theme</label>
                  <div className="flex items-center gap-2 pt-1.5">
                    {['#818cf8', '#38bdf8', '#34d399', '#f472b6', '#fbbf24'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setAccentColor(color)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          accentColor === color ? 'scale-125 ring-2 ring-white/60' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief note on what this course covers..."
                  className="w-full px-3.5 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create Subject</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: AI SYLLABUS IMPORTER */}
          {activeTab === 'syllabus' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Syllabus Topic Extractor
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Paste the raw syllabus text from your university PDF or course portal. NOVA's AI will parse it into organized Units and Topics ready for flashcards, quizzes, and mind maps.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Subject / Course Name</label>
                <input
                  type="text"
                  value={syllabusSubject}
                  onChange={e => setSyllabusSubject(e.target.value)}
                  placeholder="e.g. Distributed Systems"
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Paste Raw Syllabus Text</label>
                <textarea
                  rows={6}
                  value={syllabusText}
                  onChange={e => setSyllabusText(e.target.value)}
                  placeholder={`Example:
Unit 1: Introduction to Distributed Systems, Architecture Models, RPC, RMI
Unit 2: Inter-process Communication, Sockets, Message Queues, Clock Synchronization
Unit 3: Consensus Protocols, Paxos, Raft, Byzantine Fault Tolerance`}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 font-mono text-[11px] focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <button
                type="button"
                disabled={isParsing || !syllabusText.trim()}
                onClick={handleParseSyllabus}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
              >
                {isParsing ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Structured Units & Topics</span>
                  </>
                )}
              </button>

              {/* Parsed Preview */}
              {parsedPreview && (
                <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300">
                      Found {parsedPreview.length} Units in Syllabus
                    </span>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleApplyParsedSyllabus}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save as Active Subject</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                    {parsedPreview.map((u, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="font-semibold text-slate-200">{u.title || `Unit ${i + 1}`}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {(u.topics || []).map((t: any, ti: number) => (
                            <span
                              key={ti}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                            >
                              {typeof t === 'string' ? t : t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
