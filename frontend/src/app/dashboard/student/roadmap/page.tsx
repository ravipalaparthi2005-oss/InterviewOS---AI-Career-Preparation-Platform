'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../../../../components/Providers';
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function RoadmapPage() {
  const { token } = useAuth();
  
  const [targetJob, setTargetJob] = useState('Senior Full Stack Engineer');
  const [skills, setSkills] = useState('React, TypeScript, Node.js');
  const [loading, setLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);

  const fetchActiveRoadmap = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/roadmaps/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRoadmap(data.roadmap || null);
      }
    } catch (e) {
      console.error('Error fetching active roadmap:', e);
    }
  };

  useEffect(() => {
    fetchActiveRoadmap();
  }, [token]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJob.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/roadmaps/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetJob, skills })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Roadmap generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (stepIndex: number) => {
    if (!activeRoadmap) return;
    try {
      const res = await fetch(`${API_URL}/roadmaps/update-step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roadmapId: activeRoadmap.id,
          currentStep: stepIndex
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Update roadmap step progress failed:', err);
    }
  };

  const getSteps = () => {
    if (!activeRoadmap) return [];
    if (Array.isArray(activeRoadmap.steps)) return activeRoadmap.steps;
    try {
      return JSON.parse(activeRoadmap.steps);
    } catch (e) {
      return [];
    }
  };

  const steps = getSteps();
  const currentStepIndex = activeRoadmap ? activeRoadmap.currentStep : 0;
  const progressPercent = steps.length 
    ? Math.round((currentStepIndex / steps.length) * 100) 
    : 0;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-outfit text-3xl font-extrabold text-white">Career Roadmap Generator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Map customized learning paths, step timelines, and project milestones to capture target hires.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Input Form */}
        <div className="lg:col-span-4">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/40 space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Build New Path</h3>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Target Goal Title</label>
                <input
                  type="text"
                  value={targetJob}
                  onChange={(e) => setTargetJob(e.target.value)}
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full h-10 px-3 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Your Current Skills</label>
                <textarea
                  rows={4}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Redux, Express, CSS"
                  className="w-full p-3 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating Path...
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5" />
                    Generate Roadmap
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Active Timeline Screen */}
        <div className="lg:col-span-8">
          {activeRoadmap ? (
            <div className="space-y-6">
              
              {/* Progress Summary Banner */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/10 to-slate-950/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">Personalized Syllabus</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{activeRoadmap.title}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{progressPercent}% Completed</span>
                    <p className="text-[10px] text-slate-500">Step {currentStepIndex} of {steps.length}</p>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="space-y-6 relative pl-6 border-l border-white/10 ml-3">
                {steps.map((step: any, index: number) => {
                  const isCompleted = index < currentStepIndex;
                  const isActive = index === currentStepIndex;

                  return (
                    <div key={index} className="relative space-y-3">
                      
                      {/* Timeline Dot Indicator */}
                      <span className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                        isCompleted 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : isActive
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20 animate-pulse'
                          : 'bg-black border-white/10 text-slate-500'
                      }`}>
                        {isCompleted ? '✓' : `0${index + 1}`}
                      </span>

                      {/* Timeline Card */}
                      <div className={`glass-panel p-5 rounded-2xl border transition-all ${
                        isActive 
                          ? 'border-purple-500/30 bg-purple-500/[0.02]' 
                          : 'border-white/5'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {step.name}
                          </h4>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Clock className="w-3 h-3" />
                            {step.duration}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* Milestones Checklists */}
                        {step.milestones && step.milestones.length > 0 && (
                          <div className="mb-4">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-2">Milestones</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
                              {step.milestones.map((m: string, mIdx: number) => (
                                <div key={mIdx} className="flex items-center gap-2">
                                  <CheckCircle className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-500' : 'text-slate-600'}`} />
                                  <span>{m}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Resources & Call to Action */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[11px] text-slate-400">
                              Recommended Resources: {step.resources?.join(', ') || 'N/A'}
                            </span>
                          </div>

                          {isActive && (
                            <button
                              onClick={() => handleUpdateProgress(index + 1)}
                              className="h-8 px-4 bg-purple-600 hover:bg-purple-700 text-[11px] font-bold text-white rounded-lg flex items-center gap-1.5 transition-all self-end"
                            >
                              Mark as Completed
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-16 rounded-2xl border border-white/5 text-center flex flex-col justify-center items-center">
              <Compass className="w-12 h-12 text-slate-600 mb-4" />
              <h3 className="text-base font-bold text-white">No Roadmap Generated</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
                Input your career goals and current skill profiles on the left to map your milestones dynamically.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
