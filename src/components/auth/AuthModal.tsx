import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { IrisAvatar } from '../common/IrisAvatar';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPasswordForEmail,
  isSupabaseConfigured,
} from '../../services/supabase';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { updateProfile, triggerCelebration } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Class 11 / Grade 11');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { user, error } = await signInWithEmail(email, password);
        if (error) throw new Error(error);

        triggerCelebration();
        updateProfile({
          name: user?.user_metadata?.name || email.split('@')[0] || 'Student',
        });
        setSuccessMsg('Welcome back! Your student session is active.');
        setTimeout(() => onClose(), 1200);
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please re-enter.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        if (!agreeTerms) {
          throw new Error('Please agree to the privacy policy to continue.');
        }

        const { user, error } = await signUpWithEmail(
          email,
          password,
          name.trim() || 'Student',
          grade
        );
        if (error) throw new Error(error);

        triggerCelebration();
        updateProfile({
          name: name.trim() || 'Student',
          grade,
        });
        setSuccessMsg(
          isSupabaseConfigured
            ? 'Account created! Check your email for verification.'
            : 'Welcome to I.R.I.S.! Account successfully initialized.'
        );
        setTimeout(() => onClose(), 1500);
      } else if (mode === 'forgot') {
        const { error } = await resetPasswordForEmail(email);
        if (error) throw new Error(error);

        setSuccessMsg('Password recovery instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const demoEmail = 'alex.student@iris.edu';
      const { user } = await signInWithEmail(demoEmail, 'demo12345');
      triggerCelebration();
      updateProfile({
        name: 'Alex',
        grade: 'Class 11 / Grade 11',
      });
      setSuccessMsg('Signed in as Alex (Student Account)!');
      setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/30 text-slate-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Brand & Companion Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <IrisAvatar size="lg" mood="happy" showStatusBadge />
          <h2 className="text-xl sm:text-2xl font-black text-white mt-3 tracking-tight">
            {mode === 'login'
              ? 'Welcome back to I.R.I.S.'
              : mode === 'signup'
              ? 'Join the I.R.I.S. Universe'
              : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {mode === 'login'
              ? 'Sign in to access your personal AI tutor, notes, and study memory.'
              : mode === 'signup'
              ? 'Create your private student space with real PostgreSQL database persistence.'
              : 'Enter your registered email and we will send password reset instructions.'}
          </p>

          {/* Supabase Status Pill */}
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-indigo-900/50 text-[11px]">
            <Database size={12} className={isSupabaseConfigured ? 'text-emerald-400' : 'text-cyan-400'} />
            <span className="text-slate-300">
              Backend:{' '}
              <strong className={isSupabaseConfigured ? 'text-emerald-300' : 'text-cyan-300'}>
                {isSupabaseConfigured ? 'Supabase Live Connected' : 'Supabase Ready (Demo Mode)'}
              </strong>
            </span>
            <button
              onClick={() => setShowSetupGuide(true)}
              className="ml-1 text-cyan-400 hover:underline flex items-center text-[10px]"
            >
              Guide
            </button>
          </div>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full / Preferred Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-cyan-400 hover:underline text-[11px]"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-slate-100 placeholder-slate-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Academic Level (Optional)</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-200 focus:outline-none"
                >
                  <option value="Class 11 / Grade 11">Class 11 / Grade 11</option>
                  <option value="Class 12 / Grade 12">Class 12 / Grade 12</option>
                  <option value="Class 9-10 / Middle High">Class 9-10 / Middle High</option>
                  <option value="Undergraduate / College">Undergraduate / College</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 pt-1">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>I agree to the secure student privacy and data policy.</span>
              </label>
            </>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                />
                <span>Remember session</span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Sparkles size={15} className="animate-spin text-cyan-300" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Sign In to I.R.I.S.'
                    : mode === 'signup'
                    ? 'Create Student Account'
                    : 'Send Reset Link'}
                </span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Sign-In */}
        {mode === 'login' && (
          <div className="mt-3">
            <button
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl glass-input hover:border-cyan-400/40 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Instant Demo Student Sign-In</span>
            </button>
          </div>
        )}

        {/* Switch Mode Links */}
        <div className="mt-5 pt-4 border-t border-indigo-900/20 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-cyan-400 font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Supabase Setup Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-400/40 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setShowSetupGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
              <Database size={20} />
              <span>Supabase Backend Configuration Guide</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              I.R.I.S. is pre-wired with full PostgreSQL schema and Row Level Security. To link your own Supabase cloud database:
            </p>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal pl-4 leading-relaxed">
              <li>
                Create a free project at <strong className="text-cyan-300">supabase.com</strong>.
              </li>
              <li>
                Open the Supabase <strong>SQL Editor</strong> and execute the contents of{' '}
                <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">supabase-schema.sql</code>{' '}
                (already generated in your workspace).
              </li>
              <li>
                In <strong>Project Settings &gt; API</strong>, copy your Project URL and anon public key.
              </li>
              <li>
                Add to your environment variables or <code className="text-indigo-300">.env</code>:
                <pre className="mt-1 p-2 rounded-lg bg-black/70 text-cyan-300 font-mono text-[11px] overflow-x-auto">
{`VITE_SUPABASE_URL="https://xyz.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."`}
                </pre>
              </li>
              <li>
                Create storage buckets: <code className="text-cyan-300">student-documents</code>,{' '}
                <code className="text-cyan-300">notes-attachments</code>,{' '}
                <code className="text-cyan-300">profile-avatars</code>.
              </li>
            </ol>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowSetupGuide(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
