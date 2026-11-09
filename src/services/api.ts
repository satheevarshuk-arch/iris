import { AIMode, LearningMode, PersonalityStyle, StudentProfile } from '../types';

export interface ChatRequestPayload {
  messages: Array<{
    role: 'user' | 'model';
    content: string;
    attachments?: Array<{ mimeType: string; data: string; name: string }>;
  }>;
  studentProfile?: Partial<StudentProfile>;
  aiMode?: AIMode;
  thinkLonger?: boolean;
  learningMode?: LearningMode;
  personalityStyle?: PersonalityStyle;
  customOverride?: {
    detail?: string;
    format?: string;
    tone?: string;
    focus?: string;
  };
}

export async function sendChatMessage(payload: ChatRequestPayload): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return data.text;
  } catch (err: any) {
    console.error('API Error in sendChatMessage:', err);
    throw err;
  }
}

export async function generateNotesAPI(params: {
  topic: string;
  subject: string;
  grade?: string;
  noteType?: string;
}): Promise<string> {
  const res = await fetch('/api/tools/generate-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate notes');
  }
  const data = await res.json();
  return data.notes;
}

export async function generateQuizAPI(params: {
  topic: string;
  subject: string;
  difficulty?: string;
  count?: number;
  quizType?: string;
}): Promise<any> {
  const res = await fetch('/api/tools/quiz-maker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate quiz');
  }
  return await res.json();
}

export async function generateFlashcardsAPI(params: {
  topic: string;
  subject: string;
  count?: number;
}): Promise<any> {
  const res = await fetch('/api/tools/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate flashcards');
  }
  return await res.json();
}

export async function generateMindMapAPI(params: {
  topic: string;
  subject: string;
}): Promise<any> {
  const res = await fetch('/api/tools/mindmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate mind map');
  }
  return await res.json();
}

export async function generateQuestionPaperAPI(params: {
  subject: string;
  topic: string;
  board?: string;
  totalMarks?: number;
  duration?: string;
}): Promise<string> {
  const res = await fetch('/api/tools/question-paper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate question paper');
  }
  const data = await res.json();
  return data.questionPaper;
}

export async function codeTutorAPI(params: {
  code: string;
  language: string;
  action: 'explain' | 'debug' | 'optimize';
  userQuestion?: string;
}): Promise<string> {
  const res = await fetch('/api/tools/code-tutor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to analyze code');
  }
  const data = await res.json();
  return data.analysis;
}

export async function creativeLabAPI(params: {
  projectType: string;
  subject: string;
  topic: string;
  targetAudience?: string;
}): Promise<string> {
  const res = await fetch('/api/tools/creative-lab', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate creative blueprint');
  }
  const data = await res.json();
  return data.content;
}

export async function studyPlannerAPI(params: {
  subjects: string[];
  examDate: string;
  availableHoursPerDay: number;
  currentWeaknesses?: string;
}): Promise<string> {
  const res = await fetch('/api/tools/study-planner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate study plan');
  }
  const data = await res.json();
  return data.plan;
}

export async function dailyCheckinAPI(params: {
  mood: string;
  todayGoal: string;
  studentName: string;
}): Promise<string> {
  const res = await fetch('/api/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch check-in');
  }
  const data = await res.json();
  return data.message;
}
