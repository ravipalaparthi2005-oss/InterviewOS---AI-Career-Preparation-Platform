'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, API_URL } from '../../../../components/Providers';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  RefreshCw, 
  Trash2,
  BookOpen,
  Lightbulb,
  Target,
  Award,
  Plus
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'mentor';
  text: string;
  timestamp?: Date;
}

interface MentorSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export default function MentorPage() {
  const { token, user } = useAuth();
  
  const [sessions, setSessions] = useState<MentorSession[]>([
    {
      id: 'default',
      title: 'New Conversation',
      messages: [
        { role: 'mentor', text: 'Hello! I\'m your AI Career Mentor, powered by advanced AI. I can help you with: Resume optimization, STAR method for behavioral answers, System design discussions, Technical career growth planning, and Interview preparation. What would you like to work on today?', timestamp: new Date() }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;
    
    // Update current session with user message
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, { role: 'user', text: textToSend, timestamp: new Date() }],
          updatedAt: new Date()
        };
      }
      return session;
    }));

    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/mentor/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: textToSend,
          context: currentSession.messages.slice(-5) // Send last 5 messages for context
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessions(prev => prev.map(session => {
          if (session.id === currentSessionId) {
            return {
              ...session,
              messages: [...session.messages, { role: 'mentor', text: data.reply, timestamp: new Date() }],
              updatedAt: new Date()
            };
          }
          return session;
        }));
      } else {
        throw new Error('Mentor API error');
      }
    } catch (e) {
      console.error(e);
      // Fallback response
      const fallbackReplies = [
        'To build a strong resume for tech roles, focus on quantifiable achievements. Instead of "Responsible for database optimization," try "Optimized database queries reducing API latency by 40%, improving user experience for 50k+ daily active users."',
        'The STAR method is essential for behavioral interviews: Situation (context), Task (your responsibility), Action (what you did), Result (measurable outcome). Practice structuring 3-5 examples before interviews.',
        'System design interviews evaluate your ability to solve large-scale problems. Focus on: requirements gathering, high-level architecture, database schema, API design, and trade-offs. Always discuss scalability and reliability.',
        'Build projects that demonstrate full-stack capabilities. Deploy on cloud platforms, implement CI/CD pipelines, write tests, and document your architecture. This shows you can ship production code.'
      ];
      
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [...session.messages, { role: 'mentor', text: randomReply, timestamp: new Date() }],
            updatedAt: new Date()
          };
        }
        return session;
      }));
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = () => {
    const newId = `session-${Date.now()}`;
    setSessions(prev => [...prev, {
      id: newId,
      title: 'New Conversation',
      messages: [
        { role: 'mentor', text: 'Hello! Ready to discuss your career growth. What would you like to explore?', timestamp: new Date() }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
    setCurrentSessionId(newId);
  };

  const deleteSession = (id: string) => {
    if (sessions.length <= 1) {
      alert('You must keep at least one session');
      return;
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  const mentorTopics = [
    { icon: Target, title: 'Resume Optimization', prompt: 'Help me optimize my resume for a full-stack engineer role at a FAANG company' },
    { icon: BookOpen, title: 'STAR Method', prompt: 'Help me structure a STAR example about handling a difficult team situation' },
    { icon: Lightbulb, title: 'System Design', prompt: 'Walk me through designing a real-time notification system for millions of users' },
    { icon: Award, title: 'Interview Prep', prompt: 'What are the most common behavioral questions and how should I approach them?' }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">AI Career Mentor</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your 24/7 AI-powered career advisor for resume, interviews, and skill development
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar - Sessions */}
        <div className="lg:col-span-3 flex flex-col space-y-4 overflow-auto">
          <button
            onClick={createNewSession}
            className="w-full h-10 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            + New Conversation
          </button>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversations</h3>
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between ${
                  currentSessionId === session.id
                    ? 'bg-purple-500/20 border-purple-500/40'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{session.title}</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {session.messages.length} messages
                  </p>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="ml-2 p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right - Chat Area */}
        <div className="lg:col-span-9 flex flex-col space-y-4 min-h-0">
          
          {/* Messages Area */}
          <div className="flex-1 rounded-lg border border-white/10 bg-black/40 overflow-y-auto p-4 space-y-4 min-h-0">
            {currentSession.messages.length === 1 && currentSession.messages[0].role === 'mentor' && (
              <div className="grid grid-cols-2 gap-3">
                {mentorTopics.map((topic) => {
                  const Icon = topic.icon;
                  return (
                    <button
                      key={topic.title}
                      onClick={() => handleSendMessage(topic.prompt)}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left space-y-2 group"
                    >
                      <Icon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-white">{topic.title}</p>
                      <p className="text-[10px] text-slate-500">{topic.prompt.substring(0, 40)}...</p>
                    </button>
                  );
                })}
              </div>
            )}

            {currentSession.messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 border border-white/10 text-slate-100'
                }`}>
                  {msg.role === 'mentor' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-purple-400">Career Mentor</span>
                    </div>
                  )}
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.timestamp && (
                    <p className={`text-[9px] mt-2 ${msg.role === 'user' ? 'text-purple-200' : 'text-slate-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/10 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                    <span className="text-xs text-slate-400">Mentor is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>


      {/* Input Area */}
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder="Ask anything about your career, interviews, or tech..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/15 transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage(input)}
              disabled={loading || !input.trim()}
              className="h-10 w-10 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
