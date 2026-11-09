import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  BookmarkPlus,
  BookOpen,
  Share2,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateNotesAPI } from '../../services/api';

export const NotesGenerator: React.FC = () => {
  const { profile, addNote, triggerCelebration } = useApp();
  const [subject, setSubject] = useState(profile.favoriteSubject || 'Physics');
  const [topic, setTopic] = useState('Rotational Mechanics & Conservation of Angular Momentum');
  const [noteType, setNoteType] = useState('Comprehensive & Detailed');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setCopied(false);
    setSaved(false);

    try {
      const notes = await generateNotesAPI({
        topic,
        subject,
        grade: profile.grade,
        noteType,
      });
      setGeneratedNotes(notes);
      triggerCelebration();
    } catch (err: any) {
      alert(`Error generating notes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedNotes) return;
    navigator.clipboard.writeText(generatedNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!generatedNotes) return;
    addNote({
      title: `${topic} Notes`,
      subject,
      topic,
      content: generatedNotes,
      tags: [subject, 'AI Generated'],
      isFavorite: true,
    });
    setSaved(true);
    triggerCelebration();
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              AI Study Toolkit
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">AI Notes Generator</h1>
          <p className="text-xs text-slate-400">
            Generate pedagogical textbook-grade study notes, definitions, formulas, and high-yield exam points.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <FileText size={24} />
        </div>
      </div>

      {/* Generator Configuration Form */}
      <form onSubmit={handleGenerate} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
            >
              {profile.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic or Chapter</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Thermodynamics, Newton's Laws, Organic Reactions..."
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Note Style</label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
            >
              <option value="Comprehensive & Detailed">Comprehensive & Detailed</option>
              <option value="Short High-Yield Revision">Short High-Yield Revision</option>
              <option value="Exam-Oriented & Problem Solving">Exam-Oriented & Problem Solving</option>
              <option value="Formulas & Quick Definitions">Formulas & Quick Definitions</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles size={16} className="animate-spin text-cyan-300" />
                <span>Generating Master Notes with I.R.I.S...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Study Notes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generated Notes Display */}
      {generatedNotes && (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-cyan-400/30 space-y-4">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-900/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <BookOpen size={16} />
              <span>Notes for: {topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>

              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {saved ? <Check size={14} className="text-emerald-400" /> : <BookmarkPlus size={14} />}
                <span>{saved ? 'Saved in Notes' : 'Save to Notebook'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer size={14} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Notes Content */}
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {generatedNotes}
          </div>
        </div>
      )}
    </div>
  );
};
