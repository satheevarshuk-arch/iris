import React, { useState } from 'react';
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { studyPlannerAPI } from '../../services/api';

export const StudyPlanner: React.FC = () => {
  const { profile, studyPlan, setStudyPlan, togglePlanItem, triggerCelebration } = useApp();

  const [activeView, setActiveView] = useState<'timetable' | 'ai_roadmap'>('timetable');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  // AI Timetable generation parameters
  const [examDate, setExamDate] = useState('2026-04-15');
  const [availableHours, setAvailableHours] = useState<number>(3);
  const [weakAreas, setWeakAreas] = useState(profile.difficultTopics.join(', '));
  const [isLoading, setIsLoading] = useState(false);
  const [aiGeneratedRoadmap, setAiGeneratedRoadmap] = useState<string | null>(null);

  // Quick manual slot adder
  const [slotTime, setSlotTime] = useState('04:00 PM - 05:00 PM');
  const [slotSubject, setSlotSubject] = useState(profile.favoriteSubject || 'Physics');
  const [slotTopic, setSlotTopic] = useState('');
  const [slotType, setSlotType] = useState<'Theory' | 'Practice' | 'Revision' | 'Mock Test'>('Practice');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const currentDaySlots = studyPlan.filter((s) => s.day === selectedDay);

  const handleGenerateAIPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const plan = await studyPlannerAPI({
        subjects: profile.subjects,
        examDate,
        availableHoursPerDay: availableHours,
        currentWeaknesses: weakAreas,
      });

      setAiGeneratedRoadmap(plan);
      setActiveView('ai_roadmap');
      triggerCelebration();
    } catch (err: any) {
      alert(`Could not generate AI plan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotTopic.trim()) return;

    setStudyPlan((prev) => [
      ...prev,
      {
        id: `sp_${Date.now()}`,
        day: selectedDay,
        timeSlot: slotTime,
        subject: slotSubject,
        topic: slotTopic.trim(),
        taskType: slotType,
        completed: false,
      },
    ]);

    setSlotTopic('');
  };

  const handleDeleteSlot = (id: string) => {
    setStudyPlan((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Cognitive Time Architecture
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Smart Study Planner</h1>
          <p className="text-xs text-slate-400">
            Intelligent balanced timetables, spaced revisions, and adaptive study roadmaps designed to avoid burnout.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 p-1 rounded-xl glass-input">
          <button
            onClick={() => setActiveView('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'timetable'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly Timetable
          </button>
          <button
            onClick={() => setActiveView('ai_roadmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'ai_roadmap'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Sprint Roadmap
          </button>
        </div>
      </div>

      {activeView === 'timetable' ? (
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {daysOfWeek.map((day) => {
              const daySlots = studyPlan.filter((s) => s.day === day);
              const doneCount = daySlots.filter((s) => s.completed).length;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex flex-col items-center gap-1 ${
                    selectedDay === day
                      ? 'bg-gradient-to-b from-indigo-600 to-blue-600 text-white shadow-lg border border-cyan-400/40'
                      : 'glass-input text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {doneCount}/{daySlots.length} Done
                  </span>
                </button>
              );
            })}
          </div>

          {/* Slots for Selected Day */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slot list (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock size={16} className="text-cyan-400" />
                  <span>Scheduled Sessions for {selectedDay}</span>
                </h3>
              </div>

              {currentDaySlots.length > 0 ? (
                currentDaySlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => togglePlanItem(slot.id)}
                    className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      slot.completed
                        ? 'border-emerald-500/30 bg-emerald-950/20 opacity-75'
                        : 'border-indigo-900/40 hover:border-cyan-400/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {slot.completed ? (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                      ) : (
                        <Circle size={18} className="text-slate-500 shrink-0" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-300">
                            {slot.timeSlot}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/20 font-semibold">
                            {slot.taskType}
                          </span>
                        </div>
                        <h4
                          className={`text-sm font-bold text-white mt-1 ${
                            slot.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {slot.topic}
                        </h4>
                        <span className="text-xs text-slate-400">{slot.subject}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlot(slot.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
                  No slots scheduled for {selectedDay}. Add one below or use the AI Roadmap!
                </div>
              )}
            </div>

            {/* Quick Add Slot Panel */}
            <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-4 h-fit">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-cyan-400" />
                <span>Add Time Block</span>
              </h3>

              <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Time Range</label>
                  <input
                    type="text"
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    placeholder="e.g. 05:00 PM - 06:00 PM"
                    className="w-full p-2 rounded-xl glass-input text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Subject</label>
                  <select
                    value={slotSubject}
                    onChange={(e) => setSlotSubject(e.target.value)}
                    className="w-full p-2 rounded-xl glass-input text-slate-200 focus:outline-none"
                  >
                    {profile.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Topic / Objective</label>
                  <input
                    type="text"
                    value={slotTopic}
                    onChange={(e) => setSlotTopic(e.target.value)}
                    placeholder="e.g. Electromagnetic induction numericals"
                    className="w-full p-2 rounded-xl glass-input text-slate-100 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Session Type</label>
                  <select
                    value={slotType}
                    onChange={(e) => setSlotType(e.target.value as any)}
                    className="w-full p-2 rounded-xl glass-input text-slate-200 focus:outline-none"
                  >
                    <option value="Theory">Theory & Reading</option>
                    <option value="Practice">Problem Solving / Practice</option>
                    <option value="Revision">Active Revision</option>
                    <option value="Mock Test">Mock Test / Timed Quiz</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all cursor-pointer shadow-md"
                >
                  Schedule Slot
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* AI Sprint Roadmap Generator */
        <div className="space-y-6">
          <form onSubmit={handleGenerateAIPlan} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400" />
              <span>AI Study Roadmap Generator</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Upcoming Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Available Study Hours/Day</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Priority Focus / Weak Topics</label>
                <input
                  type="text"
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  placeholder="e.g. Rotational torque, Organic mechanisms"
                  className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/30 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Sparkles size={15} className="animate-spin text-cyan-300" />
                    <span>Synthesizing Optimal Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Generate AI Study Timetable</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {aiGeneratedRoadmap && (
            <div className="glass-panel-glow p-6 sm:p-8 rounded-2xl border-cyan-400/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400" />
                <span>Generated Personalized Roadmap & Spaced Plan</span>
              </h3>

              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {aiGeneratedRoadmap}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
