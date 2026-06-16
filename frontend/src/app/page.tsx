'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Terminal, 
  Cpu, 
  Search, 
  Mic, 
  Compass, 
  Award, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  Code,
  Users,
  LineChart
} from 'lucide-react';
import { useAuth } from '../components/Providers';

export default function LandingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'copilot' | 'ats' | 'roadmap'>('copilot');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden font-sans bg-grid selection:bg-purple-500/30">
      
      {/* Background Ambient Glows */}
      <div className="glow-orb w-[500px] h-[500px] bg-purple-600 top-[-10%] left-[-10%] animate-pulse-slow" />
      <div className="glow-orb w-[600px] h-[600px] bg-blue-600 bottom-[-20%] right-[-10%] animate-pulse-slow" style={{ animationDelay: '3s' }} />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
              IO
            </div>
            <span className="font-outfit text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-[#e2e8f0] to-[#94a3b8]">
              INTERVIEW<span className="text-purple-500">OS</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#benefits" className="hover:text-white transition-colors">Syllabus & Benefits</a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href={`/dashboard/${user.role.toLowerCase()}`} className="group relative inline-flex items-center gap-1 text-xs font-semibold tracking-wide uppercase px-4 py-2 bg-white text-black hover:bg-slate-100 rounded-lg transition-all duration-300">
                Go to Dashboard
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/auth?tab=login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/auth?tab=register" className="relative group inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-xs font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-800">
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0">
                    Get Started Free
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 max-w-7xl mx-auto px-6 text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex flex-col items-center"
        >
          {/* Tag Pill */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Career AI Operating System</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="font-outfit text-5xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] mb-6 text-white"
          >
            Master Technical Interviews with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
              Adaptive Real-Time AI
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light"
          >
            Simulate realistic live coding panels, voice behavioral assessments, and receive precise ATS resume grading. Powered by Gemini.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mb-16"
          >
            <Link href="/auth?tab=register" className="h-12 px-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 flex items-center gap-2 shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all duration-200">
              Get Started for Free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="#demo" className="h-12 px-8 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-medium flex items-center justify-center transition-all">
              Watch Demo Preview
            </a>
          </motion.div>

          {/* Floating Showcase Mockup */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-5xl aspect-[16/9] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 shadow-2xl relative animate-float"
          >
            <div className="w-full h-full rounded-xl bg-slate-950 overflow-hidden border border-white/5 flex flex-col">
              {/* Fake Window Header */}
              <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-2 bg-black/40 px-3 py-1 rounded">
                  <Terminal className="w-3 h-3 text-purple-400" />
                  interviewos.com/session/technical_copilot
                </div>
                <div className="w-10" />
              </div>

              {/* Fake Dashboard Body */}
              <div className="flex-1 grid grid-cols-3 text-left">
                {/* Left Side: Dynamic Prompt */}
                <div className="col-span-1 border-r border-white/5 p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider block mb-2">Interviewer Question</span>
                    <h3 className="text-base text-white font-medium leading-snug">
                      Given a binary search tree, write an efficient algorithm to balance it in-place. What is the time complexity?
                    </h3>
                    <div className="mt-4 flex gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">BST</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">Medium</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-300">AI Co-Pilot Hint</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Try collecting node addresses in an ordered array (inorder traversal), then construct the balanced tree recursively.
                    </p>
                  </div>
                </div>

                {/* Center: Fake Coding Area */}
                <div className="col-span-2 bg-[#050508] p-6 flex flex-col font-mono text-sm justify-between">
                  <div className="text-slate-400 space-y-1 select-none">
                    <p><span className="text-purple-400">function</span> <span className="text-blue-400">balanceBST</span>(root: TreeNode) &#123;</p>
                    <p className="pl-4 text-slate-600">// 1. Collect sorted nodes</p>
                    <p className="pl-4"><span className="text-purple-400">const</span> nodes: TreeNode[] = [];</p>
                    <p className="pl-4"><span className="text-blue-400">inorder</span>(root, nodes);</p>
                    <p className="pl-4 text-slate-600">// 2. Rebuild recursively</p>
                    <p className="pl-4"><span className="text-purple-400">return</span> <span className="text-blue-400">buildBalancedTree</span>(nodes, 0, nodes.length - 1);</p>
                    <p>&#125;</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/5 pt-4 bg-[#050508]">
                    <div className="flex items-center gap-3">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-slate-400">Speech input: active</span>
                    </div>
                    <button className="px-3.5 py-1.5 rounded bg-purple-600 text-xs font-medium text-white hover:bg-purple-700 transition-all">
                      Run Test Cases
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Statistics Section */}
      <section className="border-y border-white/5 bg-white/[0.01] py-16 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-2">94%</h3>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">ATS Score Match Rate</p>
          </div>
          <div>
            <h3 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-2">12k+</h3>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">Mock Interviews Graded</p>
          </div>
          <div>
            <h3 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-2">2.5x</h3>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">Interview Conversion Lift</p>
          </div>
          <div>
            <h3 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-2">&lt; 200ms</h3>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider">Real-time Voice Latency</p>
          </div>
        </div>
      </section>

      {/* Core Features Showcase Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs text-purple-400 uppercase tracking-widest font-semibold block mb-3">Enterprise Core Features</span>
          <h2 className="font-outfit text-3xl md:text-5xl font-bold text-white mb-4">Complete Suite for Technical Hires</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Get access to professional mock interviewers, automated code checks, and customized learning milestones.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Voice AI Interviewer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Engage in highly responsive, real-time verbal conversations. Analyzes speech confidence, filler words, and vocal pacing.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-blue-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">ATS Intelligence Scanner</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compare your resume with leading enterprise job requirements. Uncover missing keyword pools and fix structuring mistakes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl hover:border-pink-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-6 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Personalized Career Roadmaps</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Map personalized technical study schedules. Automatically generated from your skill profile and customized job matching logs.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Feature Demo Tab */}
      <section id="demo" className="py-16 max-w-7xl mx-auto px-6">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full filter blur-[80px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs text-blue-400 uppercase tracking-widest font-semibold">Interactive Sandbox</span>
              <h2 className="font-outfit text-3xl md:text-4xl font-bold text-white leading-tight">Explore the Platform in Action</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Click on the navigation tabs to preview the main components of the InterviewOS suite.
              </p>

              <div className="flex flex-col gap-2">
                {[
                  { id: 'copilot', label: 'AI Technical Copilot', icon: Code },
                  { id: 'ats', label: 'ATS Score Checker', icon: ShieldCheck },
                  { id: 'roadmap', label: 'Milestone Roadmap Generator', icon: Compass }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-all ${
                        activeTab === tab.id 
                          ? 'bg-purple-600/15 border-purple-500 text-white shadow-lg shadow-purple-500/5' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#0b0c10] border border-white/5 rounded-2xl p-6 min-h-[350px] flex flex-col justify-between shadow-inner">
              {activeTab === 'copilot' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-mono text-purple-400">INTERVIEW_COPILOT_v1.5</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">Active Session</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-slate-400 font-semibold mb-1">AI Mock Interviewer</p>
                      <p className="text-xs text-white">How do we write an optimized database index? What are the write tradeoffs?</p>
                    </div>
                    <div className="bg-purple-600/10 p-3 rounded-lg border border-purple-500/25 ml-6">
                      <p className="text-xs text-purple-300 font-semibold mb-1">Candidate Answer (Transcript)</p>
                      <p className="text-xs text-white">Using B-Trees organizes keys sequentially. The write tradeoff is sorting overhead during mutations...</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs text-white font-semibold">Gemini Evaluation Summary</span>
                    </div>
                    <p className="text-xs text-slate-400">Excellent index structure explanation. Confidence: 94%. Optimal database query speed achieved.</p>
                  </div>
                </div>
              )}

              {activeTab === 'ats' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-mono text-blue-400">ATS_SCAN_COMPARE_ENGINE</span>
                    <span className="text-xs text-slate-400">Match Target: AWS Senior Backend</span>
                  </div>
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent"/>
                        <circle cx="56" cy="56" r="48" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="301" strokeDashoffset="45"/>
                      </svg>
                      <span className="absolute font-outfit text-2xl font-extrabold text-white">85%</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white">Hiring Readiness: HIGH</h4>
                      <p className="text-xs text-slate-400">Missing keywords identified: <strong>Kubernetes, Redis</strong>.</p>
                      <p className="text-xs text-slate-400">Improvements: Modify 4 bullet points to emphasize architectural ownership.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-mono text-pink-400">CAREER_ROADMAP_GENERATOR</span>
                    <span className="text-xs text-slate-400">Target Role: Cloud Infrastructure Lead</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs text-purple-400 font-bold font-mono">01</div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Master Terraform Infrastructure as Code</h4>
                        <p className="text-[11px] text-slate-400">Provision VPC, Security groups, RDS clusters. Duration: 1 week.</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start border-l border-white/5 pl-3">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-xs text-slate-500 font-bold font-mono">02</div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-400">Docker Containerization and Orchestration</h4>
                        <p className="text-[11px] text-slate-500">Learn ECS task definitions, container registries. Duration: 2 weeks.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/auth?tab=register" className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-center text-xs hover:bg-slate-100 transition-colors">
                Start Preparing Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recruiter and Candidate Benefits */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-outfit text-2xl font-bold text-white mb-4">Student & Candidate Benefits</h3>
          <ul className="space-y-3.5 text-slate-400 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="text-purple-400 font-bold mt-0.5">•</span>
              <span>Conduct realistic, stress-free mock interviews prior to actual corporate cycles.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-400 font-bold mt-0.5">•</span>
              <span>Real-time co-pilot hints assist when you get stuck in coding syntax.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-purple-400 font-bold mt-0.5">•</span>
              <span>Customized roadmap guidelines step you through exactly what resources to study.</span>
            </li>
          </ul>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-outfit text-2xl font-bold text-white mb-4">Recruiter & Hiring Panels</h3>
          <ul className="space-y-3.5 text-slate-400 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>Automatically filter candidate pipelines by verified, AI-graded interview assessments.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>Examine code-replay files, speech analytics logs, and confidence indices.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blue-400 font-bold mt-0.5">•</span>
              <span>Accelerate hiring speeds, ensuring candidate fit using custom ATS scanning reports.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Full-bleed CTA Banner */}
      <section className="py-24 max-w-7xl mx-auto px-6 relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-purple-600/10 rounded-full filter blur-[100px]" />
        <h2 className="font-outfit text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Experience InterviewOS?</h2>
        <p className="text-slate-400 max-w-lg mx-auto mb-8 font-light">
          Sign up now to scan your resume, build a coding roadmap, and conduct your first AI-graded technical interview today.
        </p>
        <Link href="/auth?tab=register" className="h-12 px-8 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 inline-flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all duration-200">
          Start Preparing Now
          <ChevronRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center text-xs font-bold text-white">IO</div>
            <span className="font-bold text-slate-300">InterviewOS</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} InterviewOS AI. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
