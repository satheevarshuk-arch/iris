import React, { useState, useRef } from 'react';
import {
  ListCollapse,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Check,
  BookmarkPlus,
  Brain,
  Lightbulb,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sendChatMessage } from '../../services/api';
import { ChatAttachment } from '../../types';

export const HomeworkHelper: React.FC = () => {
  const { profile, addNote, triggerCelebration } = useApp();

  const [subject, setSubject] = useState(profile.favoriteSubject || 'Mathematics');
  const [questionText, setQuestionText] = useState('');
  const [solveMode, setSolveMode] = useState<'step_by_step' | 'hints_only'>('step_by_step');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1] || '';
        const attachment: ChatAttachment = {
          name: file.name,
          mimeType: file.type || 'text/plain',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? resultStr : undefined,
          size: file.size,
        };
        setAttachments((prev) => [...prev, attachment]);
      };

      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() && attachments.length === 0) return;

    setIsLoading(true);
    setCopied(false);
    setSaved(false);

    try {
      const prompt = `[HOMEWORK ASSISTANT - Subject: ${subject}, Mode: ${solveMode === 'hints_only' ? 'GUIDED HINTS ONLY (Do not give final answer yet)' : 'COMPLETE STEP-BY-STEP DERIVATION'}]
Question:
${questionText}

Please structure your answer cleanly:
1. Understanding the Problem & Given Data
2. Relevant Formulas & Theorems
3. Step-by-Step Derivation / Solution
4. Final Result with Units & Verification
5. Key Exam Takeaway & Similar Pattern Hint`;

      const response = await sendChatMessage({
        messages: [
          {
            role: 'user',
            content: prompt,
            attachments: attachments.map((a) => ({
              name: a.name,
              mimeType: a.mimeType,
              data: a.data,
            })),
          },
        ],
        studentProfile: profile,
        aiMode: 'neo',
        thinkLonger: true,
        learningMode: solveMode === 'hints_only' ? 'Socratic' : 'Step-by-Step',
        personalityStyle: 'Focused Study Partner',
      });

      setSolution(response);
      triggerCelebration();
    } catch (err: any) {
      alert(`Could not solve question: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToNotes = () => {
    if (!solution) return;
    addNote({
      title: `Homework: ${questionText.slice(0, 35)}...`,
      subject,
      topic: 'Homework Solutions',
      content: solution,
      tags: [subject, 'Homework'],
      isFavorite: false,
    });
    setSaved(true);
    triggerCelebration();
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Academic Problem Solver
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Homework Helper</h1>
          <p className="text-xs text-slate-400">
            Paste difficult problem sets or upload worksheet photos for step-by-step guidance and hints.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <ListCollapse size={24} />
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSolve} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Learning Approach</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSolveMode('step_by_step')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  solveMode === 'step_by_step'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'glass-input text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 size={13} />
                <span>Full Solution</span>
              </button>
              <button
                type="button"
                onClick={() => setSolveMode('hints_only')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  solveMode === 'hints_only'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                    : 'glass-input text-slate-400 hover:text-white'
                }`}
              >
                <Lightbulb size={13} />
                <span>Guided Hints</span>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Type or Paste Problem Statement
          </label>
          <textarea
            rows={4}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g. A uniform solid cylinder of mass M and radius R rolls down an inclined plane of angle θ without slipping. Find its linear acceleration..."
            className="w-full p-3.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none leading-relaxed"
          />
        </div>

        {/* Worksheet / Picture Attachment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Worksheet / Textbook Image Uploads:</span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <Paperclip size={13} />
              <span>Attach Image or PDF</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-indigo-950/80 border border-cyan-400/30 text-xs text-slate-200"
                >
                  {att.previewUrl ? (
                    <img src={att.previewUrl} alt={att.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <ImageIcon size={14} className="text-cyan-400" />
                  )}
                  <span className="truncate max-w-[140px]">{att.name}</span>
                  <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-400">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || (!questionText.trim() && attachments.length === 0)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Brain size={16} className="animate-spin text-cyan-300" />
                <span>I.R.I.S. NEO is Deriving Solution...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{solveMode === 'hints_only' ? 'Get Guided Hints' : 'Solve Step-by-Step'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Solution Display Card */}
      {solution && (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-cyan-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-900/30">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <Sparkles size={16} />
              <span>I.R.I.S. Solution & Concept Walkthrough</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(solution);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleSaveToNotes}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium flex items-center gap-1.5 cursor-pointer"
              >
                {saved ? <Check size={14} className="text-emerald-400" /> : <BookmarkPlus size={14} />}
                <span>{saved ? 'Saved' : 'Save to Notes'}</span>
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {solution}
          </div>
        </div>
      )}
    </div>
  );
};
