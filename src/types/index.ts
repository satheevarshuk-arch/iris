export type PersonalityStyle =
  | 'Friendly and Casual'
  | 'Funny and Playful'
  | 'Calm and Supportive'
  | 'Motivational'
  | 'Focused Study Partner'
  | 'Detailed Explainer';

export type AIMode = 'default' | 'neo' | 'override';

export type LearningMode =
  | 'Explain'
  | 'Deep Learning'
  | 'Step-by-Step'
  | 'Practice'
  | 'Revision'
  | 'Exam Preparation'
  | 'Socratic'
  | 'Doubt Clearing'
  | 'Teach Me'
  | 'Challenge';

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  board: 'CBSE' | 'ICSE' | 'State Board' | 'IB' | 'General / College';
  subjects: string[];
  favoriteSubject: string;
  difficultTopics: string[];
  learningGoals: string[];
  personalityStyle: PersonalityStyle;
  preferredLanguage: string;
  avatarSeed: string;
  memoryFacts: string[];
  streakDays: number;
  totalStudyMinutes: number;
  quizzesTaken: number;
  averageQuizScore: number;
  lastActiveDate: string;
}

export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  aiMode?: AIMode;
  attachments?: ChatAttachment[];
  isPinned?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
  learningMode?: LearningMode;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  dueDate?: string;
  estimatedMinutes?: number;
}

export interface StudyPlanItem {
  id: string;
  day: string;
  timeSlot: string;
  subject: string;
  topic: string;
  taskType: 'Theory' | 'Practice' | 'Revision' | 'Mock Test';
  completed: boolean;
}

export interface ExamCountdown {
  id: string;
  subject: string;
  examDate: string;
  totalChapters: number;
  completedChapters: number;
  targetScore: string;
  notes?: string;
}

export interface NoteDoc {
  id: string;
  title: string;
  subject: string;
  topic: string;
  content: string;
  createdAt: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface Flashcard {
  id: string | number;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'boolean' | 'fill';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizSession {
  id: string;
  title: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
  userAnswers?: Record<number, string>;
  score?: number;
  completedAt?: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  description?: string;
  children?: MindMapNode[];
}

export interface LibraryResource {
  id: string;
  title: string;
  category: 'Textbooks' | 'Notes' | 'PDFs' | 'Worksheets' | 'Formulas' | 'Saved AI' | 'Sample Papers';
  subject: string;
  description: string;
  content?: string;
  fileUrl?: string;
  dateAdded: string;
  isFavorite?: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}
