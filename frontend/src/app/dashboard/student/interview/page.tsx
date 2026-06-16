'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth, API_URL } from '../../../../components/Providers';
import { 
  Sparkles, 
  Mic, 
  Video, 
  VideoOff, 
  MicOff, 
  Play, 
  Square, 
  ChevronRight, 
  RefreshCw, 
  Volume2, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function InterviewPage() {
  const { token } = useAuth();
  
  // State: Setup vs Interviewing vs Completed Review
  const [sessionState, setSessionState] = useState<'setup' | 'active' | 'feedback'>('setup');
  
  // Setup inputs
  const [type, setType] = useState<'TECHNICAL' | 'BEHAVIORAL' | 'HR' | 'SYSTEM_DESIGN'>('TECHNICAL');
  const [companySpecific, setCompanySpecific] = useState('');
  
  // Simulator States
  const [interviewId, setInterviewId] = useState('');
  const [question, setQuestion] = useState('');
  const [hints, setHints] = useState<string[]>([]);
  const [expectedAnswerOverview, setExpectedAnswerOverview] = useState('');
  
  const [answer, setAnswer] = useState('');
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  // WebRTC / Voice Sim State
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  
  // Current Turn Feedback HUD
  const [turnEvaluation, setTurnEvaluation] = useState<any>(null);
  
  // Final Feedback State
  const [finalReport, setFinalReport] = useState<any>(null);

  // Media Stream States
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Timer reference
  const timerRef = useRef<any>(null);

  // Media element refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioAnalyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize media streams
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        setMediaError('');
        
        // Request video stream
        if (isVideoOn && !videoStream) {
          try {
            const vStream = await navigator.mediaDevices.getUserMedia({ 
              video: { 
                width: { ideal: 1280 }, 
                height: { ideal: 720 },
                facingMode: 'user'
              } 
            });
            setVideoStream(vStream);
            
            // Attach video stream to video element
            if (videoRef.current) {
              videoRef.current.srcObject = vStream;
              // Ensure video plays
              videoRef.current.play().catch(err => {
                console.error('Video play error:', err);
              });
            }
          } catch (err: any) {
            console.error('Video error:', err);
            if (err.name === 'NotAllowedError') {
              setMediaError('Camera permission denied. Please enable camera access in browser settings.');
            } else if (err.name === 'NotFoundError') {
              setMediaError('No camera device found. Please check your hardware.');
            } else {
              setMediaError(`Camera error: ${err.message}`);
            }
            setIsVideoOn(false);
          }
        }

        // Request audio stream
        if (isMicOn && !audioStream) {
          try {
            const aStream = await navigator.mediaDevices.getUserMedia({ 
              audio: { 
                echoCancellation: true, 
                noiseSuppression: true,
                autoGainControl: true 
              } 
            });
            setAudioStream(aStream);

            // Setup audio analyzer for visualization
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            
            const source = audioContext.createMediaStreamSource(aStream);
            const analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            
            source.connect(analyzer);
            audioAnalyzerRef.current = analyzer;

            // Start audio level monitoring
            const monitorAudioLevel = () => {
              if (!audioAnalyzerRef.current) return;
              
              const dataArray = new Uint8Array(audioAnalyzerRef.current.frequencyBinCount);
              audioAnalyzerRef.current.getByteFrequencyData(dataArray);
              
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              setAudioLevel(average);
              
              animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
            };
            monitorAudioLevel();
          } catch (err: any) {
            console.error('Audio error:', err);
            if (err.name === 'NotAllowedError') {
              setMediaError('Microphone permission denied. Please enable microphone access in browser settings.');
            } else if (err.name === 'NotFoundError') {
              setMediaError('No microphone device found. Please check your hardware.');
            } else {
              setMediaError(`Microphone error: ${err.message}`);
            }
            setIsMicOn(false);
          }
        }
      } catch (err) {
        console.error('Media initialization error:', err);
        setMediaError('Failed to initialize media devices');
      }
    };

    // Initialize media on mount or when video/mic toggles (but keep existing streams)
    if (sessionState === 'setup' || sessionState === 'active') {
      initializeMedia();
    }

    return () => {
      // Cleanup on unmount or state change
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVideoOn, isMicOn]);

  // Stop media streams when component unmounts
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure video element is connected to stream
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
      // Force play
      videoRef.current.play().catch(err => {
        console.error('Video play error:', err);
      });
    }
  }, [videoStream]);

  // Timer for session duration
  useEffect(() => {
    if (sessionState === 'active') {
      timerRef.current = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState]);

  const handleStart = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Verify media streams are available
      if (isVideoOn && !videoStream) {
        throw new Error('Video stream not initialized. Please check camera permissions and try again.');
      }
      if (isMicOn && !audioStream) {
        throw new Error('Audio stream not initialized. Please check microphone permissions and try again.');
      }

      const res = await fetch(`${API_URL}/interviews/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, companySpecific })
      });

      if (!res.ok) throw new Error('Could not start interview');
      const data = await res.json();
      
      setInterviewId(data.interviewId);
      setQuestion(data.question);
      setHints(data.hints || []);
      setExpectedAnswerOverview(data.expectedAnswerOverview || '');
      setTranscript([{ role: 'interviewer', text: data.question }]);
      setSecondsElapsed(0);
      setTurnEvaluation(null);
      setSessionState('active');
      
      // Simulate Voice TTS speaking the first question
      speakText(data.question);
    } catch (e) {
      console.error(e);
      setErrorMsg(e instanceof Error ? e.message : 'Failed to initialize session. Try seeding the database.');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text: string) => {
    setIsAiSpeaking(true);
    
    try {
      // Use Web Speech API for text-to-speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsAiSpeaking(false);
      };
      
      // Cancel any ongoing speech and start new one
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Text-to-speech error:', err);
      setIsAiSpeaking(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/interviews/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId,
          question,
          answer,
          durationSeconds: 30
        })
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();

      setTurnEvaluation(data.evaluation);
      
      // Append user answer and next question to local logs
      setTranscript(prev => [
        ...prev, 
        { role: 'user', text: answer },
        { role: 'interviewer', text: data.nextQuestion }
      ]);
      
      // Setup for next question
      setQuestion(data.nextQuestion);
      setAnswer('');
      speakText(data.nextQuestion);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Calculate a score based on last turn or aggregate
      const avgScore = turnEvaluation ? turnEvaluation.score : 85;

      const res = await fetch(`${API_URL}/interviews/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId,
          finalScore: avgScore
        })
      });

      if (!res.ok) throw new Error('Failed to complete session');
      const data = await res.json();
      
      setFinalReport(JSON.parse(data.interview.feedback));
      setSessionState('feedback');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPermissions = async () => {
    setMediaError('');
    setIsMicOn(true);
    setIsVideoOn(true);
    
    // Small delay before retrying
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // This will trigger the useEffect to reinitialize media
  };

  const handleReset = () => {
    // Stop all media tracks
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setSessionState('setup');
    setInterviewId('');
    setQuestion('');
    setAnswer('');
    setTranscript([]);
    setFinalReport(null);
    setTurnEvaluation(null);
    setMediaError('');
  };

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="space-y-8">
      
      {/* Session Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-outfit text-3xl font-extrabold text-white">Voice & Video AI Mock Room</h1>
          <p className="text-slate-400 text-sm mt-1">
            Conduct realistic interactive speaking simulations with real-time analytics dashboards.
          </p>
        </div>
        {sessionState === 'active' && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-mono text-slate-300">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>Time: {formatTime(secondsElapsed)}</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {mediaError && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-400 flex items-center justify-between">
          <span>⚠️ Media Device Issue: {mediaError}</span>
          <button
            onClick={handleRetryPermissions}
            className="px-3 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-300 font-semibold text-[10px] transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* ==============================================
          STATE 1: SETUP SCREEN
          ============================================== */}
      {sessionState === 'setup' && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Permission Help Info */}
          {(mediaError || !videoStream || !audioStream) && (
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300 leading-relaxed space-y-2">
              <p className="font-semibold">📹 Enabling Camera & Microphone:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Look for the camera/microphone icon in your browser's address bar</li>
                <li>Click "Allow" when prompted to access your camera and microphone</li>
                <li>If you see "Block", click the lock icon and change permissions to "Allow"</li>
                <li>Refresh the page after enabling permissions to reload the interview module</li>
              </ul>
            </div>
          )}
          
          {/* Preview Camera Before Starting */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Camera Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Camera Preview</label>
              <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-slate-950 overflow-hidden relative shadow-2xl">
                {isVideoOn && videoStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    onPlay={() => console.log('Video playing')}
                    onLoadedMetadata={() => console.log('Video metadata loaded')}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                    <VideoOff className="w-8 h-8 mb-2" />
                    <span className="text-xs">{isVideoOn ? 'Loading camera...' : 'Camera disabled'}</span>
                  </div>
                )}
              </div>
              {isVideoOn && videoStream && (
                <p className="text-[10px] text-green-400">✓ Camera active and working</p>
              )}
              {isVideoOn && !videoStream && !mediaError && (
                <p className="text-[10px] text-yellow-400">⏳ Requesting camera access...</p>
              )}
              {!isVideoOn && (
                <p className="text-[10px] text-slate-400">Camera disabled - click button below to enable</p>
              )}
              {mediaError && isVideoOn && (
                <p className="text-[10px] text-red-400">{mediaError}</p>
              )}
            </div>

            {/* Configuration Panel */}
            <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-slate-900/30 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="font-outfit text-xl font-bold text-white">Configure Your Mock Session</h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Select your assessment discipline and target corporation to begin.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Interview Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['TECHNICAL', 'BEHAVIORAL', 'HR', 'SYSTEM_DESIGN'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t as any)}
                        className={`h-11 rounded-lg border text-xs font-bold transition-all ${
                          type === t 
                            ? 'border-purple-500 bg-purple-500/10 text-purple-300' 
                            : 'border-white/5 bg-black text-slate-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Target Company (Optional)</label>
                  <input
                    type="text"
                    value={companySpecific}
                    onChange={(e) => setCompanySpecific(e.target.value)}
                    placeholder="e.g. Stripe, Google, Netflix"
                    className="w-full h-10 px-3 bg-black border border-white/10 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`h-11 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isVideoOn ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-red-500/30 bg-red-500/5 text-red-400'
                    }`}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    Video: {isVideoOn ? 'Enabled' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`h-11 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isMicOn ? 'border-green-500/30 bg-green-500/5 text-green-400' : 'border-red-500/30 bg-red-500/5 text-red-400'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    Microphone: {isMicOn ? 'Enabled' : 'Disabled'}
                  </button>

                  {/* Test Audio Button */}
                  {isMicOn && audioStream && (
                    <button
                      onClick={() => speakText('Test audio. If you hear this, your audio is working correctly.')}
                      className="h-10 rounded-lg border border-blue-500/30 bg-blue-500/5 text-blue-400 text-xs font-semibold hover:bg-blue-500/10 transition-all"
                    >
                      🔊 Test Audio & Microphone
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={loading || (isVideoOn && !videoStream) || (isMicOn && !audioStream)}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/15"
                title={loading ? 'Starting...' : (isVideoOn && !videoStream) ? 'Waiting for camera...' : (isMicOn && !audioStream) ? 'Waiting for microphone...' : ''}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Launch Simulator Session
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==============================================
          STATE 2: ACTIVE INTERVIEW SIMULATOR
          ============================================== */}
      {sessionState === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Camera simulation & audio metrics */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Camera Simulator Window */}
            <div className="aspect-[4/3] rounded-2xl border border-white/10 bg-slate-950 overflow-hidden relative shadow-2xl">
              {isVideoOn && videoStream ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 relative">
                  
                  {/* Real video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Status overlay */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded bg-black/60 border border-green-500/20 text-[10px] text-green-300 font-mono">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    Camera: Active
                  </div>
                  
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-slate-400 font-mono px-2">
                    <span>Video Feed: ON</span>
                    <span>Resolution: HD</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
                  <VideoOff className="w-8 h-8 mb-2" />
                  <span className="text-xs">Webcam feed disabled</span>
                </div>
              )}
            </div>

            {/* Audio Wave Visualizer */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Audio Input Level</span>
                <span className={`font-bold ${isMicOn ? 'text-green-400' : 'text-red-400'}`}>
                  {isMicOn ? `Mic: ON (Level: ${Math.round(audioLevel)})` : 'Mic: OFF'}
                </span>
              </div>
              <div className="h-10 flex items-center justify-center gap-1.5 bg-black rounded-lg px-4 overflow-hidden">
                {/* Real-time audio level bars */}
                {Array.from({ length: 15 }).map((_, idx) => {
                  // Create a staggered effect based on audio level
                  const baseLevel = Math.max(2, (audioLevel / 255) * 40);
                  const variation = Math.sin((idx + Date.now() / 100) * 0.1) * baseLevel * 0.3;
                  const height = Math.max(2, baseLevel + variation);
                  
                  return (
                    <div 
                      key={idx}
                      className="w-1 rounded-full bg-gradient-to-t from-green-600 to-blue-500 transition-all duration-75"
                      style={{ 
                        height: `${height}px`,
                      }}
                    />
                  );
                })}
              </div>
              {mediaError && (
                <div className="text-xs text-red-400 mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                  {mediaError}
                </div>
              )}
            </div>

            {/* AI Hints / Suggestions Pane */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Copilot Guide Panel
              </h4>
              <div className="space-y-2">
                {hints.map((hint, idx) => (
                  <div key={idx} className="p-3 bg-black rounded-lg border border-white/5 text-[11px] text-slate-300 leading-relaxed">
                    <strong>Suggestion {idx + 1}:</strong> {hint}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Panel: Dialogue box, text submit & speech log */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Dialogue Box */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-slate-900/20 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block mb-1">AI Evaluator</span>
                <div className="p-4 bg-black border border-white/5 rounded-xl text-sm font-medium text-white leading-relaxed">
                  {question}
                </div>
              </div>

              {/* Incremental Feedback Panel */}
              {turnEvaluation && (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300">Previous Turn Feedback</span>
                    <span className="font-bold text-purple-400">Score: {turnEvaluation.score}/100</span>
                  </div>
                  <div className="space-y-1.5 text-slate-400">
                    <p><strong>Vocal:</strong> Um count: {turnEvaluation.fillerWords?.um || 0}, Like count: {turnEvaluation.fillerWords?.like || 0}</p>
                    <p><strong>Improvements:</strong> "{turnEvaluation.betterVersion.substring(0, 100)}..."</p>
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input Area */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Response</label>
              
              {/* Real-time Audio Level Visualization */}
              {isMicOn && audioStream && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>🎤 Real-time Voice Level</span>
                    <span className="text-green-400 font-bold">Mic: ON (Level: {Math.round(audioLevel)})</span>
                  </div>
                  <div className="h-12 flex items-center justify-center gap-1 bg-black rounded-lg px-4 overflow-hidden border border-white/5">
                    {/* Real-time audio level bars */}
                    {Array.from({ length: 20 }).map((_, idx) => {
                      const baseLevel = Math.max(2, (audioLevel / 255) * 48);
                      const variation = Math.sin((idx + Date.now() / 100) * 0.15) * baseLevel * 0.4;
                      const height = Math.max(2, baseLevel + variation);
                      
                      return (
                        <div 
                          key={idx}
                          className="w-0.5 rounded-full bg-gradient-to-t from-green-600 via-green-500 to-blue-500 transition-all duration-75 shadow-lg shadow-green-500/50"
                          style={{ 
                            height: `${height}px`,
                            opacity: 0.7 + (audioLevel / 255) * 0.3
                          }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500">Speak naturally - your voice is being captured</p>
                </div>
              )}
              
              <textarea
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Simulate verbal feedback by typing your response here or pasting structured answers..."
                className="w-full p-4 bg-black border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
              />

              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => setAnswer("Relational SQL databases like PostgreSQL provide rigid schema structures with foreign keys and strong ACID guarantees. Non-relational databases like MongoDB are document-based, letting you scale horizontally by storing items as json documents, which works nicely for high-traffic writes.")}
                  className="px-3 py-1.5 rounded bg-white/5 border border-white/5 hover:bg-white/10 text-[10px] font-semibold text-slate-400 hover:text-white transition-all"
                >
                  Generate Test Response
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="h-10 px-5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5" />
                    Complete Assessment
                  </button>

                  <button
                    onClick={handleAnswerSubmit}
                    disabled={loading || !answer.trim()}
                    className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    Submit & Next
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Logs */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 max-h-60 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Transcript Logs</h4>
              {transcript.map((item, idx) => (
                <div key={idx} className={`text-xs leading-relaxed ${item.role === 'interviewer' ? 'text-slate-400' : 'text-purple-300 font-medium pl-6'}`}>
                  <strong>{item.role === 'interviewer' ? 'AI Evaluator:' : 'Candidate:'}</strong> {item.text}
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ==============================================
          STATE 3: DETAILED FINAL FEEDBACK HUD
          ============================================== */}
      {sessionState === 'feedback' && finalReport && (
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Summary Score Card */}
          <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900/20 to-slate-950/20 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-28 h-28 rounded-full bg-purple-600/10 border-2 border-purple-500 flex items-center justify-center flex-shrink-0 relative">
              <span className="font-outfit text-3xl font-extrabold text-white">{turnEvaluation?.score || 85}</span>
              <span className="absolute bottom-2 text-[8px] uppercase font-bold tracking-widest text-purple-400">Final Index</span>
            </div>
            <div className="space-y-2">
              <div className="inline-flex px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">Assessment Completed</div>
              <h3 className="text-xl font-bold text-white">Interactive Session Assessment Report</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {finalReport.overallSummary}
              </p>
            </div>
          </div>

          {/* Eye contact and filler words diagnostics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Communication Rating details */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-purple-400" />
                Vocal & Communication Diagnostics
              </h4>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Behavioral Score</span>
                  <span className="font-bold text-white">{finalReport.behavioralRating} / 100</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Technical Content Match</span>
                  <span className="font-bold text-white">{finalReport.technicalRating} / 100</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Common Filler Flags</span>
                  <span className="font-bold text-pink-400">
                    {finalReport.fillerWordsFails && finalReport.fillerWordsFails.length > 0 
                      ? finalReport.fillerWordsFails.join(', ') 
                      : 'None detected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Video Eye Contact analysis */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-400" />
                Simulated Video Facial Analytics
              </h4>
              {finalReport.simulatedVideoMetrics ? (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Verified Eye Contact</span>
                    <span className="font-bold text-white">{finalReport.simulatedVideoMetrics.eyeContactPercentage}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-slate-400">Posture Stability</span>
                    <span className="font-bold text-white">{finalReport.simulatedVideoMetrics.postureStability}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Confidence Score Rating</span>
                    <span className="font-bold text-blue-400">{finalReport.simulatedVideoMetrics.confidenceIndex} / 100</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">Video metrics were disabled during this assessment.</p>
              )}
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleReset}
              className="h-10 px-6 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Start Practice Session
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard/student')}
              className="h-10 px-6 border border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition-all"
            >
              Exit to Dashboard
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
