'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../components/Providers';
import {
  Eye,
  MessageCircle,
  Zap,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface VideoMetrics {
  eyeContact: number;
  fillerWords: number;
  confidence: number;
  posture: number;
}

export default function PresentationAnalysisPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<VideoMetrics>({
    eyeContact: 72,
    fillerWords: 78,
    confidence: 74,
    posture: 78
  });
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'recommendations'>('overview');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const overallScore = Math.round(
    (metrics.eyeContact * 0.25 + metrics.fillerWords * 0.25 + metrics.confidence * 0.3 + metrics.posture * 0.2)
  );

  const radarData = [
    { category: 'Eye Contact', value: metrics.eyeContact },
    { category: 'Filler Words', value: metrics.fillerWords },
    { category: 'Confidence', value: metrics.confidence },
    { category: 'Posture', value: metrics.posture }
  ];

  const metricCards = [
    {
      title: 'Eye Contact',
      icon: Eye,
      score: metrics.eyeContact,
      description: 'Looking at camera',
      color: 'from-blue-500 to-blue-600',
      details: {
        'Time Looking at Camera': '72%',
        'Eye Movements': '8 per minute',
        'Blink Rate': 'Normal (15-20 per minute)'
      }
    },
    {
      title: 'Filler Words',
      icon: MessageCircle,
      score: metrics.fillerWords,
      description: 'Reducing hesitations',
      color: 'from-emerald-500 to-emerald-600',
      details: {
        'Total Filler Words': '12',
        'Most Common': '"um" (5 times)',
        'Density': '2.4% of speech'
      }
    },
    {
      title: 'Confidence',
      icon: Zap,
      score: metrics.confidence,
      description: 'Speaking clarity',
      color: 'from-amber-500 to-amber-600',
      details: {
        'Speech Rate': '128 WPM',
        'Pause Frequency': '3 per minute',
        'Sentence Structure': 'Varied & strong'
      }
    },
    {
      title: 'Posture',
      icon: Activity,
      score: metrics.posture,
      description: 'Body language',
      color: 'from-purple-500 to-purple-600',
      details: {
        'Position': 'Upright',
        'Shoulder Angle': 'Open & relaxed',
        'Head Tilt': 'Minimal movement'
      }
    }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col overflow-auto pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Presentation Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">
          AI-powered analysis of your interview presentation skills
        </p>
      </div>

      {/* Overall Score */}
      <div className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-950/40 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Presentation Score</p>
            <div className="flex items-baseline gap-3">
              <span className="text-6xl font-black text-cyan-400">{overallScore}</span>
              <span className="text-xl text-slate-500">/100</span>
            </div>
            <p className="text-sm text-slate-300">
              {overallScore >= 80 && 'Excellent presentation skills! 🎯'}
              {overallScore >= 70 && overallScore < 80 && 'Good presentation with room to improve 📈'}
              {overallScore >= 60 && overallScore < 70 && 'Solid foundation, focus on key areas ⚡'}
              {overallScore < 60 && 'Opportunity to enhance your delivery 💡'}
            </p>
          </div>

          {/* Radar Chart */}
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgb(100, 116, 139)" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'rgb(148, 163, 184)' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: 'rgb(100, 116, 139)' }} />
                <Radar name="Score" dataKey="value" stroke="rgb(139, 92, 246)" fill="rgb(139, 92, 246)" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metricCards.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-4 hover:border-white/20 transition-all">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${metric.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{metric.title}</h3>
                    <p className="text-xs text-slate-400">{metric.description}</p>
                  </div>
                </div>
                <span className="text-3xl font-black text-white">{metric.score}</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} transition-all`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>

              {/* Details */}
              <div className="space-y-1 text-xs">
                {Object.entries(metric.details).map(([key, value], jdx) => (
                  <div key={jdx} className="flex justify-between">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-slate-200 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'details', label: 'Detailed Breakdown' },
          { id: 'recommendations', label: 'Recommendations' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              selectedTab === tab.id
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {selectedTab === 'overview' && (
          <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Key Insights</h3>
            <div className="space-y-3">
              {[
                { icon: CheckCircle, text: 'Excellent eye contact maintained throughout the interview', color: 'text-green-400' },
                { icon: AlertTriangle, text: 'Minimal use of filler words detected - great job!', color: 'text-emerald-400' },
                { icon: TrendingUp, text: 'Your confidence level is strong with consistent speech pace', color: 'text-amber-400' },
                { icon: CheckCircle, text: 'Professional body language and posture observed', color: 'text-blue-400' }
              ].map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <div key={idx} className="flex gap-3 text-sm">
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${insight.color}`} />
                    <p className="text-slate-300">{insight.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedTab === 'details' && (
          <div className="space-y-4">
            
            {/* Eye Contact Analysis */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Eye Contact Analysis
              </h3>
              <p className="text-xs text-slate-300">
                You maintained excellent eye contact, looking at the camera 72% of the time. This creates a strong connection with the interviewer and demonstrates confidence. The eye movements were natural and not distracting.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Camera Contact</p>
                  <p className="font-bold text-white">72%</p>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Eye Movements</p>
                  <p className="font-bold text-white">8/min</p>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Blink Rate</p>
                  <p className="font-bold text-white">Normal</p>
                </div>
              </div>
            </div>

            {/* Filler Words Analysis */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Filler Words Analysis
              </h3>
              <p className="text-xs text-slate-300">
                Great job minimizing filler words! You used "um" 5 times and "like" 3 times throughout the interview, which is excellent. This shows good preparation and confidence in your responses. The overall filler word density was only 2.4%, well below the average.
              </p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Most Common: "um"</span>
                    <span className="text-slate-200">5 times</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">"like"</span>
                    <span className="text-slate-200">3 times</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence Analysis */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Confidence Analysis
              </h3>
              <p className="text-xs text-slate-300">
                Your speaking pace was steady at 128 words per minute, which is within the ideal range (120-150 WPM). You maintained good variety in your sentence structure and incorporated strategic pauses throughout your responses, which enhances clarity and impact.
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Speech Rate</p>
                  <p className="font-bold text-white">128 WPM</p>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Pauses/min</p>
                  <p className="font-bold text-white">3</p>
                </div>
                <div className="bg-white/5 p-2 rounded">
                  <p className="text-slate-400">Sentence Variety</p>
                  <p className="font-bold text-white">Strong</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'recommendations' && (
          <div className="space-y-3">
            {[
              {
                title: 'Maintain Your Eye Contact Excellence',
                description: 'You\'re already doing great at 72%. Consider practicing with different camera angles to find the most natural position.',
                priority: 'low'
              },
              {
                title: 'Further Reduce Filler Words',
                description: 'While your count is already very low, practice using strategic pauses instead of any fillers. This creates a more authoritative presence.',
                priority: 'low'
              },
              {
                title: 'Vary Your Tone More',
                description: 'Your pace is good, but try adding more vocal variation to emphasize important points and maintain engagement.',
                priority: 'medium'
              },
              {
                title: 'Strengthen Your Posture Consistency',
                description: 'Maintain the same upright posture you showed at the beginning throughout the entire interview for maximum professional impact.',
                priority: 'medium'
              },
              {
                title: 'Practice Technical Explanations',
                description: 'When explaining complex topics, slightly slow your pace and use more hand gestures (if on video) to enhance clarity.',
                priority: 'medium'
              }
            ].map((rec, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-2 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{rec.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                    rec.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                    rec.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-green-500/10 text-green-400'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
