import prisma from './services/db';
import * as bcrypt from 'bcryptjs';

const SAMPLE_PROBLEMS = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target. You may assume that each input has exactly one solution, and you may not use the same element twice.',
    difficulty: 'EASY',
    category: 'Arrays',
    constraints: JSON.stringify([
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ]),
    examples: JSON.stringify([
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ]),
    testCases: JSON.stringify([
      { input: '2 7 11 15 9', expectedOutput: '0 1' },
      { input: '3 2 4 6', expectedOutput: '1 2' },
      { input: '3 3 6', expectedOutput: '0 1' },
      { input: '-1 0 1 2 -1 -4', expectedOutput: '0 1' },
      { input: '2 5 5 11 9', expectedOutput: '0 4' }
    ]),
    sampleSolution: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tags: 'hash-map,array,two-pointer'
  },
  {
    title: 'Balanced Binary Search Tree',
    description: 'Given the root of a binary search tree, return a balanced binary search tree with the same node values. A binary search tree is balanced if the depth of the two subtrees of every node never differs by more than 1.',
    difficulty: 'MEDIUM',
    category: 'Trees',
    constraints: JSON.stringify([
      '1 <= nodes <= 10^4',
      '1 <= node.val <= 10^5'
    ]),
    examples: JSON.stringify([
      { input: 'root = [1,null,2,null,3,null,4]', output: '[2,1,3,null,null,null,4]' },
      { input: 'root = [2,1,3]', output: '[2,1,3]' }
    ]),
    testCases: JSON.stringify([
      { input: '1 null 2 null 3 null 4', expectedOutput: '2 1 3 null null null 4' },
      { input: '2 1 3', expectedOutput: '2 1 3' }
    ]),
    sampleSolution: `function balanceBST(root: TreeNode | null): TreeNode | null {
  const nodes: TreeNode[] = [];
  inorder(root, nodes);
  return build(nodes, 0, nodes.length - 1);
}

function inorder(node: TreeNode | null, nodes: TreeNode[]) {
  if (!node) return;
  inorder(node.left, nodes);
  nodes.push(node);
  inorder(node.right, nodes);
}

function build(nodes: TreeNode[], start: number, end: number): TreeNode | null {
  if (start > end) return null;
  const mid = Math.floor((start + end) / 2);
  const node = nodes[mid];
  node.left = build(nodes, start, mid - 1);
  node.right = build(nodes, mid + 1, end);
  return node;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    tags: 'binary-search-tree,dfs,recursion'
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'MEDIUM',
    category: 'Strings',
    constraints: JSON.stringify([
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ]),
    examples: JSON.stringify([
      { input: 's = "abcabcbb"', output: '3' },
      { input: 's = "bbbbb"', output: '1' },
      { input: 's = "pwwkew"', output: '3' }
    ]),
    testCases: JSON.stringify([
      { input: 'abcabcbb', expectedOutput: '3' },
      { input: 'bbbbb', expectedOutput: '1' },
      { input: 'pwwkew', expectedOutput: '3' },
      { input: '', expectedOutput: '0' },
      { input: 'au', expectedOutput: '2' },
      { input: 'dvdf', expectedOutput: '3' }
    ]),
    sampleSolution: `function lengthOfLongestSubstring(s: string): number {
  const charIndex = new Map<string, number>();
  let maxLength = 0;
  let start = 0;
  
  for (let i = 0; i < s.length; i++) {
    if (charIndex.has(s[i])) {
      start = Math.max(start, charIndex.get(s[i])! + 1);
    }
    charIndex.set(s[i], i);
    maxLength = Math.max(maxLength, i - start + 1);
  }
  
  return maxLength;
}`,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(min(m, n))',
    tags: 'sliding-window,hash-map,string'
  },
  {
    title: 'Merge K Sorted Lists',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    difficulty: 'HARD',
    category: 'Linked Lists',
    constraints: JSON.stringify([
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4'
    ]),
    examples: JSON.stringify([
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,1,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' }
    ]),
    testCases: JSON.stringify([
      { input: '1 4 5 1 3 4 2 6', expectedOutput: '1 1 2 1 3 4 4 5 6' },
      { input: '', expectedOutput: '' }
    ]),
    sampleSolution: `function mergeKLists(lists: (ListNode | null)[]): ListNode | null {
  if (!lists || lists.length === 0) return null;
  return mergeHelper(lists, 0, lists.length - 1);
}

function mergeHelper(lists: (ListNode | null)[], left: number, right: number): ListNode | null {
  if (left === right) return lists[left];
  if (left > right) return null;
  const mid = Math.floor((left + right) / 2);
  return mergeTwoLists(mergeHelper(lists, left, mid), mergeHelper(lists, mid + 1, right));
}

function mergeTwoLists(l1: ListNode | null, l2: ListNode | null): ListNode | null {
  const dummy = new ListNode(0);
  let current = dummy;
  while (l1 && l2) {
    if (l1.val < l2.val) {
      current.next = l1;
      l1 = l1.next;
    } else {
      current.next = l2;
      l2 = l2.next;
    }
    current = current.next;
  }
  current.next = l1 || l2;
  return dummy.next;
}`,
    timeComplexity: 'O(n log k)',
    spaceComplexity: 'O(log k)',
    tags: 'linked-list,merge,divide-and-conquer'
  }
];

async function main() {
  console.log('Clearing database tables...');
  await prisma.systemAnalytics.deleteMany({});
  await prisma.portfolio.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.mockInterview.deleteMany({});
  await prisma.jobMatch.deleteMany({});
  await prisma.codeSubmission.deleteMany({});
  await prisma.resume.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.codingProblem.deleteMany({});

  console.log('Seeding roles and users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // Student User
  const student = await prisma.user.create({
    data: {
      name: 'Ravi Kumar',
      email: 'student@interviewos.com',
      password: passwordHash,
      role: 'STUDENT'
    }
  });

  // Recruiter User
  const recruiter = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'recruiter@interviewos.com',
      password: passwordHash,
      role: 'RECRUITER'
    }
  });

  // Admin User
  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'admin@interviewos.com',
      password: passwordHash,
      role: 'ADMIN'
    }
  });

  // Additional Candidates for Recruiter Dashboard list
  const student2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: passwordHash,
      role: 'STUDENT',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  const student3 = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david@example.com',
      password: passwordHash,
      role: 'STUDENT',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('Seeding resumes...');
  const resume1 = await prisma.resume.create({
    data: {
      userId: student.id,
      filename: 'Ravi_Kumar_FullStack.pdf',
      atsScore: 84,
      skills: 'React,TypeScript,Node.js,Express,REST APIs,Git,CSS,HTML5',
      missingKeywords: 'Docker,Kubernetes,Next.js,CI/CD Pipelines,System Design,AWS S3',
      feedback: JSON.stringify({
        summary: "The resume shows strong foundational frontend and backend skills. However, to compete for high-level full-stack engineer positions, it lacks devops tooling (Docker, CI/CD) and cloud experience (AWS).",
        improvements: [
          { original: "Responsible for writing backend APIs in Node.js.", improved: "Architected and deployed 15+ highly responsive Node.js REST endpoints, reducing API response latency by 25%.", reason: "Uses action verbs and provides measurable, quantitative results." },
          { original: "Helped build a React dashboard web app.", improved: "Engineered a responsive React dashboard utilizing context-based state management, improving load times by 1.2s.", reason: "Specifies technologies used and highlights optimization accomplishments." }
        ],
        skillGaps: [
          { skill: "Docker", status: "missing", recommendation: "Deploy a Node.js project using a multi-stage Dockerfile." },
          { skill: "AWS S3/EC2", status: "basic", recommendation: "Learn AWS basics and host a static site on S3 with CloudFront." },
          { skill: "Next.js", status: "basic", recommendation: "Rebuild a static landing page into Next.js App Router for server-side rendering benefits." }
        ]
      })
    }
  });

  const resume2 = await prisma.resume.create({
    data: {
      userId: student2.id,
      filename: 'Priya_S_Resume_V2.pdf',
      atsScore: 92,
      skills: 'Python,Django,PostgreSQL,AWS,React,Docker,CI/CD,GraphQL',
      missingKeywords: 'Kubernetes,Redis,TypeScript',
      feedback: JSON.stringify({
        summary: "Excellent technical alignment. Highly qualified with containers and cloud backend implementations.",
        improvements: [],
        skillGaps: []
      })
    }
  });

  const resume3 = await prisma.resume.create({
    data: {
      userId: student3.id,
      filename: 'David_Chen_Resume.pdf',
      atsScore: 71,
      skills: 'HTML,CSS,JavaScript,JQuery,Bootstrap',
      missingKeywords: 'React,TypeScript,Node.js,REST APIs,Git',
      feedback: JSON.stringify({
        summary: "Needs substantial modernization. Skills are centered around older web technologies. Recommend learning TypeScript and React.",
        improvements: [],
        skillGaps: []
      })
    }
  });

  console.log('Seeding job matches...');
  await prisma.jobMatch.create({
    data: {
      resumeId: resume1.id,
      jobTitle: 'Senior Full Stack Engineer',
      jobDescription: 'Seeking a full-stack generalist with Docker and AWS experience to build Next.js applications.',
      matchScore: 78,
      readinessScore: 82,
      feedback: JSON.stringify({
        summary: "The candidate's core stack is a 90% match, but missing Docker/AWS container deploy pipeline blocks the final approval.",
        improvements: [],
        skillGaps: [
          { skill: "Docker", status: "missing", recommendation: "Add Docker container configuration to your web applications." }
        ]
      })
    }
  });

  console.log('Seeding mock interviews...');
  await prisma.mockInterview.create({
    data: {
      userId: student.id,
      type: 'TECHNICAL',
      status: 'COMPLETED',
      score: 86,
      duration: 1200,
      companySpecific: 'Google',
      transcript: JSON.stringify([
        { role: 'interviewer', text: 'Explain the difference between a SQL and NoSQL database.' },
        { role: 'user', text: 'SQL databases are relational databases that use tables and schemas, while NoSQL databases are non-relational and store data in documents or key-value format. SQL is good for complex transactions, and NoSQL is better for scale.' },
        { role: 'interviewer', text: 'How do you handle scaling in a SQL database?' },
        { role: 'user', text: 'You can scale SQL databases vertically by buying a larger machine, or horizontally through read replicas, database sharding, or federation.' }
      ]),
      feedback: JSON.stringify({
        overallSummary: "Excellent communication skills with strong conceptual understanding. Focus on structured design diagrams during architecture calls.",
        behavioralRating: 88,
        technicalRating: 84,
        fillerWordsFails: ["like"],
        simulatedVideoMetrics: {
          eyeContactPercentage: 92,
          postureStability: "Stable",
          smileCount: 4,
          confidenceIndex: 87
        }
      })
    }
  });

  await prisma.mockInterview.create({
    data: {
      userId: student.id,
      type: 'BEHAVIORAL',
      status: 'COMPLETED',
      score: 91,
      duration: 900,
      companySpecific: 'Stripe',
      transcript: JSON.stringify([
        { role: 'interviewer', text: 'Tell me about a time you had a technical disagreement.' },
        { role: 'user', text: 'I disagreed with a coworker about using MongoDB versus PostgreSQL. I resolved it by setting up a benchmark script that simulated our actual query workload, and PostgreSQL performed much better, so we chose it.' }
      ]),
      feedback: JSON.stringify({
        overallSummary: "Impressive application of the STAR framework. Clear presentation of factual testing to resolve team friction.",
        behavioralRating: 95,
        technicalRating: 88,
        fillerWordsFails: [],
        simulatedVideoMetrics: {
          eyeContactPercentage: 94,
          postureStability: "Stable",
          smileCount: 6,
          confidenceIndex: 93
        }
      })
    }
  });

  // Seed mock interviews for other users so recruiter dashboard has list values
  await prisma.mockInterview.create({
    data: {
      userId: student2.id,
      type: 'TECHNICAL',
      status: 'COMPLETED',
      score: 93,
      duration: 1500,
      companySpecific: 'Netflix',
      transcript: JSON.stringify([]),
      feedback: JSON.stringify({
        overallSummary: "Flawless coding interview performance. Candidate optimized space and time complexity effortlessly.",
        behavioralRating: 90,
        technicalRating: 96
      })
    }
  });

  console.log('Seeding career roadmaps...');
  await prisma.roadmap.create({
    data: {
      userId: student.id,
      title: 'Accelerated Path to Senior Full Stack Engineer',
      targetJob: 'Senior Full Stack Engineer',
      currentStep: 1,
      steps: JSON.stringify([
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
      ])
    }
  });

  console.log('Seeding system analytics...');
  const analyticsData = [
    { metric: 'AI_TOKEN_USAGE', value: 450, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
    { metric: 'AI_TOKEN_USAGE', value: 680, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    { metric: 'AI_TOKEN_USAGE', value: 540, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { metric: 'AI_TOKEN_USAGE', value: 980, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    { metric: 'AI_TOKEN_USAGE', value: 1200, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { metric: 'AI_TOKEN_USAGE', value: 850, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { metric: 'AI_TOKEN_USAGE', value: 1500, timestamp: new Date() }
  ];

  for (const log of analyticsData) {
    await prisma.systemAnalytics.create({ data: log });
  }

  console.log('🌱 Seeding database with coding problems...');
  for (const problem of SAMPLE_PROBLEMS) {
    await prisma.codingProblem.create({
      data: problem
    });
    console.log(`✅ Created problem: ${problem.title}`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  });
