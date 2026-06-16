'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, API_URL } from '../../../../components/Providers';
import SimplePeer from 'simple-peer';
import { io } from 'socket.io-client';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  MessageSquare,
  Phone,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';

interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export default function WebRTCRoomPage() {
  const { token, user } = useAuth();
  const socketRef = useRef<any>(null);
  const peerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [roomId, setRoomId] = useState('');
  const [connected, setConnected] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket and WebRTC
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000
    });

    const generateRoomId = () => `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);

    // Socket handlers
    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('join-room', newRoomId);
    });

    socketRef.current.on('user-joined', (userId: string) => {
      console.log('User joined:', userId);
      initiatePeerConnection(true);
    });

    socketRef.current.on('receive-signal', (data: any) => {
      console.log('Received signal');
      if (!peerRef.current) {
        initiatePeerConnection(false);
      }
      peerRef.current.signal(data.signal);
    });

    socketRef.current.on('receive-ice-candidate', (data: any) => {
      if (peerRef.current) {
        peerRef.current.addIceCandidate(data.candidate);
      }
    });

    socketRef.current.on('chat-message-received', (data: any) => {
      setMessages(prev => [...prev, {
        sender: data.sender,
        text: data.text,
        timestamp: data.timestamp
      }]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [token]);

  const initiatePeerConnection = (initiator: boolean) => {
    try {
      peerRef.current = new SimplePeer({
        initiator,
        trickle: false,
        stream: localStreamRef.current || undefined,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peerRef.current.on('signal', (signal: any) => {
        socketRef.current.emit('send-signal', {
          to: 'remote-peer',
          signal
        });
      });

      peerRef.current.on('stream', (stream: MediaStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      peerRef.current.on('error', (err: any) => {
        console.error('Peer error:', err);
      });

      setConnected(true);
    } catch (err) {
      console.error('Peer connection error:', err);
    }
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Auto-initiate peer connection
      if (socketRef.current?.connected) {
        initiatePeerConnection(true);
      }
    } catch (err) {
      console.error('getUserMedia error:', err);
      alert('Please enable camera and microphone permissions');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      screenStreamRef.current = stream;

      // Replace video track
      const videoTrack = stream.getVideoTracks()[0];
      if (peerRef.current && localStreamRef.current) {
        const sender = peerRef.current._pc.getSenders().find((s: any) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      // Handle stop
      stream.getTracks()[0].onended = () => {
        stopScreenShare();
      };

      setIsScreenSharing(true);
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const stopScreenShare = async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }

      if (peerRef.current && localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        const sender = peerRef.current._pc.getSenders().find((s: any) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      setIsScreenSharing(false);
    } catch (err) {
      console.error('Stop screen share error:', err);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;

    const msg = {
      roomId,
      sender: user?.name || 'Anonymous',
      text: chatInput
    };

    socketRef.current.emit('chat-message', msg);
    setMessages(prev => [...prev, {
      sender: user?.name || 'You',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setChatInput('');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white">Real-Time Interview Room</h1>
        <p className="text-slate-400 text-sm mt-1">
          Live video conferencing with screen sharing and real-time chat
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Main Video Area */}
        <div className="lg:col-span-9 flex flex-col space-y-4">
          
          {/* Video Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-0">
            {/* Local Video */}
            <div className="relative rounded-lg overflow-hidden bg-black border border-white/10">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4">
                <p className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                  {user?.name || 'You'}
                </p>
              </div>
            </div>

            {/* Remote Video */}
            <div className="relative rounded-lg overflow-hidden bg-black border border-white/10">
              {connected ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mb-2 mx-auto" />
                    <p className="text-xs">Waiting for interviewer...</p>
                  </div>
                </div>
              )}
              {connected && (
                <div className="absolute bottom-4 left-4">
                  <p className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                    Interviewer
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Room Info & Controls */}
          <div className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">Room ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-white bg-white/5 px-2 py-1 rounded">
                    {roomId}
                  </p>
                  <button
                    onClick={copyRoomId}
                    className="p-1 hover:bg-white/10 rounded transition-all"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="text-right">
                <p className="text-xs text-slate-400">Status</p>
                <p className={`text-xs font-bold ${connected ? 'text-green-400' : 'text-yellow-400'}`}>
                  {connected ? '● Connected' : '● Waiting'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={toggleVideo}
              className={`h-10 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                isVideoOn
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              {isVideoOn ? 'Camera ON' : 'Camera OFF'}
            </button>

            <button
              onClick={toggleMic}
              className={`h-10 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                isMicOn
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              {isMicOn ? 'Mic ON' : 'Mic OFF'}
            </button>

            <button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className={`h-10 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                isScreenSharing
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-white'
              }`}
            >
              {isScreenSharing ? <X className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {isScreenSharing ? 'Stop Share' : 'Share Screen'}
            </button>

            <button
              onClick={() => setShowChat(!showChat)}
              className="h-10 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all bg-slate-700 hover:bg-slate-600 text-white"
            >
              <MessageSquare className="w-4 h-4" />
              Chat ({messages.length})
            </button>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="lg:col-span-3 flex flex-col border border-white/10 rounded-lg overflow-hidden min-h-0">
            
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-black/40">
              <h3 className="text-sm font-bold text-white">Session Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <p className="text-xs font-bold text-white">{msg.sender}</p>
                      <p className="text-[10px] text-slate-500">{msg.timestamp}</p>
                    </div>
                    <p className="text-xs text-slate-300 bg-white/5 p-2 rounded">{msg.text}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendChatMessage();
                }}
                placeholder="Type message..."
                className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                className="p-1.5 bg-purple-600 hover:bg-purple-700 rounded transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
