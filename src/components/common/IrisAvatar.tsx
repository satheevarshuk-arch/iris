import React from 'react';
import { Sparkles, Bot, BrainCircuit, Heart, MessageSquare } from 'lucide-react';

interface IrisAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'idle' | 'thinking' | 'speaking' | 'happy' | 'listening';
  showStatusBadge?: boolean;
}

export const IrisAvatar: React.FC<IrisAvatarProps> = ({
  size = 'md',
  mood = 'idle',
  showStatusBadge = false,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const iconSizeMap = {
    sm: 16,
    md: 22,
    lg: 32,
    xl: 48,
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer ambient pulsing halo */}
      <div
        className={`absolute rounded-full transition-all duration-700 ${
          mood === 'thinking'
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 animate-spin opacity-60 blur-md'
            : mood === 'speaking'
            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse opacity-70 blur-md'
            : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-40 blur-sm'
        } ${sizeMap[size]}`}
      />

      {/* Futuristic orb body */}
      <div
        className={`relative rounded-full flex items-center justify-center overflow-hidden border border-cyan-400/30 bg-gradient-to-b from-[#111e42] to-[#070d1e] shadow-lg transition-transform duration-300 ${
          mood === 'speaking' ? 'scale-105' : 'hover:scale-105'
        } ${sizeMap[size]}`}
      >
        {/* Internal orbital grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.25),transparent_60%)]" />

        {/* Central Iris core icon */}
        <div className="relative z-10 text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]">
          {mood === 'thinking' ? (
            <BrainCircuit size={iconSizeMap[size]} className="animate-pulse text-indigo-300" />
          ) : mood === 'happy' ? (
            <Heart size={iconSizeMap[size]} className="text-pink-400 animate-bounce" />
          ) : mood === 'speaking' ? (
            <Sparkles size={iconSizeMap[size]} className="animate-spin text-cyan-200" />
          ) : (
            <Bot size={iconSizeMap[size]} className="text-cyan-300" />
          )}
        </div>

        {/* Dynamic eye/light reflections */}
        <div className="absolute top-1 left-2 w-2 h-1 bg-white/60 rounded-full blur-[0.5px]" />
      </div>

      {/* Online / Ready Status Pip */}
      {showStatusBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#050b18]" />
        </span>
      )}
    </div>
  );
};
