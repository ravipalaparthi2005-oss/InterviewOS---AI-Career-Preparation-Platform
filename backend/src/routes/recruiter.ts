import { Router, Response } from 'express';
import prisma from '../services/db';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Middleware checking if user is RECRUITER or ADMIN
function requireRecruiterOrAdmin(req: AuthenticatedRequest, res: Response, next: any) {
  const role = req.user?.role;
  if (role !== 'RECRUITER' && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Recruiters and Administrators only' });
  }
  next();
}

// GET /api/recruiter/candidates
router.get('/candidates', requireAuth, requireRecruiterOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        resumes: {
          select: {
            atsScore: true,
            skills: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        interviews: {
          select: {
            score: true,
            type: true,
            status: true
          }
        }
      }
    });

    const candidates = students.map(student => {
      const activeResume = student.resumes[0] || null;
      const completedInterviews = student.interviews.filter(i => i.status === 'COMPLETED');
      const avgInterviewScore = completedInterviews.length
        ? Math.round(completedInterviews.reduce((acc, curr) => acc + curr.score, 0) / completedInterviews.length)
        : null;

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        joinDate: student.createdAt,
        atsScore: activeResume ? activeResume.atsScore : null,
        skills: activeResume && activeResume.skills ? activeResume.skills.split(',') : [],
        completedInterviewsCount: completedInterviews.length,
        avgInterviewScore,
        hiringStatus: (avgInterviewScore && avgInterviewScore >= 85 && activeResume && activeResume.atsScore >= 80)
          ? 'HIGH_READINESS'
          : (avgInterviewScore && avgInterviewScore >= 70) ? 'INTERVIEWING' : 'PREPARING'
      };
    });

    // Sort by rank: highest average mock score + resume score
    candidates.sort((a, b) => {
      const scoreA = (a.avgInterviewScore || 0) + (a.atsScore || 0);
      const scoreB = (b.avgInterviewScore || 0) + (b.atsScore || 0);
      return scoreB - scoreA;
    });

    return res.json({ candidates });
  } catch (err) {
    console.error('Error listing recruiter candidates:', err);
    return res.status(500).json({ error: 'Failed to retrieve candidate lists' });
  }
});

// GET /api/recruiter/candidate/:id
router.get('/candidate/:id', requireAuth, requireRecruiterOrAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const student = await prisma.user.findUnique({
      where: { id, role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        resumes: {
          orderBy: { createdAt: 'desc' }
        },
        interviews: {
          orderBy: { createdAt: 'desc' }
        },
        roadmaps: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const resumesParsed = student.resumes.map(r => {
      let feedback = {};
      try { feedback = JSON.parse(r.feedback); } catch(e) {}
      return {
        ...r,
        skills: r.skills ? r.skills.split(',') : [],
        feedback
      };
    });

    const interviewsParsed = student.interviews.map(i => {
      let feedback = {};
      let transcript = [];
      try {
        feedback = JSON.parse(i.feedback);
        transcript = JSON.parse(i.transcript);
      } catch(e) {}
      return {
        ...i,
        feedback,
        transcript
      };
    });

    return res.json({
      candidate: {
        id: student.id,
        name: student.name,
        email: student.email,
        resumes: resumesParsed,
        interviews: interviewsParsed,
        activeRoadmap: student.roadmaps[0] || null
      }
    });
  } catch (err) {
    console.error('Error fetching recruiter candidate details:', err);
    return res.status(500).json({ error: 'Failed to retrieve candidate details' });
  }
});

export default router;
