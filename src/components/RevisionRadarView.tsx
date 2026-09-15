import React from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { 
  Radar, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  HelpCircle, 
  TrendingDown, 
  Check 
} from 'lucide-react';

interface RevisionRadarViewProps {
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const RevisionRadarView: React.FC<RevisionRadarViewProps> = ({ onNavigate }) => {
  const { revisionRadar, markTopicReviewed } = useStudy();

  const dueForReview = revisionRadar.filter(r => r.status === 'due-now');
  const dueSoon = revisionRadar.filter(r => r.status === 'due-soon');
  const recentlyReviewed = revisionRadar.filter(r => r.status === 'recently-reviewed');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono mb-1.5">
            <Radar className="w-3.5 h-3.5" /> SPACED REPETITION ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Forgetting Curve & Revision Radar
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Ebbinghaus spaced-repetition algorithm tracks memory decay so you review right before you forget.
          </p>
        </div>
      </div>

      {/* Memory Decay Diagnostics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-rose-300 uppercase font-bold block mb-1">
              Due For Review
            </span>
            <span className="text-3xl font-black text-rose-400">{dueForReview.length} Topics</span>
          </div>
          <TrendingDown className="w-8 h-8 text-rose-400 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-amber-300 uppercase font-bold block mb-1">
              Due Soon (48h)
            </span>
            <span className="text-3xl font-black text-amber-400">{dueSoon.length} Topics</span>
          </div>
          <Clock className="w-8 h-8 text-amber-400 opacity-80" />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-emerald-300 uppercase font-bold block mb-1">
              Protected Retention
            </span>
            <span className="text-3xl font-black text-emerald-400">{recentlyReviewed.length} Topics</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>
      </div>

      {/* Group 1: Due For Review (High Urgency) */}
      <div className="rounded-2xl bg-[#12182a] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
          <h3 className="text-lg font-bold text-white">
            Due For Review (Retention decaying below 60%)
          </h3>
        </div>

        <div className="space-y-3">
          {dueForReview.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#161f36] border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{item.topic}</span>
                  <span className="text-xs text-slate-400">• {item.subject}</span>
                </div>
                <p className="text-xs text-rose-200/90 italic font-sans">
                  "{item.reason}"
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Last reviewed {item.lastReviewedDaysAgo} days ago</span>
                  <span>•</span>
                  <span className="text-rose-400 font-bold">Retention: {item.retentionEstimate}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => markTopicReviewed(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#141b2e] hover:bg-[#1b2540] border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark Reviewed</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('tutor', { topic: item.topic, subject: item.subject })}
                  className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                >
                  <span>Review Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group 2: Due Soon (Medium Urgency) */}
      <div className="rounded-2xl bg-[#12182a] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <h3 className="text-lg font-bold text-white">Due Soon (Next 48 Hours)</h3>
        </div>

        <div className="space-y-3">
          {dueSoon.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#161f36] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{item.topic}</span>
                  <span className="text-xs text-slate-400">• {item.subject}</span>
                </div>
                <p className="text-xs text-amber-200/80 font-sans">
                  {item.reason}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Last reviewed {item.lastReviewedDaysAgo} days ago</span>
                  <span>•</span>
                  <span className="text-amber-300 font-bold">Retention: {item.retentionEstimate}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => markTopicReviewed(item.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#141b2e] hover:bg-[#1b2540] border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark Reviewed</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('recall', { topic: item.topic, subject: item.subject })}
                  className="px-4 py-1.5 rounded-lg bg-[#1a233b] hover:bg-[#202d4b] border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <span>Quick Recall</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group 3: Recently Reviewed */}
      <div className="rounded-2xl bg-[#12182a] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h3 className="text-lg font-bold text-white">Recently Reviewed & Reinforced</h3>
        </div>

        <div className="space-y-3">
          {recentlyReviewed.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-[#161f36]/70 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-white block">{item.topic}</span>
                <span className="text-[11px] text-slate-400">{item.reason}</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {item.retentionEstimate}% Fresh
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
