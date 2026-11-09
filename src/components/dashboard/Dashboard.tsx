import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  Flame,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  MessageSquareHeart,
  FileText,
  HelpCircle,
  Network,
  Palette,
  Code2,
  ChevronRight,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IrisAvatar } from '../common/IrisAvatar';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onOpenCheckIn: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onOpenCheckIn }) => {
  const {
    profile,
    tasks,
    toggleTask,
    studyPlan,
    exams,
    notes,
    achievements,
    activeStudySession,
    createNewChat,
    addMessageToActiveChat,
  } = useApp();

  const [quickPrompt, setQuickPrompt] = useState('');

  const completedTasks = tasks.filter((t) => t.completed).length;
  const nextExam = exams[0];

  const handleQuickAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;

    createNewChat(quickPrompt.slice(0, 30));
    addMessageToActiveChat({
      role: 'user',
      content: quickPrompt.trim(),
    });

    setActiveTab('chat');
  };

  const quickTools = [
    { id: 'notes', label: 'AI Notes Generator', icon: FileText, color: 'text-cyan-400' },
    { id: 'quizzes', label: 'AI Quiz Maker', icon: HelpCircle, color: 'text-emerald-400' },
    { id: 'flashcards', label: 'Spaced Flashcards', icon: BookOpen, color: 'text-violet-400' },
    { id: 'mindmap', label: 'Mind Map Explorer', icon: Network, color: 'text-indigo-400' },
    { id: 'coding-lab', label: 'Coding Lab', icon: Code2, color: 'text-amber-400' },
    { id: 'creative-lab', label: 'Creative Studio', icon: Palette, color: 'text-pink-400' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Card with I.R.I.S. Companion Avatar */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border-indigo-500/30 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Glow behind avatar */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start sm:items-center gap-5 z-10">
          <IrisAvatar size="xl" mood="speaking" showStatusBadge />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
                Online & Ready
              </span>
              <span className="text-xs text-indigo-300 font-mono">
                {profile.grade} • {profile.board}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hey {profile.name}! Ready to explore today?
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              "We have {tasks.filter((t) => !t.completed).length} pending tasks and your{' '}
              <strong className="text-cyan-300">{nextExam ? nextExam.subject : 'Midterms'}</strong> is in{' '}
              <strong className="text-amber-300">
                {nextExam ? Math.max(1, Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 18} days
              </strong>. Let's make studying feel simple and empowering."
            </p>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="flex flex-wrap md:flex-col items-stretch gap-2.5 z-10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('study-together')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Play size={15} />
            <span>Study Together Now</span>
          </button>

          <button
            onClick={onOpenCheckIn}
            className="px-5 py-2.5 rounded-2xl glass-input hover:border-cyan-400/40 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-pink-400" />
            <span>Daily Friend Check-in</span>
          </button>
        </div>
      </div>

      {/* Quick AI Ask Bar */}
      <form onSubmit={handleQuickAsk} className="glass-panel p-2.5 rounded-2xl border-indigo-900/30 flex items-center gap-2 shadow-lg">
        <div className="pl-3 text-cyan-400">
          <Brain size={18} />
        </div>
        <input
          type="text"
          value={quickPrompt}
          onChange={(e) => setQuickPrompt(e.target.value)}
          placeholder={`Ask I.R.I.S. anything: "Explain Lenz's law intuitively", "Give me a practice quiz on limits", "Help me organize tomorrow"...`}
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none px-2"
        />
        <button
          type="submit"
          disabled={!quickPrompt.trim()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
        >
          <span>Ask Iris</span>
          <Send size={13} />
        </button>
      </form>

      {/* Quick Access Educational Tools Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className="glass-card p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon size={18} className={tool.color} />
              </div>
              <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-200 transition-colors">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Tasks & Study Goals (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Today's Priority Action Items</span>
              </h3>
              <button
                onClick={() => setActiveTab('productivity')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between gap-3 transition-all ${
                    task.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                      : 'glass-input text-slate-200 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {task.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-500 shrink-0" />
                    )}
                    <span className="truncate">{task.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0">
                    {task.subject}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Knowledge Challenge Card */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3 bg-gradient-to-br from-indigo-950/60 to-purple-950/40">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles size={15} />
              <span>Daily Brain Teaser with IRIS</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              "If you drop a feather and a hammer on the Moon simultaneously, which lands first and why?"
            </p>
            <button
              onClick={() => {
                createNewChat('Moon gravity feather & hammer');
                addMessageToActiveChat({
                  role: 'user',
                  content: 'Explain what happens when a feather and hammer are dropped on the Moon, and why Galileo was right.',
                });
                setActiveTab('chat');
              }}
              className="text-xs text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Discuss with I.R.I.S.</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Middle Column: Upcoming Exam Countdown & Timetable (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Exam Countdown Card */}
          {nextExam && (
            <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Target Exam
                </span>
                <button
                  onClick={() => setActiveTab('exam-prep')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Exam Center →
                </button>
              </div>

              <h4 className="text-base font-bold text-white">{nextExam.subject}</h4>

              <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/20 text-center">
                <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-300 font-mono">
                  {Math.max(1, Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                </span>
                <span className="block text-[10px] uppercase font-semibold text-slate-400">
                  Days Until Examination
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-300">
                <span>Chapters Ready:</span>
                <strong className="text-cyan-300">
                  {nextExam.completedChapters} / {nextExam.totalChapters}
                </strong>
              </div>
            </div>
          )}

          {/* Today's Timetable Snippet */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" />
                <span>Next Scheduled Session</span>
              </h3>
              <button
                onClick={() => setActiveTab('planner')}
                className="text-xs text-cyan-400 hover:underline"
              >
                Timetable →
              </button>
            </div>

            {studyPlan[0] ? (
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-200">
                <div className="flex items-center justify-between font-mono text-[11px] text-cyan-300 mb-1">
                  <span>{studyPlan[0].timeSlot}</span>
                  <span className="text-indigo-300">{studyPlan[0].taskType}</span>
                </div>
                <div className="font-bold text-white">{studyPlan[0].topic}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{studyPlan[0].subject}</div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No scheduled sessions today.</p>
            )}
          </div>
        </div>

        {/* Right Column: Achievements & Quick Notebook (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Quick Notebook */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText size={16} className="text-cyan-400" />
                <span>Recent Notes</span>
              </h3>
              <button
                onClick={() => setActiveTab('notes')}
                className="text-xs text-cyan-400 hover:underline"
              >
                All Notes →
              </button>
            </div>

            <div className="space-y-2">
              {notes.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  onClick={() => setActiveTab('notes')}
                  className="p-2.5 rounded-xl glass-input hover:border-cyan-400/40 text-xs cursor-pointer transition-all"
                >
                  <h5 className="font-semibold text-white line-clamp-1">{n.title}</h5>
                  <span className="text-[10px] text-indigo-300 font-medium">{n.subject}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Badges Showcase */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Award size={16} className="text-amber-400" />
                <span>Badges Showcase</span>
              </h3>
              <button
                onClick={() => setActiveTab('achievements')}
                className="text-xs text-amber-400 hover:underline"
              >
                View all →
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {achievements.filter((a) => a.unlocked).slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] font-semibold text-amber-300"
                  title={badge.description}
                >
                  <Sparkles size={11} className="text-amber-400" />
                  <span>{badge.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
