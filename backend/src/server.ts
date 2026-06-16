import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';

// Import Route Handlers
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resumes';
import interviewRoutes from './routes/interviews';
import roadmapRoutes from './routes/roadmaps';
import recruiterRoutes from './routes/recruiter';
import adminRoutes from './routes/admin';
import codingRoutes from './routes/coding';
import mentorRoutes from './routes/mentor';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all client development origins for simplicity
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Mounting
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/mentor', mentorRoutes);

// Base Route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'InterviewOS Backend' });
});

// Socket.io Real-time Signalling and Live Coding Collaboration
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Joining active collaboration rooms
  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    // Notify others in room
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // WebRTC Web Camera Offer/Answer/Candidate Signalling
  socket.on('send-signal', (data: { to: string; signal: any }) => {
    io.to(data.to).emit('receive-signal', {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on('send-ice-candidate', (data: { to: string; candidate: any }) => {
    io.to(data.to).emit('receive-ice-candidate', {
      from: socket.id,
      candidate: data.candidate
    });
  });

  // Collaborative Coding Editor Synchronizer
  socket.on('editor-change', (data: { roomId: string; code: string; language: string }) => {
    socket.to(data.roomId).emit('editor-update', {
      code: data.code,
      language: data.language
    });
  });

  // Collaborative Whiteboard Synchronizer
  socket.on('whiteboard-draw', (data: { roomId: string; drawData: any }) => {
    socket.to(data.roomId).emit('whiteboard-update', data.drawData);
  });

  // Collaborative Text Chat
  socket.on('chat-message', (data: { roomId: string; sender: string; text: string }) => {
    io.to(data.roomId).emit('chat-message-received', {
      sender: data.sender,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Leaving room handler
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.to(room).emit('user-left', socket.id);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`INTERVIEWOS BACKEND STARTED ON PORT ${PORT}`);
  console.log(`REAL-TIME WEBSOCKET SIGNALS AND INTERACTION ON`);
  console.log(`=================================================`);
});
