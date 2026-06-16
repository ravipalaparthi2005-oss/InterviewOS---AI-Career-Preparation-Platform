# InterviewOS - AI Career Preparation Platform

InterviewOS is a full-stack AI career preparation platform for students, job seekers, mentors, recruiters, and admins. It helps candidates practice technical interviews, analyze resumes, build personalized roadmaps, and collaborate in real time.

## Features

- AI-powered mock interview practice
- Resume analysis and ATS-style improvement suggestions
- Personalized career roadmaps
- Coding practice and technical assessment flows
- Real-time WebRTC room support
- Collaborative coding, whiteboard, and chat features
- Role-based dashboards for students, mentors, recruiters, and admins

## Tech Stack

**Frontend**

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- React Query
- Socket.IO Client

**Backend**

- Node.js
- Express.js
- TypeScript
- Prisma
- SQLite
- Socket.IO
- JWT authentication
- Google Gemini AI integration

## Project Structure

```text
InterviewOS/
+-- backend/       # Express API, Prisma database, Socket.IO server
+-- frontend/      # Next.js app
+-- README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Environment Variables

Create environment files before running the app locally.

Frontend example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

Backend variables should include the required API keys and authentication secrets for local development.

## Resume Description

**InterviewOS - AI Career Preparation Platform**  
Built a full-stack AI career preparation platform using Next.js, React, Node.js, Express, Prisma, Socket.IO, and Gemini AI. The platform supports mock interviews, resume analysis, coding practice, role-based dashboards, real-time collaboration, and personalized career roadmaps.

## GitHub

Repository: https://github.com/ravipalaparthi2005-oss/InterviewOS---AI-Career-Preparation-Platform
