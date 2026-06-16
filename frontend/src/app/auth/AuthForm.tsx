'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../components/Providers';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, UserCheck, Shield, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register, user } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'RECRUITER' | 'ADMIN'>('STUDENT');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle URL params like ?tab=register
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setErrorMsg(result.error || 'Invalid credentials');
        }
      } else {
        const result = await register(name, email, password, role);
        if (!result.success) {
          setErrorMsg(result.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setErrorMsg('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'student' | 'recruiter' | 'admin') => {
    setErrorMsg('');
    setLoading(true);
    const demoEmail = `${demoRole}@interviewos.com`;
    const demoPassword = 'password123';

    try {
      const result = await login(demoEmail, demoPassword);
      if (!result.success) {
        setErrorMsg(result.error || 'Demo login failed. Make sure DB is seeded.');
      }
    } catch (err) {
      setErrorMsg('Failed to log in as demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center font-sans bg-grid py-12 px-6">
      
      {/* Background Ambient Glows */}
      <div className="glow-orb w-[400px] h-[400px] bg-purple-600 top-[20%] left-[20%] animate-pulse-slow" />
      <div className="glow-orb w-[450px] h-[450px] bg-blue-600 bottom-[20%] right-[20%] animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Back to Home Button */}
      <div className="absolute top-8 left-8">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <div className="w-full max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20 mx-auto mb-4 text-xl">
            IO
          </div>
          <h2 className="font-outfit text-3xl font-extrabold text-white">
            InterviewOS Gateway
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Enter your credentials or use a quick-start demo account below.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="glass-panel p-1 rounded-xl flex gap-1 mb-6 border border-white/5 bg-white/[0.02]">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'login' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'register' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Main Form */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 rounded-2xl border border-white/5 relative bg-slate-900/60"
        >
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg bg-black border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-black border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-black border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
              />
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Choose Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STUDENT', 'RECRUITER', 'ADMIN'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-all ${
                        role === r 
                          ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
                          : 'border-white/5 bg-black text-slate-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-95 text-white font-medium rounded-lg text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Quick Demo Credentials Panel */}
        <div className="mt-8 glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/40 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Sandbox / Evaluation mode</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Instant dashboard logins with pre-seeded mockup profile data:
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              disabled={loading}
              className="w-full h-10 border border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-between px-4 transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                Student Candidate Account
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Instant Entry</span>
            </button>

            <button
              onClick={() => handleQuickDemo('recruiter')}
              disabled={loading}
              className="w-full h-10 border border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-between px-4 transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                Recruiter Hiring Pipeline
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Instant Entry</span>
            </button>

            <button
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="w-full h-10 border border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold flex items-center justify-between px-4 transition-colors disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-pink-400" />
                System Administrator Stats
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Instant Entry</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
