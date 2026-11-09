import React, { useState, useEffect } from 'react';
import {
  Users,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Brain,
  Award,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IrisAvatar } from '../common/IrisAvatar';
import { sendChatMessage } from '../../services/api';

export const StudyTogether: React.FC = () => {
  const {
    profile,
    activeStudySession,
    startStudySession,
    pauseStudySession,
    resumeStudySession,
    endStudySession,
    triggerCelebration,
    updateProfile,
  } = useApp();

  const [subject, setSubject] = useState(profile.favoriteSubject || 'Physics');
  const [topic, setTopic] = useState('Rotational Dynamics & Torque');
  const [goal, setGoal] = useState('Solve 8 problems and master conservation of angular momentum');
  const [duration, setDuration] = useState<number>(25);

  const [sessionTasks, setSessionTasks] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: '1', text: 'Review moment of inertia formulas for disc and sphere', done: true },
    { id: '2', text: 'Solve problem on rolling down an inclined plane', done: false },
    { id: '3', text: 'Summarize angular momentum conservation conditions', done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Live doubt clearing inside study session
  const [doubtInput, setDoubtInput] = useState('');
  const [doubtHistory, setDoubtHistory] = useState<Array<{ q: string; a: string }>>([
    {
      q: 'Does friction do work in pure rolling without slipping?',
      a: 'Great question! In pure rolling without slipping, static friction acts at the instantaneous point of contact, which is momentarily at rest relative to the surface. Hence, static friction does NO work (work = 0) and mechanical energy is conserved!',
    },
  ]);
  const [isAnsweringDoubt, setIsAnsweringDoubt] = useState(false);

  // Ambient sound synthesizer using Web Audio API
  const [ambientSound, setAmbientSound] = useState<'none' | 'focus' | 'rain' | 'cosmic'>('none');
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [activeNodes, setActiveNodes] = useState<any[]>([]);

  // Stop ambient sound on unmount
  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  const playAmbient = (type: 'focus' | 'rain' | 'cosmic') => {
    stopAmbient();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const nodes: any[] = [];

      if (type === 'focus') {
        // Binaural beat ~ 200Hz + 210Hz
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.04;
        osc1.frequency.value = 196; // G3
        osc2.frequency.value = 206; // 10Hz Alpha wave difference
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        nodes.push(osc1, osc2, gain);
      } else if (type === 'rain' || type === 'cosmic') {
        // White noise filtered to sound like soothing rain/cosmic wind
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.value = type === 'rain' ? 600 : 250;

        const gain = ctx.createGain();
        gain.gain.value = 0.03;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        nodes.push(noise, filter, gain);
      }

      setAudioCtx(ctx);
      setActiveNodes(nodes);
      setAmbientSound(type);
    } catch (e) {
      console.warn('Audio ambient initialization', e);
    }
  };

  const stopAmbient = () => {
    activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    if (audioCtx && audioCtx.state !== 'closed') {
      try {
        audioCtx.close();
      } catch (e) {}
    }
    setActiveNodes([]);
    setAudioCtx(null);
    setAmbientSound('none');
  };

  const handleStartSession = () => {
    startStudySession(subject, topic, goal, duration);
  };

  const handleToggleTask = (id: string) => {
    setSessionTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.done;
          if (next) triggerCelebration();
          return { ...t, done: next };
        }
        return t;
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setSessionTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput('');
  };

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtInput.trim() || isAnsweringDoubt) return;

    const userQuestion = doubtInput.trim();
    setDoubtInput('');
    setIsAnsweringDoubt(true);

    try {
      const response = await sendChatMessage({
        messages: [
          {
            role: 'user',
            content: `[STUDY TOGETHER LIVE SESSION - Subject: ${subject}, Topic: ${topic}]
Student Question: ${userQuestion}

Please provide an ultra-clear, concise (3-4 sentences), highly intuitive explanation to help the student continue their study session smoothly without losing flow.`,
          },
        ],
        studentProfile: profile,
        aiMode: 'default',
        learningMode: 'Doubt Clearing',
        personalityStyle: 'Focused Study Partner',
      });

      setDoubtHistory((prev) => [{ q: userQuestion, a: response }, ...prev]);
    } catch (err: any) {
      setDoubtHistory((prev) => [
        {
          q: userQuestion,
          a: "I'm checking my notes... let's pause and verify this concept in a moment!",
        },
        ...prev,
      ]);
    } finally {
      setIsAnsweringDoubt(false);
    }
  };

  const mins = Math.floor(activeStudySession.timeRemaining / 60);
  const secs = activeStudySession.timeRemaining % 60;
  const progressPercent =
    ((activeStudySession.initialTime - activeStudySession.timeRemaining) /
      activeStudySession.initialTime) *
    100;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-indigo-900/40">
        <div className="flex items-center gap-3.5">
          <IrisAvatar size="lg" mood={activeStudySession.isActive ? 'happy' : 'idle'} showStatusBadge />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-cyan-300 border border-cyan-400/30">
                Co-Learning Sanctuary
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1">Study Together with I.R.I.S.</h1>
            <p className="text-xs text-slate-400">
              Work alongside your AI companion with deep focus sprints, live doubt clearance, and zero fatigue.
            </p>
          </div>
        </div>

        {/* Ambient audio presets */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-indigo-900/30">
          <span className="text-[11px] font-medium text-slate-400 px-1">Ambient:</span>
          {(['none', 'focus', 'rain', 'cosmic'] as const).map((type) => (
            <button
              key={type}
              onClick={() => (type === 'none' ? stopAmbient() : playAmbient(type))}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize cursor-pointer ${
                ambientSound === type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'none' ? 'Mute' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Active Focus Center vs Live Companion Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Focus Timer & Mini-Tasks (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Timer Card */}
          <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-indigo-500/30 text-center relative overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {!activeStudySession.isActive ? (
              <div className="space-y-4 max-w-md mx-auto text-left">
                <h3 className="text-base font-bold text-white text-center mb-4">
                  Configure Your Study Session
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">Chapter / Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Thermodynamics, Calculus Integration..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Session Goal</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master formula derivations and 5 numericals"
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[15, 25, 45, 60].map((minsOption) => (
                      <button
                        key={minsOption}
                        type="button"
                        onClick={() => setDuration(minsOption)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          duration === minsOption
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                            : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {minsOption}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleStartSession}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Play size={18} />
                    <span>Begin Session With I.R.I.S.</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                    {activeStudySession.subject}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {activeStudySession.topic}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    🎯 Goal: {activeStudySession.goal}
                  </p>
                </div>

                {/* Big Clock */}
                <div className="py-4">
                  <div className="text-6xl sm:text-7xl font-mono font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                    {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
                  </div>

                  {/* Progress bar */}
                  <div className="w-full max-w-sm mx-auto h-2 bg-slate-900 rounded-full mt-4 overflow-hidden border border-indigo-900/40">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                    />
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-3">
                  {activeStudySession.isPaused ? (
                    <button
                      onClick={resumeStudySession}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    >
                      <Play size={16} />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <button
                      onClick={pauseStudySession}
                      className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-600/30 cursor-pointer"
                    >
                      <Pause size={16} />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={() => endStudySession(true)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>Complete Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mini Tasks Checklist */}
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Session Action Items</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/40 text-cyan-300">
                  {sessionTasks.filter((t) => t.done).length}/{sessionTasks.length} Done
                </span>
              </h3>
            </div>

            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add sub-task or problem to solve..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </form>

            <div className="space-y-2">
              {sessionTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    task.done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                      : 'glass-input text-slate-200 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {task.done ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-500 shrink-0" />
                    )}
                    <span>{task.text}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSessionTasks((prev) => prev.filter((t) => t.id !== task.id));
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Doubt Clearing with I.R.I.S. (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col h-full">
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 flex-1 flex flex-col">
            <div className="flex items-center gap-3 pb-3 border-b border-indigo-900/20">
              <IrisAvatar size="sm" mood={isAnsweringDoubt ? 'thinking' : 'speaking'} />
              <div>
                <h3 className="text-sm font-bold text-white">Live Companion Chat</h3>
                <p className="text-[11px] text-slate-400">
                  Got stuck? Ask doubts without leaving your focus flow.
                </p>
              </div>
            </div>

            {/* Doubts stream */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 max-h-[420px]">
              {doubtHistory.map((item, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="bg-indigo-950/60 p-2.5 rounded-xl border border-indigo-500/20 text-slate-200">
                    <strong className="text-cyan-300">You: </strong>
                    {item.q}
                  </div>
                  <div className="glass-panel p-3 rounded-xl border-cyan-400/20 text-slate-200 leading-relaxed">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-semibold mb-1">
                      <Sparkles size={13} className="text-cyan-400" />
                      <span>I.R.I.S.</span>
                    </div>
                    {item.a}
                  </div>
                </div>
              ))}

              {isAnsweringDoubt && (
                <div className="flex items-center gap-2 text-xs text-cyan-300 p-2">
                  <Brain size={14} className="animate-spin" />
                  <span>IRIS is answering your question...</span>
                </div>
              )}
            </div>

            {/* Ask Doubt input */}
            <form onSubmit={handleAskDoubt} className="pt-3 border-t border-indigo-900/20 flex gap-2">
              <input
                type="text"
                value={doubtInput}
                onChange={(e) => setDoubtInput(e.target.value)}
                placeholder="Ask a quick doubt..."
                className="flex-1 px-3 py-2 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
              />
              <button
                type="submit"
                disabled={!doubtInput.trim() || isAnsweringDoubt}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
