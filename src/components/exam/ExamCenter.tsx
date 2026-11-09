import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Clock,
  Printer,
  Copy,
  Check,
  Plus,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQuestionPaperAPI } from '../../services/api';

export const ExamCenter: React.FC = () => {
  const { profile, exams, addExam, updateExamChapters, deleteExam, triggerCelebration } =
    useApp();

  const [activeTab, setActiveTab] = useState<'countdown' | 'mock_papers'>('countdown');

  // Question paper generator state
  const [qpSubject, setQpSubject] = useState(profile.favoriteSubject || 'Physics');
  const [qpTopic, setQpTopic] = useState('Rotational Mechanics & Gravitation');
  const [board, setBoard] = useState(profile.board || 'CBSE');
  const [totalMarks, setTotalMarks] = useState<number>(50);
  const [duration, setDuration] = useState('90 mins');
  const [isLoadingPaper, setIsLoadingPaper] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Add exam modal/form
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('2026-05-10');
  const [newTotalChapters, setNewTotalChapters] = useState(10);
  const [newTargetScore, setNewTargetScore] = useState('95%');

  const calculateDaysLeft = (targetDate: string) => {
    const diffTime = new Date(targetDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleGeneratePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qpTopic.trim()) return;

    setIsLoadingPaper(true);
    setCopied(false);

    try {
      const paper = await generateQuestionPaperAPI({
        subject: qpSubject,
        topic: qpTopic,
        board,
        totalMarks,
        duration,
      });

      setGeneratedPaper(paper);
      setActiveTab('mock_papers');
      triggerCelebration();
    } catch (err: any) {
      alert(`Could not generate paper: ${err.message}`);
    } finally {
      setIsLoadingPaper(false);
    }
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamSubject.trim()) return;

    addExam({
      subject: newExamSubject.trim(),
      examDate: newExamDate,
      totalChapters: newTotalChapters,
      completedChapters: 0,
      targetScore: newTargetScore,
    });

    setNewExamSubject('');
    setShowAddExam(false);
    triggerCelebration();
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Exam Mastery & Board Prep
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Examination Preparation Center</h1>
          <p className="text-xs text-slate-400">
            Timetables, countdowns, chapter completion tracking, and rigorous AI mock question papers.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl glass-input">
          <button
            onClick={() => setActiveTab('countdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'countdown'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exam Countdowns
          </button>
          <button
            onClick={() => setActiveTab('mock_papers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mock_papers'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mock Question Papers
          </button>
        </div>
      </div>

      {activeTab === 'countdown' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock size={16} className="text-cyan-400" />
              <span>Upcoming Board & School Examinations ({profile.board})</span>
            </h2>

            <button
              onClick={() => setShowAddExam(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus size={14} />
              <span>Add Exam</span>
            </button>
          </div>

          {/* Exam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => {
              const daysLeft = calculateDaysLeft(exam.examDate);
              const progressPercent = Math.round(
                (exam.completedChapters / (exam.totalChapters || 1)) * 100
              );

              return (
                <div
                  key={exam.id}
                  className="glass-card p-6 rounded-2xl border-indigo-900/30 flex flex-col justify-between space-y-4 hover:border-cyan-400/40 relative"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-950 text-cyan-300 border border-indigo-500/20">
                        Target: {exam.targetScore}
                      </span>

                      <button
                        onClick={() => deleteExam(exam.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-white">{exam.subject}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Date: <strong className="text-slate-200">{exam.examDate}</strong>
                    </p>

                    {/* Big Countdown Days */}
                    <div className="my-3 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/20 text-center">
                      <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-300 font-mono">
                        {daysLeft}
                      </div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400">
                        Days Remaining
                      </span>
                    </div>

                    {/* Chapter Progress */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Chapters Prepared:</span>
                        <strong className="text-cyan-300">
                          {exam.completedChapters} / {exam.totalChapters} ({progressPercent}%)
                        </strong>
                      </div>

                      <input
                        type="range"
                        min={0}
                        max={exam.totalChapters}
                        value={exam.completedChapters}
                        onChange={(e) =>
                          updateExamChapters(exam.id, Number(e.target.value))
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>

                    {exam.notes && (
                      <p className="text-[11px] text-slate-400 mt-2 italic">
                        📌 {exam.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Exam Modal */}
          {showAddExam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="relative w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 text-slate-100 shadow-2xl">
                <h3 className="text-base font-bold text-white mb-3">Add Target Exam</h3>

                <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Subject / Paper</label>
                    <input
                      type="text"
                      value={newExamSubject}
                      onChange={(e) => setNewExamSubject(e.target.value)}
                      placeholder="e.g. Mathematics Board Exam"
                      className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Exam Date</label>
                    <input
                      type="date"
                      value={newExamDate}
                      onChange={(e) => setNewExamDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Total Chapters</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={newTotalChapters}
                        onChange={(e) => setNewTotalChapters(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Target Score</label>
                      <input
                        type="text"
                        value={newTargetScore}
                        onChange={(e) => setNewTargetScore(e.target.value)}
                        placeholder="e.g. 95%"
                        className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddExam(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold transition-all cursor-pointer shadow-md"
                    >
                      Save Exam
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mock Question Paper Generator */
        <div className="space-y-6">
          <form onSubmit={handleGeneratePaper} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span>Generate Curriculum-Aligned Mock Question Paper</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Subject</label>
                <select
                  value={qpSubject}
                  onChange={(e) => setQpSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200 focus:outline-none"
                >
                  {profile.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Board / Syllabus</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200 focus:outline-none"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="State Board">State Board</option>
                  <option value="IB">International Baccalaureate (IB)</option>
                  <option value="General / College">General / College</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Total Marks</label>
                <select
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200 focus:outline-none"
                >
                  <option value={25}>25 Marks (Quick Test)</option>
                  <option value={50}>50 Marks (Mid-Term)</option>
                  <option value={70}>70 Marks (Theory Full)</option>
                  <option value={80}>80 Marks (Board Final)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 90 mins"
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium text-xs mb-1">Chapters / Syllabus Topic</label>
              <input
                type="text"
                value={qpTopic}
                onChange={(e) => setQpTopic(e.target.value)}
                placeholder="e.g. Full Mechanics & Gravitation units"
                className="w-full p-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoadingPaper || !qpTopic.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoadingPaper ? (
                  <>
                    <Sparkles size={15} className="animate-spin text-cyan-300" />
                    <span>Compiling Formal Board Paper...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 size={15} />
                    <span>Generate Question Paper & Answer Key</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {generatedPaper && (
            <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-cyan-400/30 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-900/30">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                  <FileCheck2 size={16} />
                  <span>{board} Model Question Paper: {qpSubject}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPaper);
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
                    <span>Print Paper</span>
                  </button>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {generatedPaper}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
