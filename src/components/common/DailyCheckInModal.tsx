import React, { useState } from 'react';
import { X, Sparkles, Smile, Coffee, BatteryLow, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IrisAvatar } from './IrisAvatar';
import { dailyCheckinAPI } from '../../services/api';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, triggerCelebration } = useApp();
  const [mood, setMood] = useState<string>('Energized');
  const [goal, setGoal] = useState<string>('Tackle 1 chapter & solve 5 problems');
  const [obstacle, setObstacle] = useState<string>('');
  const [irisMessage, setIrisMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const moodOptions = [
    { label: 'Energized', icon: Zap, color: 'text-amber-400 border-amber-400/40 bg-amber-400/10' },
    { label: 'Great & Focused', icon: Smile, color: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' },
    { label: 'A Bit Tired', icon: Coffee, color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' },
    { label: 'A Little Stressed', icon: BatteryLow, color: 'text-rose-400 border-rose-400/40 bg-rose-400/10' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await dailyCheckinAPI({
        mood,
        todayGoal: goal + (obstacle ? ` (Challenge: ${obstacle})` : ''),
        studentName: profile.name,
      });
      setIrisMessage(response);
      triggerCelebration();
      // Increase streak or reward
      updateProfile({ streakDays: Math.max(profile.streakDays, profile.streakDays) });
    } catch (err) {
      setIrisMessage(
        `Hey ${profile.name}! Thank you for checking in with me. Remember: no matter how you're feeling today, we take it one step at a time. I've got your back!`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel-glow rounded-2xl p-6 border border-indigo-500/30 text-slate-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <IrisAvatar size="md" mood={isLoading ? 'thinking' : irisMessage ? 'happy' : 'speaking'} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                Daily Friend Check-in
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Good day, {profile.name}!
            </h3>
          </div>
        </div>

        {!irisMessage ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                How are you feeling right now?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = mood === item.label;
                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => setMood(item.label)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        isSelected
                          ? `${item.color} shadow-[0_0_15px_rgba(59,130,246,0.3)]`
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                What's one thing you want to accomplish today?
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Master rotational torque equations or write 1 essay..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Anything feeling a bit heavy or difficult? (Optional)
              </label>
              <input
                type="text"
                value={obstacle}
                onChange={(e) => setObstacle(e.target.value)}
                placeholder="e.g. Feeling sleepy, or organic chemistry reactions..."
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Sparkles size={16} className="animate-spin" />
                    <span>IRIS is thinking...</span>
                  </>
                ) : (
                  <>
                    <Heart size={16} className="text-pink-300" />
                    <span>Check In With Iris</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/80 to-blue-950/60 border border-cyan-400/30 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {irisMessage}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={16} />
                <span>Daily streak confirmed: {profile.streakDays} Days 🔥</span>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium transition-all shadow-md cursor-pointer"
              >
                Let's Get Started!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
