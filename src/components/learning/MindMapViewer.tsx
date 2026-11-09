import React, { useState } from 'react';
import {
  Network,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Download,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateMindMapAPI } from '../../services/api';
import { MindMapNode } from '../../types';

export const MindMapViewer: React.FC = () => {
  const { profile, triggerCelebration } = useApp();

  const [subject, setSubject] = useState(profile.favoriteSubject || 'Physics');
  const [topic, setTopic] = useState('Electromagnetic Induction & Faraday’s Laws');
  const [isLoading, setIsLoading] = useState(false);

  // Default initial mind map data
  const [mindMapData, setMindMapData] = useState<MindMapNode>({
    id: 'root',
    label: 'Electromagnetic Induction',
    description: 'Generation of EMF by varying magnetic flux',
    children: [
      {
        id: '1',
        label: "Faraday's Laws",
        description: 'Quantitative foundation of induction',
        children: [
          { id: '1-1', label: '1st Law', description: 'Changing flux induces EMF' },
          { id: '1-2', label: '2nd Law', description: 'EMF ε = -dΦ/dt' },
        ],
      },
      {
        id: '2',
        label: "Lenz's Law",
        description: 'Direction of induced current opposes flux change',
        children: [
          { id: '2-1', label: 'Energy Conservation', description: 'Work converted into electrical energy' },
          { id: '2-2', label: 'Eddy Currents', description: 'Circulating currents in bulk conductors & damping' },
        ],
      },
      {
        id: '3',
        label: 'Self & Mutual Inductance',
        description: 'Magnetic coupling in coils and solenoids',
        children: [
          { id: '3-1', label: 'Self Inductance (L)', description: 'Φ = L I ; Back-EMF opposing current change' },
          { id: '3-2', label: 'Mutual Inductance (M)', description: 'Basis of electrical transformers and wireless power' },
        ],
      },
    ],
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const data = await generateMindMapAPI({ topic, subject });
      if (data && data.nodes && data.nodes[0]) {
        setMindMapData(data.nodes[0]);
        triggerCelebration();
      }
    } catch (err: any) {
      alert(`Could not generate mind map: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Render recursive node tree
  const renderNode = (node: MindMapNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;

    const depthColors = [
      'border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      'border-indigo-400 bg-indigo-950/60 text-indigo-200',
      'border-violet-400 bg-violet-950/50 text-violet-200',
      'border-slate-700 bg-slate-900/60 text-slate-300',
    ];

    return (
      <div key={node.id} className="relative pl-6 sm:pl-8 my-3">
        {/* Branch connector line */}
        {depth > 0 && (
          <div className="absolute left-0 top-5 w-6 sm:w-8 h-[2px] bg-indigo-500/30" />
        )}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500/20" />
        )}

        <div
          className={`inline-block p-3.5 sm:p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
            depthColors[Math.min(depth, depthColors.length - 1)]
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-bold ${
                depth === 0 ? 'text-base sm:text-lg text-white' : 'text-xs sm:text-sm'
              }`}
            >
              {node.label}
            </span>
          </div>

          {node.description && (
            <p className="text-[11px] text-slate-300/80 mt-1 max-w-sm">
              {node.description}
            </p>
          )}
        </div>

        {hasChildren && (
          <div className="space-y-1">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Visual Knowledge Architect
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">AI Mind Map Explorer</h1>
          <p className="text-xs text-slate-400">
            Deconstruct complex chapters into hierarchical visual concept trees and relationship maps.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <Network size={24} />
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
            >
              {profile.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic or Chapter name"
              className="w-full px-3 py-2 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles size={14} className="animate-spin text-cyan-300" />
                  <span>Synthesizing Nodes...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Generate Mind Map</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Mind Map Canvas */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border-cyan-400/20 overflow-x-auto min-h-[400px]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-indigo-900/30">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Concept Map: {mindMapData.label}
          </span>
          <span className="text-xs text-slate-400">
            Hierarchical Relationships & Branches
          </span>
        </div>

        <div className="py-2">
          {renderNode(mindMapData, 0)}
        </div>
      </div>
    </div>
  );
};
