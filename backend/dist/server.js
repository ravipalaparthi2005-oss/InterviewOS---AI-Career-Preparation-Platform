"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
// Import Route Handlers
const auth_1 = __importDefault(require("./routes/auth"));
const resumes_1 = __importDefault(require("./routes/resumes"));
const interviews_1 = __importDefault(require("./routes/interviews"));
const roadmaps_1 = __importDefault(require("./routes/roadmaps"));
const recruiter_1 = __importDefault(require("./routes/recruiter"));
const admin_1 = __importDefault(require("./routes/admin"));
const coding_1 = __importDefault(require("./routes/coding"));
const mentor_1 = __importDefault(require("./routes/mentor"));
dotenv.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow all client development origins for simplicity
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Mounting
app.use('/api/auth', auth_1.default);
app.use('/api/resumes', resumes_1.default);
app.use('/api/interviews', interviews_1.default);
app.use('/api/roadmaps', roadmaps_1.default);
app.use('/api/recruiter', recruiter_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/coding', coding_1.default);
app.use('/api/mentor', mentor_1.default);
// Base Route
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'InterviewOS Backend' });
});
// Socket.io Real-time Signalling and Live Coding Collaboration
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    // Joining active collaboration rooms
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        // Notify others in room
        socket.to(roomId).emit('user-joined', socket.id);
    });
    // WebRTC Web Camera Offer/Answer/Candidate Signalling
    socket.on('send-signal', (data) => {
        io.to(data.to).emit('receive-signal', {
            from: socket.id,
            signal: data.signal
        });
    });
    socket.on('send-ice-candidate', (data) => {
        io.to(data.to).emit('receive-ice-candidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });
    // Collaborative Coding Editor Synchronizer
    socket.on('editor-change', (data) => {
        socket.to(data.roomId).emit('editor-update', {
            code: data.code,
            language: data.language
        });
    });
    // Collaborative Whiteboard Synchronizer
    socket.on('whiteboard-draw', (data) => {
        socket.to(data.roomId).emit('whiteboard-update', data.drawData);
    });
    // Collaborative Text Chat
    socket.on('chat-message', (data) => {
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
