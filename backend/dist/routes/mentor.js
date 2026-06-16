"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const gemini_1 = require("../services/gemini");
const router = (0, express_1.Router)();
// Simple in-memory session storage for mentor conversations
const mentorSessions = new Map();
// POST /api/mentor/chat - Send message to mentor
router.post('/chat', auth_1.requireAuth, async (req, res) => {
    try {
        const { sessionId, message, context } = req.body;
        const userId = req.user?.id;
        if (!message || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        // Get or create session
        const sessionKey = `${userId}-${sessionId}`;
        if (!mentorSessions.has(sessionKey)) {
            mentorSessions.set(sessionKey, []);
        }
        const sessionHistory = mentorSessions.get(sessionKey) || [];
        // Build mentor prompt with context
        const systemPrompt = `You are an expert career mentor for software engineers. You provide:
- Resume optimization advice
- STAR method structuring for behavioral answers
- System design discussion and feedback
- Technical interview preparation
- Career growth strategies

Be concise, actionable, and specific. Provide concrete examples when possible.`;
        const conversationContext = context ? context.map((msg) => `${msg.role}: ${msg.text}`).join('\n') : '';
        const prompt = `
${systemPrompt}

Previous conversation:
${conversationContext}

User's new question:
${message}

Provide a helpful, concise mentor response (2-3 sentences max):`;
        // Generate mentor response using Gemini
        let mentorReply = '';
        if (gemini_1.GeminiService) {
            try {
                const model = global.ai?.getGenerativeModel?.({ model: "gemini-1.5-flash" });
                if (model) {
                    const response = await model.generateContent(prompt);
                    mentorReply = response.response.text() || '';
                }
            }
            catch (e) {
                console.warn('Gemini API error, using fallback:', e);
            }
        }
        // Fallback responses
        if (!mentorReply) {
            const fallbackResponses = {
                'resume': 'Focus on quantifiable achievements. Change "Responsible for feature X" to "Shipped feature X that improved performance by 40%, used by 50k+ daily active users." Numbers and impact matter.',
                'star': 'STAR format: Situation (context), Task (your role), Action (what you did), Result (measurable outcome). Practice 3-5 examples covering: handling conflict, learning quickly, failure recovery, and technical impact.',
                'system design': 'Start with requirements. Draw a high-level architecture (web servers → APIs → databases). Discuss scaling: horizontal vs vertical, caching (Redis), CDN, database replication. Mention trade-offs and monitoring.',
                'interview': 'Prepare: practice 20+ coding problems, mock interviews weekly, study your top 5 target companies. For behavioral: practice STAR answers. For system design: solve 10 real systems (Twitter, Netflix, Uber).',
                'career': 'Build a portfolio of complete, deployed projects. Learn new frameworks yearly. Contribute to open source. Network actively. Your Github and deployed apps matter more than certifications.'
            };
            const lowerMessage = message.toLowerCase();
            for (const [key, value] of Object.entries(fallbackResponses)) {
                if (lowerMessage.includes(key)) {
                    mentorReply = value;
                    break;
                }
            }
            if (!mentorReply) {
                mentorReply = 'Great question! The key to career growth is building real projects, learning continuously, and connecting with others in the tech community. What specific area would you like to focus on?';
            }
        }
        // Store in session history
        sessionHistory.push({ role: 'user', text: message });
        sessionHistory.push({ role: 'mentor', text: mentorReply });
        mentorSessions.set(sessionKey, sessionHistory);
        return res.status(200).json({
            reply: mentorReply,
            sessionId
        });
    }
    catch (err) {
        console.error('Mentor chat error:', err);
        return res.status(500).json({ error: 'Failed to process mentor request' });
    }
});
// GET /api/mentor/sessions/:userId - Get user's mentor sessions
router.get('/sessions/:userId', auth_1.requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user?.id !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        // Return session metadata (not full history to save bandwidth)
        const sessions = [];
        for (const [key, value] of mentorSessions.entries()) {
            if (key.startsWith(`${userId}-`)) {
                const sessionId = key.split('-').pop();
                sessions.push({
                    sessionId,
                    messageCount: value.length,
                    lastMessage: value[value.length - 1]?.text.substring(0, 50) || ''
                });
            }
        }
        return res.status(200).json({ sessions });
    }
    catch (err) {
        console.error('Get sessions error:', err);
        return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});
// POST /api/mentor/clear-session - Clear a mentor session
router.post('/clear-session', auth_1.requireAuth, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const userId = req.user?.id;
        if (!sessionId || !userId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const sessionKey = `${userId}-${sessionId}`;
        mentorSessions.delete(sessionKey);
        return res.status(200).json({ success: true });
    }
    catch (err) {
        console.error('Clear session error:', err);
        return res.status(500).json({ error: 'Failed to clear session' });
    }
});
exports.default = router;
