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
// POST /api/roadmaps/generate
router.post('/generate', auth_1.requireAuth, async (req, res) => {
    try {
        const { targetJob, skills } = req.body;
        const userId = req.user?.id;
        if (!targetJob) {
            return res.status(400).json({ error: 'Target job is required' });
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const skillArray = skills ? (Array.isArray(skills) ? skills : skills.split(',')) : [];
        // Call Gemini to generate roadmap
        const roadmapData = await gemini_1.GeminiService.generateRoadmap(skillArray, targetJob);
        // Save to Database (we replace old roadmaps or keep them; let's create a new one)
        const newRoadmap = await db_1.default.roadmap.create({
            data: {
                userId,
                title: roadmapData.title,
                targetJob: roadmapData.targetJob,
                steps: JSON.stringify(roadmapData.steps),
                currentStep: 0
            }
        });
        return res.status(201).json({
            message: 'Roadmap generated successfully',
            roadmap: {
                ...newRoadmap,
                steps: roadmapData.steps
            }
        });
    }
    catch (err) {
        console.error('Roadmap generate error:', err);
        return res.status(500).json({ error: 'Failed to generate career roadmap' });
    }
});
// GET /api/roadmaps/active
router.get('/active', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const activeRoadmap = await db_1.default.roadmap.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        if (!activeRoadmap) {
            return res.status(404).json({ error: 'No active roadmap found' });
        }
        let steps = [];
        try {
            steps = JSON.parse(activeRoadmap.steps);
        }
        catch (e) { }
        return res.json({
            roadmap: {
                ...activeRoadmap,
                steps
            }
        });
    }
    catch (err) {
        console.error('Fetch active roadmap error:', err);
        return res.status(500).json({ error: 'Failed to fetch active roadmap' });
    }
});
// POST /api/roadmaps/update-step
router.post('/update-step', auth_1.requireAuth, async (req, res) => {
    try {
        const { roadmapId, currentStep } = req.body;
        if (!roadmapId || currentStep === undefined) {
            return res.status(400).json({ error: 'roadmapId and currentStep are required' });
        }
        const updated = await db_1.default.roadmap.update({
            where: { id: roadmapId },
            data: { currentStep: Number(currentStep) }
        });
        let steps = [];
        try {
            steps = JSON.parse(updated.steps);
        }
        catch (e) { }
        return res.json({
            message: 'Roadmap step updated successfully',
            roadmap: {
                ...updated,
                steps
            }
        });
    }
    catch (err) {
        console.error('Update roadmap step error:', err);
        return res.status(500).json({ error: 'Failed to update roadmap progress' });
    }
});
exports.default = router;
