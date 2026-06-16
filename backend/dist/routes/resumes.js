"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../services/db"));
const auth_1 = require("../middleware/auth");
const gemini_1 = require("../services/gemini");
const router = (0, express_1.Router)();
// POST /api/resumes/upload
// Parses the text and returns an ATS score with suggestions.
router.post('/upload', auth_1.requireAuth, async (req, res) => {
    try {
        const { filename, content } = req.body;
        const userId = req.user?.id;
        if (!filename || !content) {
            return res.status(400).json({ error: 'Filename and resume text content are required' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Call Gemini to scan the resume
        const analysis = await gemini_1.GeminiService.analyzeResume(content, 'General Full Stack Software Engineer');
        // Save to DB
        const resume = await db_1.default.resume.create({
            data: {
                userId,
                filename,
                atsScore: analysis.atsScore,
                feedback: JSON.stringify({
                    summary: analysis.summary,
                    improvements: analysis.improvements,
                    skillGaps: analysis.skillGaps
                }),
                skills: analysis.skills.join(','),
                missingKeywords: analysis.missingKeywords.join(',')
            }
        });
        // Track analytics usage
        await db_1.default.systemAnalytics.create({
            data: {
                metric: 'AI_TOKEN_USAGE',
                value: 120 // mock token weight
            }
        });
        return res.status(201).json({
            message: 'Resume analyzed successfully',
            resume: {
                ...resume,
                skills: analysis.skills,
                missingKeywords: analysis.missingKeywords,
                feedback: analysis
            }
        });
    }
    catch (err) {
        console.error('Resume scan error:', err);
        return res.status(500).json({ error: 'Error analyzing resume with AI' });
    }
});
// POST /api/resumes/match
// Compares a specific resume with a job description.
router.post('/match', auth_1.requireAuth, async (req, res) => {
    try {
        const { resumeId, jobTitle, jobDescription } = req.body;
        if (!resumeId || !jobTitle || !jobDescription) {
            return res.status(400).json({ error: 'resumeId, jobTitle, and jobDescription are required' });
        }
        const resume = await db_1.default.resume.findUnique({ where: { id: resumeId } });
        if (!resume) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        // Analyze the matching using Gemini
        const matchAnalysis = await gemini_1.GeminiService.analyzeResume(resume.filename + '\n' + resume.skills, jobDescription);
        // Save JobMatch record
        const jobMatch = await db_1.default.jobMatch.create({
            data: {
                resumeId,
                jobTitle,
                jobDescription,
                matchScore: matchAnalysis.atsScore,
                readinessScore: matchAnalysis.readinessScore,
                feedback: JSON.stringify({
                    summary: matchAnalysis.summary,
                    improvements: matchAnalysis.improvements,
                    skillGaps: matchAnalysis.skillGaps,
                    missingKeywords: matchAnalysis.missingKeywords
                })
            }
        });
        return res.status(201).json({
            message: 'Job match analysis complete',
            jobMatch: {
                ...jobMatch,
                feedback: matchAnalysis
            }
        });
    }
    catch (err) {
        console.error('Job match analysis error:', err);
        return res.status(500).json({ error: 'Error performing job match analysis' });
    }
});
// GET /api/resumes/history
router.get('/history', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const resumes = await db_1.default.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                jobMatches: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        const parsedResumes = resumes.map(r => {
            let feedbackParsed = {};
            try {
                feedbackParsed = JSON.parse(r.feedback);
            }
            catch (e) { }
            return {
                ...r,
                skills: r.skills ? r.skills.split(',') : [],
                missingKeywords: r.missingKeywords ? r.missingKeywords.split(',') : [],
                feedback: feedbackParsed
            };
        });
        return res.json({ resumes: parsedResumes });
    }
    catch (err) {
        console.error('Error fetching resume history:', err);
        return res.status(500).json({ error: 'Error fetching resume history' });
    }
});
exports.default = router;
