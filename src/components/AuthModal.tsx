import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  CloudCheck,
  CloudUpload,
  LogOut,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    resetPassword,
    syncNow,
    syncState,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await registerWithEmail(email, password, displayName);
        onClose();
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset link sent to your email.');
      }
    } catch (err: any) {
      console.error(err);
      const code = err.code;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Incorrect email or password.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('No account found with this email.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setIsSubmitting(true);
    try {
      await logout();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSubmitting(true);
    try {
      await syncNow();
      setSuccessMsg('Custom Wazifahs and metrics synced successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg('Sync failed. Check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-sans">
                {currentUser ? 'Wazifah Account & Cloud' : 'Sign In to Wazifah Cloud'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {currentUser ? 'Your custom routines & metrics are synced' : 'Backup your custom Wazifahs & daily metrics'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/60 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md border border-amber-300/40 shrink-0">
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-100 truncate text-sm">
                    {currentUser.displayName || 'Wazifah Practitioner'}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CloudCheck className="w-3 h-3" />
                      <span>Cloud Sync Active</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Custom Wazifahs:</span>
                  <span className="font-bold text-amber-300">Auto-Synced</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Session History & Metrics:</span>
                  <span className="font-bold text-emerald-300">Backed Up to Cloud</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Sync Status:</span>
                  <span className="font-mono text-slate-400 capitalize">{syncState}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleManualSync}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>Sync Cloud Now</span>
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs font-semibold text-rose-300 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-4">
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 transition-colors shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <div className="flex-1 h-px bg-slate-800" />
                <span>or use email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Mode Tabs */}
              <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    mode === 'signin'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${
                    mode === 'signup'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block font-medium">Full Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 block font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400 block font-medium">Password</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setErrorMsg(null);
                          }}
                          className="text-[10px] text-amber-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? 'Processing...'
                    : mode === 'signin'
                    ? 'Sign In to Sync'
                    : mode === 'signup'
                    ? 'Create Free Account'
                    : 'Send Password Reset Link'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 text-center">
          <button
            onClick={onClose}
            className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            {currentUser ? 'Close' : 'Continue as Guest (Local Only)'}
          </button>
        </div>
      </div>
    </div>
  );
};
