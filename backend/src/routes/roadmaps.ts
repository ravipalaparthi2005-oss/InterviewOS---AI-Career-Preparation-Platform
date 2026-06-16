import { Router, Response } from 'express';
import prisma from '../services/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { GeminiService } from '../services/gemini';

const router = Router();

// POST /api/roadmaps/generate
router.post('/generate', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
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
    const roadmapData = await GeminiService.generateRoadmap(skillArray, targetJob);

    // Save to Database (we replace old roadmaps or keep them; let's create a new one)
    const newRoadmap = await prisma.roadmap.create({
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
  } catch (err) {
    console.error('Roadmap generate error:', err);
    return res.status(500).json({ error: 'Failed to generate career roadmap' });
  }
});

// GET /api/roadmaps/active
router.get('/active', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const activeRoadmap = await prisma.roadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!activeRoadmap) {
      return res.status(404).json({ error: 'No active roadmap found' });
    }

    let steps = [];
    try {
      steps = JSON.parse(activeRoadmap.steps);
    } catch (e) {}

    return res.json({
      roadmap: {
        ...activeRoadmap,
        steps
      }
    });
  } catch (err) {
    console.error('Fetch active roadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch active roadmap' });
  }
});

// POST /api/roadmaps/update-step
router.post('/update-step', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { roadmapId, currentStep } = req.body;
    if (!roadmapId || currentStep === undefined) {
      return res.status(400).json({ error: 'roadmapId and currentStep are required' });
    }

    const updated = await prisma.roadmap.update({
      where: { id: roadmapId },
      data: { currentStep: Number(currentStep) }
    });

    let steps = [];
    try {
      steps = JSON.parse(updated.steps);
    } catch (e) {}

    return res.json({
      message: 'Roadmap step updated successfully',
      roadmap: {
        ...updated,
        steps
      }
    });
  } catch (err) {
    console.error('Update roadmap step error:', err);
    return res.status(500).json({ error: 'Failed to update roadmap progress' });
  }
});

export default router;
