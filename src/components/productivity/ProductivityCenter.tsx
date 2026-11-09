import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Flame,
  Award,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProductivityCenter: React.FC = () => {
  const { profile, tasks, addTask, toggleTask, deleteTask, triggerCelebration } = useApp();

  // Task adder state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState(profile.favoriteSubject || 'Physics');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [taskMins, setTaskMins] = useState<number>(30);

  // Standalone Pomodoro Timer
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [pomoMode, setPomoMode] = useState<'work' | 'break'>('work');

  // Daily Habits
  const [habits, setHabits] = useState([
    { id: 'h1', title: 'Review 10 flashcards', done: true },
    { id: 'h2', title: 'Complete 1 Pomodoro sprint', done: true },
    { id: 'h3', title: 'Drink water & take 5-min eye break', done: true },
    { id: 'h4', title: 'Log doubts with I.R.I.S.', done: false },
    { id: 'h5', title: 'Plan tomorrow’s schedule before bed', done: false },
  ]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPomoRunning) {
      interval = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds((prev) => prev - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes((prev) => prev - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished
          triggerCelebration();
          setIsPomoRunning(false);
          if (pomoMode === 'work') {
            setPomoMode('break');
            setPomoMinutes(5);
            setPomoSeconds(0);
          } else {
            setPomoMode('work');
            setPomoMinutes(25);
            setPomoSeconds(0);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPomoRunning, pomoMinutes, pomoSeconds, pomoMode]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      subject: taskSubject,
      priority: taskPriority,
      estimatedMinutes: taskMins,
    });

    setTaskTitle('');
  };

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const next = !h.done;
          if (next) triggerCelebration();
          return { ...h, done: next };
        }
        return h;
      })
    );
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Productivity Hub
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Productivity & Task Center</h1>
          <p className="text-xs text-slate-400">
            Smart task organization, deep focus Pomodoro sprints, and atomic learning habits.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <CheckSquare size={24} />
        </div>
      </div>

      {/* Grid: Tasks + Pomodoro + Habits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Smart To-Do (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare size={16} className="text-cyan-400" />
                <span>Smart Academic Tasks</span>
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-900/40 text-cyan-300 font-semibold">
                {completedTasksCount}/{tasks.length} Completed
              </span>
            </div>

            {/* Task input form */}
            <form onSubmit={handleAddTask} className="space-y-3">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter study task or problem assignment..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
                required
              />

              <div className="grid grid-cols-3 gap-2">
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  className="px-2.5 py-2 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
                >
                  {profile.subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="px-2.5 py-2 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low Priority</option>
                </select>

                <button
                  type="submit"
                  className="py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </button>
              </div>
            </form>

            {/* Task list */}
            <div className="space-y-2 pt-2">
              {tasks.map((task) => {
                const priorityBadge =
                  task.priority === 'high'
                    ? 'text-rose-400 bg-rose-950/60 border-rose-500/30'
                    : task.priority === 'medium'
                    ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                    : 'text-slate-400 bg-slate-900 border-slate-700';

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
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

                      <div className="truncate">
                        <span className="font-medium text-slate-100">{task.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{task.subject}</span>
                          <span>•</span>
                          <span>~{task.estimatedMinutes || 30} mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pomodoro + Habits (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Pomodoro Timer */}
          <div className="glass-panel-glow p-6 rounded-2xl border-indigo-500/30 text-center relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/30">
              {pomoMode === 'work' ? 'Deep Work Interval' : 'Rest Break Interval'}
            </span>

            {/* Big Clock */}
            <div className="my-4 text-5xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
              {pomoMinutes.toString().padStart(2, '0')}:{pomoSeconds.toString().padStart(2, '0')}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  isPomoRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPomoRunning ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPomoRunning ? 'Pause' : 'Start Sprint'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  setPomoMinutes(25);
                  setPomoSeconds(0);
                }}
                className="p-2 rounded-xl glass-input text-slate-400 hover:text-white"
                title="Reset timer"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-indigo-900/20 text-xs">
              <button
                onClick={() => {
                  setPomoMode('work');
                  setPomoMinutes(25);
                  setPomoSeconds(0);
                  setIsPomoRunning(false);
                }}
                className="px-2.5 py-1 rounded-lg glass-input text-slate-300 hover:text-cyan-300"
              >
                25/5 Standard
              </button>
              <button
                onClick={() => {
                  setPomoMode('work');
                  setPomoMinutes(50);
                  setPomoSeconds(0);
                  setIsPomoRunning(false);
                }}
                className="px-2.5 py-1 rounded-lg glass-input text-slate-300 hover:text-cyan-300"
              >
                50/10 Deep
              </button>
            </div>
          </div>

          {/* Atomic Habits Tracker */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={16} className="text-amber-400" />
              <span>Daily Atomic Habits</span>
            </h3>

            <div className="space-y-2">
              {habits.map((h) => (
                <div
                  key={h.id}
                  onClick={() => toggleHabit(h.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                    h.done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                      : 'glass-input text-slate-200 hover:border-cyan-400/40'
                  }`}
                >
                  {h.done ? (
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Circle size={15} className="text-slate-500 shrink-0" />
                  )}
                  <span>{h.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
