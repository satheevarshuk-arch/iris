import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Presentation,
  Video,
  FileText,
  Lightbulb,
  Copy,
  Check,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { creativeLabAPI } from '../../services/api';

export const CreativeLab: React.FC = () => {
  const { profile, triggerCelebration } = useApp();

  const [projectType, setProjectType] = useState('Educational Poster & Infographic Blueprint');
  const [subject, setSubject] = useState(profile.favoriteSubject || 'Science');
  const [topic, setTopic] = useState('Renewable Energy: The Physics of Perovskite Solar Cells');
  const [audience, setAudience] = useState('High School Science Fair & Exhibition');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const creativeTypes = [
    { id: 'Educational Poster & Infographic Blueprint', icon: Palette, label: 'Poster & Infographic' },
    { id: 'Science Fair Project & Working Model Blueprint', icon: Lightbulb, label: 'Science Project' },
    { id: 'Presentation Slide Deck & Speaker Notes', icon: Presentation, label: 'Slide Deck' },
    { id: 'Educational Video Script & Storyboard', icon: Video, label: 'Video Script' },
    { id: 'Creative Writing & Scientific Story', icon: FileText, label: 'Creative Story' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setCopied(false);

    try {
      const result = await creativeLabAPI({
        projectType,
        subject,
        topic,
        targetAudience: audience,
      });

      setGeneratedResult(result);
      triggerCelebration();
    } catch (err: any) {
      alert(`Could not create blueprint: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Innovation & Expression
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Creative AI Studio</h1>
          <p className="text-xs text-slate-400">
            Generate educational posters, exhibition blueprints, slide decks, video scripts, and creative narratives.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <Palette size={24} />
        </div>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {creativeTypes.map((t) => {
          const Icon = t.icon;
          const isSelected = projectType === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setProjectType(t.id)}
              className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-600/40 to-indigo-600/40 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'glass-input text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={18} className={isSelected ? 'text-cyan-400' : 'text-slate-500'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-slate-200 focus:outline-none"
            >
              {profile.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1">Topic / Idea</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. CRISPR Gene Editing or Neural Networks in Medicine"
              className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-semibold text-xs mb-1">Target Audience / Purpose</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g. High School Science Fair, Class Presentation, YouTube Explainer"
            className="w-full p-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles size={15} className="animate-spin text-cyan-300" />
                <span>Designing Creative Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Generate Creative Blueprint</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Creative Document */}
      {generatedResult && (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-cyan-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-900/30">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {projectType}: {topic}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedResult);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print</span>
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {generatedResult}
          </div>
        </div>
      )}
    </div>
  );
};
