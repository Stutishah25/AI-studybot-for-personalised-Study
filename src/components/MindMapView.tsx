import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { NavRoute } from './Sidebar';
import { MindMapNode } from '../types';
import { 
  Network, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  HelpCircle, 
  X, 
  Info,
  Maximize2
} from 'lucide-react';

interface MindMapViewProps {
  initialTopic?: string;
  onNavigate: (route: NavRoute, prefill?: { topic?: string; subject?: string }) => void;
}

export const MindMapView: React.FC<MindMapViewProps> = ({
  initialTopic = '',
  onNavigate
}) => {
  const { currentMindMap, setCurrentMindMap, saveMindMap, currentSubject } = useStudy();

  const [topicInput, setTopicInput] = useState(initialTopic || currentSubject?.topics?.[0]?.name || '');
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  // Dynamic template topics derived from user's current course or universal cross-disciplinary pillars
  const templateTopics = (currentSubject?.topics && currentSubject.topics.length > 0)
    ? currentSubject.topics.slice(0, 5).map(t => t.name)
    : [
        'Cellular Metabolism & Energy',
        'Macroeconomic Equilibrium',
        'Constitutional Due Process',
        'Newtonian Mechanics & Force Invariants',
        'Thermodynamic Systems & Entropy'
      ];

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateMindMap = async (topicToUse = topicInput) => {
    if (!topicToUse || !topicToUse.trim()) return;
    setLoading(true);
    setSelectedNode(null);

    try {
      const res = await fetch('/api/ai/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || currentSubject?.title || 'General Studies',
          topic: topicToUse.trim()
        })
      });
      const data = await res.json();
      if (data.data) {
        saveMindMap(topicToUse.trim(), data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Node rendering helper
  const renderNodeHierarchy = (node: MindMapNode, depth = 0) => {
    const isCollapsed = !!collapsedNodes[node.id];
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    const nodeColors = [
      'border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-cyan-900/50',
      'border-violet-400 bg-violet-950/70 text-violet-200 shadow-violet-900/50',
      'border-amber-400 bg-amber-950/70 text-amber-200 shadow-amber-900/50',
      'border-emerald-400 bg-emerald-950/70 text-emerald-200 shadow-emerald-900/50'
    ];
    const colorClass = nodeColors[depth % nodeColors.length];

    return (
      <div key={node.id} className="flex items-start my-2 group">
        <div className="flex flex-col items-center">
          {/* Node pill */}
          <div
            onClick={() => setSelectedNode(node)}
            className={`cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 select-none shadow-lg ${colorClass} ${
              isSelected ? 'ring-2 ring-white scale-105' : 'hover:scale-[1.02]'
            }`}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={e => toggleCollapse(node.id, e)}
                className="p-0.5 rounded hover:bg-white/10"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <span className={`font-semibold tracking-tight ${depth === 0 ? 'text-base' : 'text-xs'}`}>
              {node.label}
            </span>

            {node.description && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            )}
          </div>
        </div>

        {/* Child branches */}
        {hasChildren && !isCollapsed && (
          <div className="relative pl-8 ml-3 border-l-2 border-slate-700/60 flex flex-col justify-center">
            {node.children!.map(child => renderNodeHierarchy(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-1.5">
            <Network className="w-3.5 h-3.5" /> INTERACTIVE KNOWLEDGE MAPPER
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Visual Mind Map Studio
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Break down complex hierarchies into intuitive spatial knowledge trees. Click any node to inspect details.
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-[#12182a] border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setZoomLevel(z => Math.max(0.7, z - 0.1))}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-xs text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel(z => Math.min(1.4, z + 0.1))}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Generator Prompt Bar & Template Chips */}
      <div className="p-4 rounded-2xl bg-[#12182a] border border-slate-800/90 space-y-3 shadow-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={e => setTopicInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateMindMap()}
            placeholder="Topic to map (e.g. Operating System, Relational DBMS, Computer Networks)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#182138] border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => handleGenerateMindMap()}
            disabled={loading || !topicInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Tree...' : 'Generate Map'}</span>
          </button>
        </div>

        {/* Pre-built Templates */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase mr-1">
            Templates:
          </span>
          {templateTopics.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTopicInput(t);
                handleGenerateMindMap(t);
              }}
              className="px-2.5 py-1 rounded-lg text-xs bg-[#182138] hover:bg-[#202d4b] text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative rounded-2xl bg-[#0b0f19] border border-slate-800/90 min-h-[560px] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Spatial Node Tree Stage */}
        <div className="flex-1 p-8 overflow-auto flex items-center justify-start min-w-[340px]">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
            className="transition-transform duration-200"
          >
            {renderNodeHierarchy(currentMindMap)}
          </div>
        </div>

        {/* Node Inspection Drawer (Right Side) */}
        {selectedNode && (
          <div className="w-full md:w-80 bg-[#12182b] border-t md:border-t-0 md:border-l border-slate-800 p-6 space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
                <Info className="w-4 h-4" /> Node Inspection
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {selectedNode.label}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.description ||
                  'Fundamental building block in this theoretical architecture.'}
              </p>
            </div>

            {selectedNode.details && (
              <div className="p-3.5 rounded-xl bg-[#172036] border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-cyan-300 uppercase font-bold block">
                  Key Concept Notes
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedNode.details}
                </p>
              </div>
            )}

            {/* Sub-components or children list */}
            {selectedNode.children && selectedNode.children.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                  Sub-Branches ({selectedNode.children.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.children.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedNode(c)}
                      className="px-2 py-1 rounded-lg text-xs bg-[#19233c] text-slate-300 hover:text-cyan-300 border border-slate-700/60"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => onNavigate('tutor', { topic: selectedNode.label })}
                className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
              >
                <BookOpen className="w-3.5 h-3.5" /> Explain in AI Tutor
              </button>
              <button
                type="button"
                onClick={() => onNavigate('quiz', { topic: selectedNode.label })}
                className="w-full py-2 rounded-xl bg-[#1a233b] hover:bg-[#202d4b] border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Quiz Me on This Node
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
