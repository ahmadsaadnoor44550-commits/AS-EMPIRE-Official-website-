import React, { useState } from 'react';
import { useAuth, PRIMARY_OWNER_EMAIL } from '../../context/AuthContext';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  AlertCircle, 
  ArrowRight,
  User,
  Phone,
  Crown
} from 'lucide-react';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerAuthModal: React.FC<OwnerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { 
    login, 
    registerOwner, 
    loginWithGoogle, 
    error, 
    clearError 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (mode === 'register') {
      if (!fullName.trim()) {
        setLocalError('Please enter the owner full name.');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please re-enter.');
        return;
      }

      setLoading(true);
      try {
        await registerOwner({
          fullName,
          email,
          phone,
          pass: password,
        });
        onSuccess();
        onClose();
      } catch (err: any) {
        if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
          setLocalError("Email/Password registration is not yet enabled in your Firebase Console. Please click 'Continue with Google Account' above to sign in instantly with your owner email (ahmadsaadnoor44550@gmail.com).");
        } else {
          setLocalError(err?.message || 'Owner account registration failed.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setLocalError('Please enter owner email and password.');
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
        onSuccess();
        onClose();
      } catch (err: any) {
        if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
          setLocalError("Email/Password sign-in is not yet enabled in your Firebase Console. Please click 'Continue with Google Account' above to sign in instantly with your owner email (ahmadsaadnoor44550@gmail.com).");
        } else {
          setLocalError(err?.message || 'Login failed. Please verify credentials.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in was cancelled or failed.';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Badge & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
            <Crown className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Private Owner Portal
          </div>

          <h3 className="font-empire text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Owner Sign In' : 'First-Time Owner Registration'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === 'login'
              ? 'Authorized access only. Customers cannot access this dashboard.'
              : 'Create your secure owner account to manage products, settings, and orders.'}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Owner Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLocalError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register Owner Account
          </button>
        </div>

        {/* Error notification */}
        {(localError || error) && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google Account</span>
        </button>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex-1 h-px bg-slate-200" />
          <span>or with your owner credentials</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmad Saad"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Owner Contact / WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="03330916398"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Owner Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="ahmadsaadnoor44550@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Confirm Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Access Owner Dashboard' : 'Complete Owner Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
