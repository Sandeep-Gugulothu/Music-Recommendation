import React, { useState } from 'react';
import { X, Sparkles, LogIn, UserPlus, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, signup, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, username, fullName);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await demoLogin();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 overflow-hidden">
        {/* Glowing Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-spotify-green/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-spotify-green to-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-spotify-green/30">
            {authModalMode === 'login' ? (
              <LogIn className="w-6 h-6 text-black" />
            ) : (
              <UserPlus className="w-6 h-6 text-black" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white">
            {authModalMode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login'
              ? 'Sign in to access your taste profile & custom playlists.'
              : 'Sign up to discover personalized music recommendations.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authModalMode === 'signup' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Username
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="alex_music"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-spotify-green hover:bg-spotify-hover text-black font-bold text-sm shadow-lg shadow-spotify-green/25 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              'Processing...'
            ) : authModalMode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Create Account
              </>
            )}
          </button>
        </form>

        {/* Demo Account Button */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={handleDemoClick}
            disabled={isSubmitting}
            type="button"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/30 hover:to-cyan-600/30 border border-purple-500/30 text-purple-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            Quick Demo Login (1-Click Test)
          </button>
        </div>

        {/* Switch mode */}
        <div className="mt-4 text-center text-xs text-slate-400">
          {authModalMode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => openAuthModal('signup')}
                className="text-spotify-green font-semibold hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => openAuthModal('login')}
                className="text-spotify-green font-semibold hover:underline"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
