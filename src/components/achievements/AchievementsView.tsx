import React from 'react';
import {
  Award,
  Sparkles,
  Flame,
  BrainCircuit,
  Hourglass,
  ShieldCheck,
  Terminal,
  Trophy,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AchievementsView: React.FC = () => {
  const { achievements } = useApp();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return Sparkles;
      case 'Flame':
        return Flame;
      case 'BrainCircuit':
        return BrainCircuit;
      case 'Award':
        return Award;
      case 'Hourglass':
        return Hourglass;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Terminal':
        return Terminal;
      case 'Trophy':
        return Trophy;
      default:
        return Award;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-400/30">
              Gamified Mastery System
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Learning Achievements & Badges</h1>
          <p className="text-xs text-slate-400">
            Celebrate study milestones, consistency streaks, quiz excellence, and coding triumphs with I.R.I.S.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-400/30 flex items-center justify-center text-amber-400">
          <Award size={24} />
        </div>
      </div>

      {/* Progress banner */}
      <div className="glass-panel-glow p-5 rounded-2xl border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              {unlockedCount} of {achievements.length} Badges Unlocked
            </h3>
            <span className="text-xs text-slate-400">
              Keep completing focus sprints, taking quizzes, and building habits to unlock more!
            </span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((badge) => {
          const Icon = getIcon(badge.icon);

          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                badge.unlocked
                  ? 'glass-card border-amber-500/30 hover:border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'glass-panel border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      badge.unlocked
                        ? 'bg-amber-950/80 border border-amber-500/40 text-amber-400'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}
                  >
                    <Icon size={24} />
                  </div>

                  {badge.unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <CheckCircle2 size={13} />
                      <span>Earned</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <Lock size={13} />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{badge.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-indigo-900/20 text-[10px]">
                {badge.unlocked ? (
                  <span className="text-amber-300 font-medium">Unlocked: {badge.unlockedAt}</span>
                ) : badge.maxProgress ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Progress:</span>
                      <span>
                        {badge.progress} / {badge.maxProgress}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{
                          width: `${((badge.progress || 0) / badge.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500">In Progress</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
