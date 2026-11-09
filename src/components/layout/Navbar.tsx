import React from 'react';
import {
  Flame,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  HeartHandshake,
  User,
  Menu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IrisAvatar } from '../common/IrisAvatar';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenCheckIn: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenCheckIn,
  activeTab,
  setActiveTab,
}) => {
  const {
    profile,
    activeStudySession,
    isSpeaking,
    stopSpeaking,
    authUser,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-indigo-900/30 px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <IrisAvatar size="sm" mood="idle" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 text-lg sm:text-xl">
                I.R.I.S.
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                v2.5 Neo
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight hidden md:inline-block">
              Intelligent Research, Innovation & Study
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Active Focus Session status if running */}
      {activeStudySession.isActive && (
        <div
          onClick={() => setActiveTab('study-together')}
          className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-cyan-400/40 text-xs cursor-pointer hover:border-cyan-300 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] animate-pulse"
        >
          <Clock size={14} className="text-cyan-400 animate-spin" />
          <span className="text-slate-300">
            Studying: <strong className="text-white">{activeStudySession.topic || activeStudySession.subject}</strong>
          </span>
          <span className="text-cyan-300 font-mono font-bold bg-cyan-900/60 px-2 py-0.5 rounded-full">
            {Math.floor(activeStudySession.timeRemaining / 60)}:
            {(activeStudySession.timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Right: Quick actions, Streak, TTS speaker, Daily Checkin, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* TTS Speech control indicator */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-950/70 border border-pink-500/40 text-pink-300 text-xs hover:bg-pink-900/80 transition-all cursor-pointer animate-pulse"
            title="Stop Speech"
          >
            <VolumeX size={14} />
            <span className="hidden sm:inline">IRIS Speaking</span>
          </button>
        )}

        {/* Daily Friend Check-in Button */}
        <button
          onClick={onOpenCheckIn}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-indigo-500/30 text-indigo-200 text-xs font-medium hover:border-cyan-400/50 hover:text-white transition-all cursor-pointer"
        >
          <HeartHandshake size={14} className="text-pink-400" />
          <span className="hidden sm:inline">Daily Check-in</span>
        </button>

        {/* Learning Streak Pill */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-900/50 transition-all"
          title={`${profile.streakDays} Day Learning Streak!`}
        >
          <Flame size={15} className="text-amber-400 animate-bounce" />
          <span>{profile.streakDays}</span>
        </div>

        {/* Supabase Account / Student Profile Button */}
        <button
          onClick={() => {
            if (!isAuthenticated && !authUser) {
              setIsAuthModalOpen(true);
              setAuthModalMode('login');
            } else {
              setActiveTab('settings');
            }
          }}
          className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl glass-card hover:border-cyan-400/50 transition-all cursor-pointer"
          title={isAuthenticated ? 'Signed in with Supabase' : 'Sign in to sync your data'}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            {profile.name.charAt(0) || 'A'}
          </div>
          <div className="flex flex-col text-left hidden sm:flex">
            <span className="text-xs font-medium text-slate-200">
              {profile.name}
            </span>
            <span className="text-[9px] text-cyan-400 font-mono">
              {isAuthenticated ? 'Supabase Sync' : 'Sign In'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
};
