import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Initialize Google GenAI client server-side with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'I.R.I.S. Core Engine',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Main Chat & Companion Endpoint
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const {
        messages,
        studentProfile,
        aiMode = 'default', // 'default' | 'neo' | 'override'
        thinkLonger = false,
        learningMode = 'Explain',
        personalityStyle = 'Friendly and Casual',
        customOverride = {},
      } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in server environment.',
        });
      }

      // Build system instruction tailored to student profile and active personality
      const studentName = studentProfile?.name || 'Friend';
      const studentGrade = studentProfile?.grade || 'High School / General';
      const studentSubjects = studentProfile?.subjects?.join(', ') || 'General Sciences, Math, Humanities';
      const favoriteSubject = studentProfile?.favoriteSubject || 'Science';
      const difficultTopics = studentProfile?.difficultTopics?.join(', ') || 'None specified';
      const memoryFacts = studentProfile?.memoryFacts?.join('; ') || 'Eager learner';

      let systemInstruction = `You are I.R.I.S. (Intelligent Research, Innovation and Study) — the ultimate AI study best friend, personal tutor, and learning partner for ${studentName}.
Tagline: "Your Friend. Your Guide. Your Learning Partner."
Current student profile:
- Grade/Class: ${studentGrade}
- Subjects: ${studentSubjects}
- Favorite Subject: ${favoriteSubject}
- Areas student finds challenging: ${difficultTopics}
- Known memory & preferences: ${memoryFacts}

PERSONALITY DIRECTIVES:
- Warm, cheerful, genuinely supportive, intelligent, curious, patient, and non-judgmental.
- Talk naturally like a brilliant, encouraging study best friend. Avoid stiff robotic jargon, repetitive canned greetings, and generic platitudes.
- Never shame, pressure, or guilt-trip the student. When they are tired or overwhelmed, validate their feelings and offer bite-sized, fun steps.
- Celebrate their milestones and small wins enthusiastically.
- You can talk about school, studies, hobbies, technology, science, day organization, and casual life topics.
- When explaining academic topics, use intuitive real-world analogies, step-by-step clarity, markdown formatting, formulas (LaTeX or clean readable notation), and quick check-for-understanding questions when helpful.`;

      // Personality style customization
      if (personalityStyle === 'Funny and Playful') {
        systemInstruction += `\nTone: Use witty, lighthearted humor, playful analogies, and enthusiastic high-energy banter where suitable.`;
      } else if (personalityStyle === 'Calm and Supportive') {
        systemInstruction += `\nTone: Gentle, grounding, reassuring, mindful, and unhurried. Keep anxiety low.`;
      } else if (personalityStyle === 'Motivational') {
        systemInstruction += `\nTone: Inspiring, ambitious, empowering, and focused on growth mindset and achieving their dreams.`;
      } else if (personalityStyle === 'Focused Study Partner') {
        systemInstruction += `\nTone: Direct, focused, efficient, keeping distractions low while staying supportive.`;
      } else if (personalityStyle === 'Detailed Explainer') {
        systemInstruction += `\nTone: Thorough, analytical, foundational, building up from first principles with rich depth.`;
      }

      // Mode-specific instructions
      if (aiMode === 'neo') {
        systemInstruction += `\n\n[MODE: I.R.I.S. NEO — ADVANCED REASONING ACTIVATED]
Provide deeper multi-perspective analysis, rigorous step-by-step proofs/derivations, edge-case breakdowns, and comprehensive academic depth. Show the clear rationale behind each step.`;
      } else if (aiMode === 'override') {
        systemInstruction += `\n\n[MODE: I.R.I.S. CUSTOM OVERRIDE]
User configured overrides:
- Detail level: ${customOverride.detail || 'High'}
- Format: ${customOverride.format || 'Bullet points & Clear sections'}
- Tone: ${customOverride.tone || 'Precision Tutor'}
- Focus: ${customOverride.focus || 'Deep Conceptual Clarity'}`;
      }

      // Learning mode specific instructions
      if (learningMode) {
        systemInstruction += `\nActive Learning Mode: ${learningMode}.
- If Socratic: Ask guiding questions to help the student deduce the answers themselves.
- If Step-by-Step: Number each logical phase clearly.
- If Practice: Provide interactive practice questions with immediate feedback.
- If Revision: Give high-yield bulleted cheat-sheet style notes and mnemonics.
- If Exam Prep: Focus on marks distribution, high-probability exam questions, and sample model answers.`;
      }

      // Prepare contents history
      const formattedContents: any[] = [];

      if (Array.isArray(messages)) {
        for (const msg of messages) {
          const role = msg.role === 'user' ? 'user' : 'model';
          const parts: any[] = [{ text: msg.content || '' }];

          if (msg.attachments && Array.isArray(msg.attachments)) {
            for (const att of msg.attachments) {
              if (att.data && att.mimeType) {
                parts.unshift({
                  inlineData: {
                    mimeType: att.mimeType,
                    data: att.data, // base64
                  },
                });
              }
            }
          }
          formattedContents.push({ role, parts });
        }
      }

      const config: any = {
        systemInstruction,
      };

      if (thinkLonger || aiMode === 'neo') {
        config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config,
      });

      const replyText = response.text || "I'm right here with you! Let's tackle this together.";

      return res.json({
        text: replyText,
        aiMode,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Chat API Error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate response from I.R.I.S. engine.',
      });
    }
  });

  // Dedicated AI Notes Generator Endpoint
  app.post('/api/tools/generate-notes', async (req: Request, res: Response) => {
    try {
      const { topic, subject, grade, noteType = 'comprehensive' } = req.body;
      const prompt = `Generate high quality, beautiful educational notes for the subject "${subject || 'General'}", Topic: "${topic}", Grade: "${grade || 'Student level'}".
Note Style: ${noteType} (e.g. detailed, short revision, exam-oriented).

Format response cleanly in Markdown with:
# Title & Overview
## Core Concepts & Intuitive Explanations
## Key Definitions & Terminology
## Important Formulas & Theorems (with variable definitions)
## Real-World Examples & Analogies
## Step-by-Step Problem Solving Method
## Common Pitfalls & Exam Traps
## 5 High-Yield Review Points (Memorization Booster)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an award-winning master textbook author and pedagogue for students.',
        },
      });

      return res.json({ notes: response.text });
    } catch (error: any) {
      console.error('Notes API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated AI Quiz Maker Endpoint
  app.post('/api/tools/quiz-maker', async (req: Request, res: Response) => {
    try {
      const { topic, subject, difficulty = 'Medium', count = 5, quizType = 'mixed' } = req.body;
      const prompt = `Create a ${difficulty} difficulty quiz on "${topic}" (Subject: ${subject}) with ${count} questions.
Quiz type: ${quizType} (MCQ, True/False, Fill in blanks, or Mixed).

Return a valid JSON object ONLY, adhering to this structure:
{
  "title": "Quiz Title",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text matching the correct option or answer",
      "explanation": "Friendly, crystal clear explanation why this is correct."
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an expert educational assessment creator. Output valid JSON only.',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Quiz API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated AI Flashcards Generator Endpoint
  app.post('/api/tools/flashcards', async (req: Request, res: Response) => {
    try {
      const { topic, subject, count = 8 } = req.body;
      const prompt = `Generate ${count} high-retention flashcards for topic: "${topic}" (Subject: ${subject}).
Return a valid JSON object ONLY:
{
  "deckTitle": "${topic} Flashcards",
  "cards": [
    {
      "id": 1,
      "front": "Prompt / Question / Term",
      "back": "Concise, memorable answer / Definition / Formula",
      "hint": "Optional quick memory hook or mnemonic",
      "category": "Key Concept"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a spaced-repetition and memory science expert. Output valid JSON only.',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Flashcards API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated AI Mind Map Generator Endpoint
  app.post('/api/tools/mindmap', async (req: Request, res: Response) => {
    try {
      const { topic, subject } = req.body;
      const prompt = `Create a structured hierarchical concept mind map for topic: "${topic}" in "${subject}".
Return a valid JSON object ONLY with the following schema:
{
  "title": "${topic}",
  "nodes": [
    {
      "id": "root",
      "label": "${topic}",
      "description": "Central Theme",
      "children": [
        {
          "id": "branch-1",
          "label": "Key Concept 1",
          "description": "Fundamental core",
          "children": [
            {
              "id": "leaf-1-1",
              "label": "Application / Detail",
              "description": "Real-world connection"
            }
          ]
        },
        {
          "id": "branch-2",
          "label": "Key Concept 2",
          "description": "Underlying mechanism",
          "children": [
            {
              "id": "leaf-2-1",
              "label": "Formulas & Rules",
              "description": "Governing principles"
            }
          ]
        }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an educational visual information architect. Output valid JSON only.',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error: any) {
      console.error('Mindmap API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated AI Question Paper & Mock Test Generator
  app.post('/api/tools/question-paper', async (req: Request, res: Response) => {
    try {
      const { subject, topic, board = 'CBSE / ICSE Standard', totalMarks = 50, duration = '90 mins' } = req.body;
      const prompt = `Create a formal academic mock question paper for "${subject}" on topic "${topic}".
Board/Curriculum Standard: ${board}
Total Marks: ${totalMarks}
Duration: ${duration}

Include:
- General Instructions
- Section A: Objective Questions / 1 Mark each
- Section B: Short Answer Questions / 2-3 Marks each
- Section C: Long Answer / Analytical / Problem Solving / 5 Marks each
- Complete Step-by-Step Marking Scheme & Answer Key at the end.
Format cleanly with Markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a senior board examiner creating balanced, fair, rigorous question papers.',
        },
      });

      return res.json({ questionPaper: response.text });
    } catch (error: any) {
      console.error('Question Paper API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated Coding Lab Assistant Endpoint
  app.post('/api/tools/code-tutor', async (req: Request, res: Response) => {
    try {
      const { code, language, action = 'explain', userQuestion = '' } = req.body;
      const prompt = `Analyze this ${language} code:
\`\`\`${language}
${code}
\`\`\`

Action requested: ${action} (${action === 'debug' ? 'Find bugs, performance issues, and fix them' : action === 'explain' ? 'Explain line-by-line concept and logic' : 'Provide optimization and modern idiomatic practices'}).
Additional student question: ${userQuestion || 'None'}

Provide:
1. Executive Summary
2. Line-by-Line / Logical Breakdown
3. Corrected / Improved Code block
4. Key Takeaways for computer science tests and interviews`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an exceptional computer science mentor and software engineer.',
        },
      });

      return res.json({ analysis: response.text });
    } catch (error: any) {
      console.error('Code tutor API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated Creative Lab Generator (Posters, Scripts, Project Blueprints)
  app.post('/api/tools/creative-lab', async (req: Request, res: Response) => {
    try {
      const { projectType, subject, topic, targetAudience = 'Class presentation' } = req.body;
      const prompt = `Create a ${projectType} for topic "${topic}" (Subject: ${subject}).
Target: ${targetAudience}

Generate a complete, ready-to-use creative blueprint including:
- Catchy Title & Theme
- Visual layout or slide-by-slide script
- Engaging talking points
- Scientific / historical accuracy check
- Fun facts to captivate the audience`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a creative educational director and STEM communication specialist.',
        },
      });

      return res.json({ content: response.text });
    } catch (error: any) {
      console.error('Creative Lab API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Dedicated AI Smart Study Planner Generator
  app.post('/api/tools/study-planner', async (req: Request, res: Response) => {
    try {
      const { subjects, examDate, availableHoursPerDay, currentWeaknesses } = req.body;
      const prompt = `Create an intelligent, realistic, fatigue-resistant study timetable and milestone roadmap.
Subjects: ${JSON.stringify(subjects)}
Exam/Target Date: ${examDate}
Available Study Time: ${availableHoursPerDay} hours/day
Challenging areas: ${currentWeaknesses || 'General'}

Provide:
1. Daily schedule block breakdown with Pomodoro intervals
2. Spaced revision schedule
3. Buffer recovery times for relaxation and rest
4. Daily mini-goals and milestones`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert cognitive learning scientist and academic productivity coach.',
        },
      });

      return res.json({ plan: response.text });
    } catch (error: any) {
      console.error('Study planner API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // Daily Friend Check-in & Motivation
  app.post('/api/checkin', async (req: Request, res: Response) => {
    try {
      const { mood, todayGoal, studentName } = req.body;
      const prompt = `The student ${studentName || 'friend'} is checking in for the day.
Mood/Feeling: "${mood || 'Okay'}"
Today's Study Goal: "${todayGoal || 'Make some progress'}"

Give a short (3-4 sentences), incredibly warm, uplifting, personalized friend response from I.R.I.S.
Sound like a caring, funny, real friend. Include one bite-sized tip for their goal and a positive cheer. No generic clichés!`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are I.R.I.S., the ultimate AI best friend. Warm, authentic, cheerful, uplifting.',
        },
      });

      return res.json({ message: response.text });
    } catch (error: any) {
      console.error('Checkin API error:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // In development, mount Vite middleware; in production, serve built dist files
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`I.R.I.S. server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start I.R.I.S. server:', err);
});
