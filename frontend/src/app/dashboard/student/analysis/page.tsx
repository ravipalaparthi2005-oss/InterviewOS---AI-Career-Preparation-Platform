'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../../../../components/Providers';
import {
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  User,
  Trophy,
  Activity,
  RefreshCw,
  Download,
  Share2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface HiringScorecard {
  overallScore: number;
  hiringProbability: number;
  recommendation: 'STRONG_YES' | 'YES' | 'MAYBE' | 'NO' | 'STRONG_NO';
  scores: {
    technical: number;
    communication: number;
    culture: number;
    experience: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  skillAssessment: Array<{
    skill: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    confidence: number;
  }>;
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [scorecard, setScorecard] = useState<HiringScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'skills' | 'feedback'>('overview');

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        // For now, use mock data
        const mockScorecard: HiringScorecard = {
          overallScore: 76,
          hiringProbability: 73,
          recommendation: 'YES',
          scores: {
            technical: 75,
            communication: 82,
            culture: 78,
            experience: 68
          },
          strengths: [
            'Strong problem-solving skills',
            'Clear communication',
            'Good cultural fit',
            'Demonstrates growth mindset'
          ],
          weaknesses: [
            'Limited enterprise-scale experience',
            'Could improve system design knowledge',
            'More real-world project examples needed'
          ],
          recommendations: [
            'Study distributed systems concepts',
            'Build more complex full-stack projects',
            'Practice high-level architecture design'
          ],
          skillAssessment: [
            { skill: 'JavaScript', level: 'advanced', confidence: 85 },
            { skill: 'React', level: 'advanced', confidence: 82 },
            { skill: 'System Design', level: 'intermediate', confidence: 65 },
            { skill: 'SQL', level: 'intermediate', confidence: 72 },
            { skill: 'DevOps', level: 'beginner', confidence: 45 }
          ]
        };
        setScorecard(mockScorecard);
      } catch (err) {
        console.error('Error fetching scorecard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScorecard();
  }, [token]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!scorecard) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-slate-400">No scorecard available</p>
      </div>
    );
  }

  const recommendationColor = {
    STRONG_YES: 'text-green-400 bg-green-500/10 border-green-500/20',
    YES: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    MAYBE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    NO: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    STRONG_NO: 'text-red-400 bg-red-500/10 border-red-500/20'
  };

  const scoreData = [
    { name: 'Technical', value: scorecard.scores.technical },
    { name: 'Communication', value: scorecard.scores.communication },
    { name: 'Culture', value: scorecard.scores.culture },
    { name: 'Experience', value: scorecard.scores.experience }
  ];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  const skillLevelColor = {
    beginner: 'bg-red-500/10 text-red-400',
    intermediate: 'bg-yellow-500/10 text-yellow-400',
    advanced: 'bg-green-500/10 text-green-400',
    expert: 'bg-purple-500/10 text-purple-400'
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-auto pb-8">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Hiring Probability Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">
          Comprehensive assessment of your interview performance and fit
        </p>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left - Main Score */}
        <div className="lg:col-span-2 rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/40 to-slate-950/40 p-8 space-y-6">
          
          {/* Overall Score */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Score</p>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black text-purple-400">{scorecard.overallScore}</span>
                <span className="text-xl text-slate-500">/100</span>
              </div>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="rgb(30, 41, 59)" strokeWidth="8" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="rgb(139, 92, 246)"
                  strokeWidth="8"
                  strokeDasharray={`${(scorecard.overallScore / 100) * 352} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div>
                  <p className="text-xs text-slate-400">Fit Score</p>
                  <p className="text-2xl font-bold text-white">{scorecard.hiringProbability}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className={`p-4 rounded-lg border ${recommendationColor[scorecard.recommendation]}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold opacity-75">RECOMMENDATION</p>
                <p className="text-lg font-black mt-1">{scorecard.recommendation.replace(/_/g, ' ')}</p>
              </div>
              {scorecard.recommendation === 'STRONG_YES' && <Trophy className="w-8 h-8 opacity-50" />}
              {scorecard.recommendation === 'YES' && <CheckCircle className="w-8 h-8 opacity-50" />}
              {scorecard.recommendation === 'MAYBE' && <AlertCircle className="w-8 h-8 opacity-50" />}
            </div>
          </div>
        </div>

        {/* Right - Score Breakdown */}
        <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Breakdown</h3>
          
          {scoreData.map((item, idx) => (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">{item.name}</span>
                <span className="text-white font-bold">{item.value}/100</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    idx === 0 ? 'bg-purple-500' :
                    idx === 1 ? 'bg-cyan-500' :
                    idx === 2 ? 'bg-emerald-500' :
                    'bg-amber-500'
                  }`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {['overview', 'skills', 'feedback'].map(tab => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              selectedTab === tab
                ? 'text-purple-400 border-purple-400'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'skills' && 'Skills Assessment'}
            {tab === 'feedback' && 'Detailed Feedback'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Your Strengths
              </h3>
              <div className="space-y-2">
                {scorecard.strengths.map((strength, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <span className="text-green-400 font-bold">✓</span>
                    <span className="text-slate-300">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                Growth Areas
              </h3>
              <div className="space-y-2">
                {scorecard.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="flex gap-3 text-xs">
                    <span className="text-yellow-400 font-bold">→</span>
                    <span className="text-slate-300">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="lg:col-span-2 rounded-lg border border-white/10 bg-black/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Next Steps to Improve
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {scorecard.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded-lg text-xs space-y-1">
                    <p className="font-bold text-purple-400">#{idx + 1}</p>
                    <p className="text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Assessment Tab */}
        {selectedTab === 'skills' && (
          <div className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white mb-4">Skill Proficiency Levels</h3>
            <div className="space-y-4">
              {scorecard.skillAssessment.map((skill, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{skill.skill}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${skillLevelColor[skill.level]}`}>
                        {skill.level}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{Math.round(skill.confidence)}% confidence</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all"
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Feedback Tab */}
        {selectedTab === 'feedback' && (
          <div className="space-y-4">
            {[
              { title: 'Technical Skills', key: 'technical' as const },
              { title: 'Communication', key: 'communication' as const },
              { title: 'Cultural Fit', key: 'culture' as const },
              { title: 'Experience & Track Record', key: 'experience' as const }
            ].map(feedback => (
              <div key={feedback.key} className="rounded-lg border border-white/10 bg-black/40 p-6 space-y-2">
                <h4 className="text-sm font-bold text-white">{feedback.title}</h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  Your technical knowledge is solid for the mid-level position. Focus on system design complexity and optimization trade-offs. Continue building real-world projects to strengthen your portfolio.
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center py-4">
        <button className="px-6 py-2.5 bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/20 transition-all flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </button>
        <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Results
        </button>
      </div>
    </div>
  );
}
