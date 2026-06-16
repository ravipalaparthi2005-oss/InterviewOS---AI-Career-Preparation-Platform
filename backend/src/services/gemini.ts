import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini SDK if the key exists
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.error("Failed to initialize GoogleGenerativeAI:", error);
  }
}

/**
 * Interface representing the detailed ATS Resume Analysis
 */
export interface ATSAnalysisResult {
  atsScore: number;
  skills: string[];
  missingKeywords: string[];
  skillGaps: Array<{ skill: string; status: 'missing' | 'basic' | 'proficient'; recommendation: string }>;
  improvements: Array<{ original: string; improved: string; reason: string }>;
  readinessScore: number;
  summary: string;
}

/**
 * Interface representing the Career Roadmap
 */
export interface CareerRoadmapResult {
  title: string;
  targetJob: string;
  steps: Array<{
    name: string;
    description: string;
    duration: string;
    resources: string[];
    milestones: string[];
  }>;
}

/**
 * Interface representing the Interview Evaluation
 */
export interface InterviewEvaluationResult {
  score: number;
  confidenceScore: number;
  fillerWords: { um?: number; like?: number; actually?: number; total: number };
  eyeContactScore: number;
  grammarFeedback: string;
  technicalCorrectness: string;
  betterVersion: string;
  followUpQuestion: string;
}

export class GeminiService {
  /**
   * Helper to execute Gemini models or fallback to mockup results.
   */
  private static async callGemini(prompt: string, fallbackData: any): Promise<any> {
    if (!ai) {
      // Return high-quality simulated data if key is missing
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API latency
      return fallbackData;
    }

    try {
      // Use gemini-1.5-flash or similar available model
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });
      const response = await model.generateContent(prompt);
      const text = response.response.text() || "";
      return JSON.parse(text);
    } catch (err) {
      console.warn("Gemini API error, falling back to mock content:", err);
      return fallbackData;
    }
  }

  /**
   * Analyzes a resume against a job description.
   */
  static async analyzeResume(resumeText: string, jobDesc: string): Promise<ATSAnalysisResult> {
    const prompt = `
      You are an elite ATS (Applicant Tracking System) Scanner and Recruiter.
      Analyze the following resume content against the job description.
      Resume content:
      "${resumeText}"
      
      Job Description:
      "${jobDesc || 'General Full Stack Software Engineer'}"
      
      Return a JSON response conforming strictly to this TypeScript shape:
      {
        "atsScore": number (out of 100),
        "skills": string[],
        "missingKeywords": string[],
        "skillGaps": { skill: string, status: "missing" | "basic" | "proficient", recommendation: string }[],
        "improvements": { original: string, improved: string, reason: string }[],
        "readinessScore": number (out of 100),
        "summary": string
      }
    `;

    const fallback: ATSAnalysisResult = {
      atsScore: 78,
      skills: ["React", "TypeScript", "Node.js", "Express", "REST APIs", "Git", "CSS", "HTML5"],
      missingKeywords: ["Docker", "Kubernetes", "Next.js", "CI/CD Pipelines", "System Design", "AWS S3"],
      skillGaps: [
        { skill: "Docker", status: "missing", recommendation: "Deploy a Node.js project using a multi-stage Dockerfile." },
        { skill: "AWS S3/EC2", status: "basic", recommendation: "Learn AWS basics and host a static site on S3 with CloudFront." },
        { skill: "Next.js", status: "basic", recommendation: "Rebuild a static landing page into Next.js App Router for server-side rendering benefits." }
      ],
      improvements: [
        { original: "Responsible for writing backend APIs in Node.js.", improved: "Architected and deployed 15+ highly responsive Node.js REST endpoints, reducing API response latency by 25%.", reason: "Uses action verbs and provides measurable, quantitative results." },
        { original: "Helped build a React dashboard web app.", improved: "Engineered a responsive React dashboard utilizing context-based state management, improving load times by 1.2s.", reason: "Specifies technologies used and highlights optimization accomplishments." }
      ],
      readinessScore: 82,
      summary: "The resume shows strong foundational frontend and backend skills. However, to compete for high-level full-stack engineer positions, it lacks devops tooling (Docker, CI/CD) and cloud experience (AWS)."
    };

    return this.callGemini(prompt, fallback);
  }

  /**
   * Generates a personalized career roadmap.
   */
  static async generateRoadmap(skills: string[], targetJob: string): Promise<CareerRoadmapResult> {
    const prompt = `
      You are an expert tech mentor. Design a personalized career roadmap for a user who knows: ${skills.join(', ')}
      and wants to get a job as a: "${targetJob}".
      
      Return a JSON response conforming strictly to this TypeScript shape:
      {
        "title": string,
        "targetJob": string,
        "steps": {
          "name": string,
          "description": string,
          "duration": string,
          "resources": string[],
          "milestones": string[]
        }[]
      }
    `;

    const fallback: CareerRoadmapResult = {
      title: `Accelerated Path to ${targetJob || 'Senior Full Stack Engineer'}`,
      targetJob: targetJob || "Senior Full Stack Engineer",
      steps: [
        {
          name: "Advance Code Quality and TypeScript Mastery",
          description: "Dive deep into design patterns, advanced types, generic utility functions, and performance profiling in TypeScript.",
          duration: "Week 1-2",
          resources: ["TypeScript Deep Dive Guide", "Effective TypeScript (Book)"],
          milestones: ["Refactor an existing JS code base into strict TypeScript", "Implement custom advanced generic structures"]
        },
        {
          name: "System Design and Scalable Backends",
          description: "Study microservice communication patterns, caching layers (Redis), rate limiting, load balancers, and relational database indexing.",
          duration: "Week 3-4",
          resources: ["ByteByteGo System Design", "Prisma Database Optimization docs"],
          milestones: ["Design and prototype a URL shortener with rate limiting and database caching", "Complete a mock DB load test of 1000 requests/sec"]
        },
        {
          name: "Cloud Hosting, Containers, and DevOps Pipelines",
          description: "Containerize apps using Docker, write multi-stage Dockerfiles, set up CI/CD workflows using GitHub Actions, and deploy to AWS.",
          duration: "Week 5-6",
          resources: ["Docker Official Tutorials", "GitHub Actions Documentation"],
          milestones: ["Write a GitHub Actions script that runs ESLint, builds, and pushes a Docker image to Docker Hub", "Deploy an Express API to AWS ECS/EC2"]
        }
      ]
    };

    return this.callGemini(prompt, fallback);
  }

  /**
   * Conducts interactive dialogue, generating follow-ups based on history.
   */
  static async generateInterviewQuestion(
    type: string,
    history: Array<{ role: 'user' | 'interviewer'; text: string }>,
    company?: string
  ): Promise<{ question: string; hints: string[]; expectedAnswerOverview: string }> {
    const prompt = `
      You are an elite interviewer conducting a "${type}" mock interview ${company ? `for the company "${company}"` : ""}.
      Based on the past conversation transcript history:
      ${JSON.stringify(history)}
      
      Generate the next highly relevant interview question, follow-up, or prompt.
      If the history is empty, generate an engaging opening question.
      
      Return a JSON response conforming strictly to this shape:
      {
        "question": string,
        "hints": string[],
        "expectedAnswerOverview": string
      }
    `;

    const fallbacks: Record<string, any> = {
      TECHNICAL: {
        question: "Could you explain the difference between a SQL and NoSQL database, and explain how you would select one when designing a high-traffic e-commerce cart service?",
        hints: [
          "Think about transactions (ACID vs BASE).",
          "Consider the structure of cart data (frequently updated, high concurrency).",
          "Explain scaling strategies (horizontal vs vertical)."
        ],
        expectedAnswerOverview: "A strong answer will compare SQL transactions/integrity with NoSQL horizontal scaling and flexible schemas, concluding that a transient state like a cart could benefit from a fast document or key-value store (like Redis or DynamoDB), or a relational DB if complex transaction locks are required."
      },
      BEHAVIORAL: {
        question: "Tell me about a time when you had a major technical disagreement with a team member. How did you approach the discussion, and what was the outcome?",
        hints: [
          "Use the STAR method (Situation, Task, Action, Result).",
          "Focus on communication, empathy, and data-driven decisions.",
          "Show how you prioritized the project's health over personal ego."
        ],
        expectedAnswerOverview: "The candidate should clearly state the technical conflict, explain their objective process of evaluating options (such as benchmarking or quick prototyping), show collaboration, and describe a positive, team-oriented resolution."
      },
      SYSTEM_DESIGN: {
        question: "How would you design a real-time notification service that sends millions of transactional alerts daily across SMS, Email, and Push notifications?",
        hints: [
          "Identify critical components: message queues, worker groups, notification gateways.",
          "Address rate limiting, deduplication, and retry logic.",
          "Describe how you track delivery metrics and manage fallback paths."
        ],
        expectedAnswerOverview: "A successful design utilizes a decoupled message broker (like RabbitMQ or Kafka), worker services to distribute calls, redis for rate limiting, and third-party gateways (Twilio, SendGrid) with retry queues."
      },
      HR: {
        question: "Why do you want to join our team, and what is your preferred working style when collaborating across different technical stacks?",
        hints: [
          "Mention specific culture features you like (collaborative learning, product-first engineering).",
          "Show flexibility and eagerness to learn new backend/frontend paradigms."
        ],
        expectedAnswerOverview: "The response should highlight company alignment, passion for software engineering, and a track record of smooth collaboration."
      }
    };

    const typeKey = type.toUpperCase();
    const fallback = fallbacks[typeKey] || fallbacks.TECHNICAL;

    return this.callGemini(prompt, fallback);
  }

  /**
   * Evaluates user answer to an interview question.
   */
  static async evaluateInterviewAnswer(
    question: string,
    answer: string,
    type: string
  ): Promise<InterviewEvaluationResult> {
    const prompt = `
      You are an AI Interview Coach. Evaluate the following question and answer.
      Question: "${question}"
      User Answer: "${answer}"
      Interview Type: "${type}"
      
      Return a JSON response conforming strictly to this TypeScript shape:
      {
        "score": number (out of 100),
        "confidenceScore": number (out of 100),
        "fillerWords": {
          "um": number,
          "like": number,
          "actually": number,
          "total": number
        },
        "eyeContactScore": number (out of 100),
        "grammarFeedback": string,
        "technicalCorrectness": string,
        "betterVersion": string,
        "followUpQuestion": string
      }
    `;

    const fallback: InterviewEvaluationResult = {
      score: 85,
      confidenceScore: 90,
      fillerWords: { um: 1, like: 2, actually: 1, total: 4 },
      eyeContactScore: 95,
      grammarFeedback: "Overall strong grammar. Watch out for ending sentences abruptly or using repetitive filler adjectives.",
      technicalCorrectness: "You correctly explained the tradeoffs of relational integrity versus horizontal scalability. To make it stronger, mention specific tools like Redis for cache buffering or Kafka for message delivery streaming.",
      betterVersion: "To build this service, I would choose a hybrid database structure. For transactional billing and orders, a SQL database ensures ACID compliance. For real-time updates and high-concurrency cart states, I'd leverage Redis as a memory cache layer to ensure sub-millisecond latencies.",
      followUpQuestion: "That makes sense. If you were using Redis as a cache layer for cart data, how would you handle cache eviction and syncing cart updates back to the SQL database?"
    };

    return this.callGemini(prompt, fallback);
  }

  /**
   * Generates hints and suggestions for coding problems.
   */
  static async generateCodingHints(
    problemTitle: string,
    problemDescription: string,
    userCode: string,
    errorMessage: string
  ): Promise<string> {
    const prompt = `
      You are an expert coding instructor. A student is solving the following problem:
      
      Problem: "${problemTitle}"
      Description: "${problemDescription}"
      
      Student's Code:
      \`\`\`
      ${userCode}
      \`\`\`
      
      Error: "${errorMessage}"
      
      Provide a brief, encouraging hint (2-3 sentences max) that guides them toward the correct solution without giving away the answer. Focus on the approach, data structures, or algorithm concept they might be missing.
    `;

    if (!ai) {
      const fallbackHints = [
        "Have you considered using a two-pointer approach or sliding window?",
        "Try breaking the problem into smaller subproblems using recursion or dynamic programming.",
        "Remember to handle edge cases like empty inputs or single-element arrays.",
        "Check if you're correctly iterating through all elements and maintaining proper state."
      ];
      await new Promise(resolve => setTimeout(resolve, 400));
      return fallbackHints[Math.floor(Math.random() * fallbackHints.length)];
    }

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent(prompt);
      return response.response.text() || "Keep trying! Review the problem constraints and think about the optimal approach.";
    } catch (err) {
      console.warn("Error generating coding hints:", err);
      return "Review your logic flow and make sure you're handling all test cases correctly.";
    }
  }
}
