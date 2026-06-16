import { Router, Response } from 'express';
import prisma from '../services/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { CodeExecutor } from '../services/executor';
import { GeminiService } from '../services/gemini';

const router = Router();
const executor = new CodeExecutor();

// GET /api/coding/problems - Get all coding problems
router.get('/problems', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const problems = await prisma.codingProblem.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        category: true,
        tags: true
      }
    });

    return res.status(200).json({ problems });
  } catch (err) {
    console.error('Get problems error:', err);
    return res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

// GET /api/coding/problems/:id - Get specific problem
router.get('/problems/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const problem = await prisma.codingProblem.findUnique({
      where: { id },
      include: {
        submissions: {
          where: { userId: req.user?.id },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Don't expose full test cases to frontend
    const { testCases, sampleSolution, ...problemData } = problem;
    const testCasesObj = JSON.parse(testCases || '[]');

    return res.status(200).json({
      ...problemData,
      examples: JSON.parse(problem.examples || '[]'),
      constraints: JSON.parse(problem.constraints || '[]')
    });
  } catch (err) {
    console.error('Get problem error:', err);
    return res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

// POST /api/coding/execute - Execute code against test cases
router.post('/execute', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user?.id;

    if (!problemId || !code || !language) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch problem and test cases
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCases = JSON.parse(problem.testCases || '[]');
    
    if (testCases.length === 0) {
      return res.status(400).json({ error: 'No test cases available' });
    }

    // Execute code
    const result = await executor.executeCode({
      code,
      language,
      testCases
    });

    // Save submission
    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }
    const submission = await prisma.codeSubmission.create({
      data: {
        userId: userId!,
        problemId,
        language,
        code,
        passed: result.passed,
        total: result.total,
        executionTime: result.totalTime,
        status: result.success ? 'PASSED' : 'FAILED',
        feedback: JSON.stringify(result)
      }
    });

    return res.status(200).json({
      submissionId: submission.id,
      ...result
    });
  } catch (err: any) {
    console.error('Execute code error:', err);
    return res.status(500).json({ error: err.message || 'Code execution failed' });
  }
});

// POST /api/coding/submit - Submit final solution
router.post('/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user?.id;

    if (!problemId || !code || !language || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch problem
    const problem = await prisma.codingProblem.findUnique({
      where: { id: problemId }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const testCases = JSON.parse(problem.testCases || '[]');

    // Execute code against all test cases
    const result = await executor.executeCode({
      code,
      language,
      testCases
    });

    // Create submission record
    const submission = await prisma.codeSubmission.create({
      data: {
        userId,
        problemId,
        language,
        code,
        passed: result.passed,
        total: result.total,
        executionTime: result.totalTime,
        status: result.success ? 'PASSED' : 'FAILED',
        feedback: JSON.stringify(result)
      }
    });

    // Get AI feedback if solution is incorrect
    let aiHints = '';
    if (!result.success) {
      try {
        aiHints = await GeminiService.generateCodingHints(
          problem.title,
          problem.description,
          code,
          result.results[0]?.error || 'Test case failed'
        );
      } catch (e) {
        console.error('Error generating hints:', e);
      }
    }

    return res.status(200).json({
      submissionId: submission.id,
      ...result,
      aiHints
    });
  } catch (err: any) {
    console.error('Submit code error:', err);
    return res.status(500).json({ error: err.message || 'Submission failed' });
  }
});

// GET /api/coding/submissions/:userId - Get user's submission history
router.get('/submissions/:userId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (req.user?.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const submissions = await prisma.codeSubmission.findMany({
      where: { userId },
      include: { problem: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return res.status(200).json({ submissions });
  } catch (err) {
    console.error('Get submissions error:', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

export default router;
