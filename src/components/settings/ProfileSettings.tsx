import React, { useState } from 'react';
import {
  Brain,
  User,
  Sliders,
  ShieldCheck,
  Plus,
  Trash2,
  Download,
  RotateCcw,
  Sparkles,
  Heart,
  Check,
  LogOut,
  KeyRound,
  Database,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PersonalityStyle } from '../../types';
import {
  updateUserPassword,
  uploadDocumentToSupabase,
  isSupabaseConfigured,
} from '../../services/supabase';

export const ProfileSettings: React.FC = () => {
  const {
    profile,
    updateProfile,
    addMemoryFact,
    removeMemoryFact,
    clearAllMemories,
    triggerCelebration,
    authUser,
    isAuthenticated,
    logoutUser,
    deleteStudentAccount,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState(profile.grade);
  const [board, setBoard] = useState(profile.board);
  const [favoriteSubject, setFavoriteSubject] = useState(profile.favoriteSubject);
  const [personality, setPersonality] = useState<PersonalityStyle>(profile.personalityStyle);

  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state (Part 21.9)
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Avatar upload state (Part 21.6)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const personalityStyles: Array<{
    id: PersonalityStyle;
    title: string;
    description: string;
  }> = [
    {
      id: 'Friendly and Casual',
      title: 'Friendly & Casual',
      description: 'Warm, natural, conversational, like talking to your closest school friend.',
    },
    {
      id: 'Funny and Playful',
      title: 'Funny & Playful',
      description: 'Witty, lighthearted, high-energy banter, keeping stress light and fun.',
    },
    {
      id: 'Calm and Supportive',
      title: 'Calm & Supportive',
      description: 'Grounding, reassuring, mindful, and unhurried to ease academic stress.',
    },
    {
      id: 'Motivational',
      title: 'Motivational & Inspiring',
      description: 'Empowering, ambitious, focused on building a championship growth mindset.',
    },
    {
      id: 'Focused Study Partner',
      title: 'Focused Study Partner',
      description: 'Direct, disciplined, efficient, maximizing focus and minimizing fluff.',
    },
    {
      id: 'Detailed Explainer',
      title: 'Detailed Explainer',
      description: 'First-principles pedagogy, comprehensive breakdowns, and deep theoretical proofs.',
    },
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || 'Alex',
      grade,
      board,
      favoriteSubject,
      personalityStyle: personality,
    });
    setSavedSuccess(true);
    triggerCelebration();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryInput.trim()) return;
    addMemoryFact(newMemoryInput.trim());
    setNewMemoryInput('');
    triggerCelebration();
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus('Password must be at least 6 characters.');
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    try {
      const { error } = await updateUserPassword(newPassword);
      if (error) throw new Error(error);
      setPasswordStatus('Password updated successfully!');
      setNewPassword('');
      triggerCelebration();
    } catch (err: any) {
      setPasswordStatus(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!authUser?.id) {
      alert('Please sign in with Supabase to save custom avatars to storage.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const { url, error } = await uploadDocumentToSupabase(authUser.id, 'profile-avatars', file);
      if (error) throw new Error(error);
      if (url) {
        updateProfile({ avatarSeed: url });
        triggerCelebration();
      }
    } catch (err: any) {
      alert(`Avatar upload error: ${err.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleExportData = () => {
    const backupData = {
      profile,
      exportedAt: new Date().toISOString(),
      platform: 'I.R.I.S. Educational Universe',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iris_student_vault_${profile.name.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset your local data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Identity & Sovereignty
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Profile & Memory Vault</h1>
          <p className="text-xs text-slate-400">
            Customize student parameters, adjust I.R.I.S. personality, and inspect or edit what I.R.I.S. remembers about you.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <Brain size={24} />
        </div>
      </div>

      {/* Supabase Account & Authentication Card (Part 21.1 & 21.9) */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-indigo-900/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {profile.name.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                  {isAuthenticated ? 'Authenticated Student' : 'Demo Student Mode'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {isSupabaseConfigured ? '● Supabase PostgreSQL Active' : '○ Demo Database Active'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {authUser?.email || `${profile.name.toLowerCase()}@iris.edu`}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setAuthModalMode('login');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
              >
                Sign In with Supabase
              </button>
            ) : (
              <button
                type="button"
                onClick={logoutUser}
                className="px-4 py-2 rounded-xl glass-input hover:border-rose-400 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Change Password & Avatar Upload Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Password Change */}
          <form onSubmit={handlePasswordUpdate} className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
              <KeyRound size={13} className="text-cyan-400" />
              <span>Change Password</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="flex-1 p-2 rounded-xl glass-input text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isUpdatingPassword || !newPassword}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                {isUpdatingPassword ? 'Updating...' : 'Update'}
              </button>
            </div>
            {passwordStatus && (
              <p className="text-[11px] text-cyan-300 mt-1">{passwordStatus}</p>
            )}
          </form>

          {/* Profile Avatar Upload (Supabase Storage) */}
          <div className="space-y-2 text-xs">
            <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
              <Upload size={13} className="text-indigo-400" />
              <span>Upload Custom Avatar (Supabase Storage)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              disabled={isUploadingAvatar}
              className="w-full text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-950 file:text-cyan-300 hover:file:bg-cyan-900 cursor-pointer"
            />
            {isUploadingAvatar && (
              <p className="text-[11px] text-cyan-300">Uploading to Supabase Storage...</p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleProfileSave} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-6">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User size={16} className="text-cyan-400" />
          <span>Academic Profile & Demographics</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Your Preferred Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Class / Grade Level</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Academic Board / Curriculum</label>
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
            <label className="block text-slate-300 font-semibold mb-1">Favorite Subject</label>
            <input
              type="text"
              value={favoriteSubject}
              onChange={(e) => setFavoriteSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl glass-input text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Personality Selector */}
        <div className="space-y-3 pt-2">
          <label className="block text-slate-300 font-semibold text-xs flex items-center gap-2">
            <Sliders size={14} className="text-cyan-400" />
            <span>I.R.I.S. Companion Personality Style</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personalityStyles.map((item) => {
              const isSelected = personality === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setPersonality(item.id)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-blue-600/30 to-indigo-600/30 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)] font-semibold'
                      : 'glass-input text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-cyan-300 font-bold mb-1">{item.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              <Check size={14} />
              <span>Profile Updated!</span>
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            Save Profile & Personality
          </button>
        </div>
      </form>

      {/* Memory Vault (Part 1.3 Requirements) */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>Personal Memory Vault</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Everything I.R.I.S. knows about your learning style, goals, and syllabus. Full user sovereignty.
            </p>
          </div>

          {profile.memoryFacts.length > 0 && (
            <button
              onClick={clearAllMemories}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1 rounded-lg border border-rose-500/30 bg-rose-950/30 cursor-pointer"
            >
              Clear All Memories
            </button>
          )}
        </div>

        {/* Add new memory fact */}
        <form onSubmit={handleAddMemory} className="flex gap-2">
          <input
            type="text"
            value={newMemoryInput}
            onChange={(e) => setNewMemoryInput(e.target.value)}
            placeholder="Teach IRIS a new fact about yourself (e.g. 'I struggle with calculus limits on tests')..."
            className="flex-1 p-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Store Fact</span>
          </button>
        </form>

        {/* List of remembered facts */}
        <div className="space-y-2 pt-2">
          {profile.memoryFacts.map((fact, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl glass-input text-xs text-slate-200 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-indigo-400 shrink-0" />
                <span>{fact}</span>
              </div>
              <button
                onClick={() => removeMemoryFact(fact)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="Delete this fact"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {profile.memoryFacts.length === 0 && (
            <div className="p-6 text-center text-xs text-slate-500">
              No personalized memory records stored. You can add facts above anytime!
            </div>
          )}
        </div>
      </div>

      {/* Data Export & Danger Zone */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Data Export & Backup</h3>
          <p className="text-xs text-slate-400">
            Export your complete learning history, notes, flashcards, and memories as a local JSON file.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl glass-input hover:border-cyan-400/40 text-xs text-slate-200 font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} />
            <span>Export Data</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white glass-input text-xs font-medium cursor-pointer"
          >
            Reset Local Cache
          </button>

          <button
            onClick={() => {
              if (confirm('Permanently delete your student account and all database records? This cannot be undone.')) {
                deleteStudentAccount();
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <AlertTriangle size={14} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
