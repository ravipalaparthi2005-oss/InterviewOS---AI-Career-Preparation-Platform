'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, API_URL } from '../../../components/Providers';
import { 
  Sparkles, 
  FileText, 
  Award, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar 
} from 'recharts';

export default function StudentDashboard() {
  const { token } = useAuth();
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        // Fetch resumes
        const rRes = await fetch(`${API_URL}/resumes/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rData = await rRes.json();
        setResumes(rData.resumes || []);

        // Fetch interviews
        const iRes = await fetch(`${API_URL}/interviews/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const iData = await iRes.json();
        setInterviews(iData.history || []);

        // Fetch active roadmap
        const rmRes = await fetch(`${API_URL}/roadmaps/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (rmRes.ok) {
          const rmData = await rmRes.json();
          setActiveRoadmap(rmData.roadmap || null);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  // Compute metrics
  const activeResume = resumes[0] || null;
  const atsScore = activeResume ? activeResume.atsScore : 0;
  
  const completedInterviews = interviews.filter(i => i.status === 'COMPLETED');
  const avgInterviewScore = completedInterviews.length
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.score, 0) / completedInterviews.length)
    : 0;

  // Hiring Probability Engine calculation
  // Dynamic weight: 40% ATS resume match + 60% Average interview performance.
  const hiringProbability = (atsScore || avgInterviewScore)
    ? Math.round((atsScore * 0.4) + ((avgInterviewScore || 70) * 0.6))
    : 0;

  const getHiringTier = (score: number) => {
    if (score >= 85) return { label: 'Elite Readiness', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 70) return { label: 'High Potential', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    if (score > 0) return { label: 'In Preparation', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Not Evaluated', color: 'text-slate-500 bg-slate-500/10 border-white/5' };
  };

  const hiringTier = getHiringTier(hiringProbability);

  // Chart Data compilation (interviews progress history)
  const chartData = completedInterviews.length 
    ? completedInterviews.map((item, idx) => ({
        name: `Mock #${completedInterviews.length - idx}`,
        score: item.score
      })).reverse()
    : [
        { name: 'Initial', score: 60 },
        { name: 'Practice 1', score: 72 },
        { name: 'Practice 2', score: 79 },
        { name: 'Active', score: 85 }
      ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-64 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-white/5 animate-pulse rounded-2xl" />
          <div className="h-32 bg-white/5 animate-pulse rounded-2xl" />
          <div className="h-32 bg-white/5 animate-pulse rounded-2xl" />
        </div>
        <div className="h-80 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Dashboard Top Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Career Workspace</h1>
          <p className="text-slate-400 text-sm mt-2">Master technical interviews, optimize your resume, and advance your career</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/student/interview" className="h-11 px-6 rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-2 shadow-md shadow-purple-500/10">
            <Sparkles className="w-4 h-4" />
            Start Mock Interview
          </Link>
        </div>
      </div>

      {/* Grid: 3 Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ATS Resume Summary Card */}
        <div className="group relative rounded-2xl border border-white/8 bg-gradient-to-br from-slate-950 to-slate-900/50 p-6 hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATS Resume Score</span>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <FileText className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-white">{atsScore || '--'}</span>
              <span className="text-sm text-slate-500 font-semibold">/ 100</span>
            </div>
            
            {activeResume ? (
              <Link href="/dashboard/student/resume" className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1.5 group/link">
                View missing keywords ({activeResume.missingKeywords?.length || 0})
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link href="/dashboard/student/resume" className="text-xs text-slate-400 hover:text-slate-300 font-bold flex items-center gap-1.5 group/link">
                Upload your first resume
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Avg Interview Rating Card */}
        <div className="group relative rounded-2xl border border-white/8 bg-gradient-to-br from-slate-950 to-slate-900/50 p-6 hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interview Performance</span>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Award className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-5xl font-black text-white">{avgInterviewScore || '--'}</span>
              <span className="text-sm text-slate-500 font-semibold">/ 100</span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Based on <span className="text-slate-300 font-semibold">{completedInterviews.length}</span> completed assessments
            </p>
          </div>
        </div>

        {/* Hiring Probability Engine Card */}
        <div className="group relative rounded-2xl border border-white/8 bg-gradient-to-br from-slate-950 to-slate-900/50 p-6 hover:border-white/15 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hiring Probability</span>
              <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20">
                <TrendingUp className="w-4 h-4 text-pink-400" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl font-black text-white">{hiringProbability ? `${hiringProbability}%` : '--'}</span>
              <span className={`text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-wider whitespace-nowrap ${hiringTier.color}`}>
                {hiringTier.label}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Calculated from portfolio scans and evaluation scores
            </p>
          </div>
        </div>

      </div>

      {/* Main Charts & History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Score Trend Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-white/8 bg-gradient-to-br from-slate-950 to-slate-900/50 p-8 hover:border-white/15 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-white">Performance Progress</h3>
              <p className="text-xs text-slate-400 mt-1">Tracking your mock interview scoring velocity and improvement trajectory</p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              ↑ {Math.max(0, chartData[chartData.length - 1]?.score - (chartData[0]?.score || 0))}% growth
            </div>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f8fafc', fontSize: '13px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#purpleGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: Active Roadmap Snippet */}
        <div className="lg:col-span-4 rounded-2xl border border-white/8 bg-gradient-to-br from-slate-950 to-slate-900/50 p-8 hover:border-white/15 transition-all duration-300 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Career Roadmap</h3>
            <p className="text-xs text-slate-400 mb-6">Your personalized path to career goals</p>

            {activeRoadmap ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-widest">Target Role</h4>
                  <p className="text-sm font-bold text-white mt-1">{activeRoadmap.targetJob}</p>
                </div>

                <div className="space-y-3">
                  {(typeof activeRoadmap.steps === 'string' ? JSON.parse(activeRoadmap.steps) : activeRoadmap.steps).slice(0, 2).map((step: any, index: number) => {
                    const isCompleted = index < activeRoadmap.currentStep;
                    const isActive = index === activeRoadmap.currentStep;

                    return (
                      <div key={index} className="flex gap-3 items-start p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all ${
                          isCompleted 
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                            : isActive 
                            ? 'bg-purple-500/15 border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/10' 
                            : 'bg-white/5 border-white/10 text-slate-500'
                        }`}>
                          {isCompleted ? '✓' : `0${index + 1}`}
                        </div>
                        <div>
                          <h5 className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {step.name}
                          </h5>
                          <p className="text-[11px] text-slate-500 leading-snug mt-0.5 font-medium">
                            {step.duration} • {step.description.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border border-dashed border-white/5">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-500 mb-4 font-medium">No active roadmap created yet</p>
                <Link href="/dashboard/student/roadmap" className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-white/10 border border-white/20 hover:bg-white/15 text-xs font-bold text-white transition-all">
                  Generate Roadmap
                </Link>
              </div>
            )}
          </div>

          {activeRoadmap && (
            <Link href="/dashboard/student/roadmap" className="h-10 w-full bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg flex items-center justify-center text-xs font-bold text-white mt-6 transition-all">
              View Full Roadmap
            </Link>
          )}
        </div>

      </div>

      {/* Mock Interview History Log */}
      <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-slate-950 to-slate-900/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Mock Interviews</h3>
            <p className="text-xs text-slate-400 mt-1">Your graded interview sessions and performance metrics</p>
          </div>
          {completedInterviews.length > 0 && (
            <Link href="/dashboard/student/interview" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all">
              Start New Session
            </Link>
          )}
        </div>
        
        {completedInterviews.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <th className="pb-4 pl-4 pr-4 text-slate-500">Session Type</th>
                  <th className="pb-4 px-4 text-slate-500">Focus Area</th>
                  <th className="pb-4 px-4 text-slate-500">Date</th>
                  <th className="pb-4 px-4 text-slate-500">Duration</th>
                  <th className="pb-4 px-4 text-right text-slate-500">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {completedInterviews.slice(0, 6).map((interview) => (
                  <tr key={interview.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-4 pl-4 pr-4 font-bold text-white group-hover:text-purple-300 transition-colors">
                      {interview.type || 'Technical'}
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-400">
                      {interview.companySpecific || 'General'}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-400">
                      {new Date(interview.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-400">
                      {Math.round(interview.duration / 60)} min
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg font-bold text-sm bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {interview.score}
                        <TrendingUp className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-dashed border-white/5">
            <Award className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1 font-medium">No mock interviews completed yet</p>
            <p className="text-xs text-slate-600 mb-6">Start practicing now to get personalized feedback and improve your interview skills</p>
            <Link href="/dashboard/student/interview" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-all">
              Start Your First Interview
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
