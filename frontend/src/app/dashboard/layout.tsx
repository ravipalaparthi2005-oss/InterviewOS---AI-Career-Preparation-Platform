'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../components/Providers';
import { 
  LayoutDashboard, 
  FileText, 
  Compass, 
  Mic, 
  Code2, 
  Users, 
  MessageSquare, 
  LogOut, 
  Sparkles,
  Loader2,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col justify-center items-center font-sans">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Verifying secure workspace session...</p>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { name: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'ATS Resume Intelligence', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Career Roadmap', href: '/dashboard/student/roadmap', icon: Compass },
    { name: 'Voice & Video Mock', href: '/dashboard/student/interview', icon: Mic },
    { name: 'Coding Arena', href: '/dashboard/student/coding', icon: Code2 },
    { name: 'Real-Time Mock Room', href: '/dashboard/student/webrtc-room', icon: Users },
    { name: 'AI Career Mentor', href: '/dashboard/student/mentor', icon: MessageSquare },
    { section: 'Analytics' },
    { name: 'Hiring Probability', href: '/dashboard/student/analysis', icon: TrendingUp },
    { name: 'Presentation Analysis', href: '/dashboard/student/presentation-analysis', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans flex overflow-hidden">
      
      {/* Sleek Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-slate-950/60 backdrop-blur-xl flex flex-col justify-between p-6 flex-shrink-0 z-20">
        <div className="space-y-8">
          
          {/* Logo Header */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
              IO
            </div>
            <span className="font-outfit text-lg font-bold">
              INTERVIEW<span className="text-purple-500">OS</span>
            </span>
          </Link>

          {/* User Profile Card */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">{user.name}</h4>
              <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">{user.role}</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item: any, idx) => {
              if (item.section) {
                return (
                  <div key={idx} className="pt-4 pb-2 px-4 border-t border-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.section}</p>
                  </div>
                );
              }
              
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-purple-600/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/10' 
                      : 'text-slate-400 border border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 to-blue-950/40 border border-purple-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-full filter blur-[15px]" />
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">Hiring Readiness</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Conduct mocks & scans to update scores.
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto bg-black relative flex flex-col">
        {/* Workspace ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[100px] pointer-events-none" />
        
        <div className="flex-1 p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </div>
      </main>

    </div>
  );
}
