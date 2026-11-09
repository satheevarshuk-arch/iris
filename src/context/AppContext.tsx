import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  ChatSession,
  ChatMessage,
  NoteDoc,
  FlashcardDeck,
  StudyTask,
  StudyPlanItem,
  ExamCountdown,
  LibraryResource,
  AchievementBadge,
  PersonalityStyle,
} from '../types';
import {
  supabase,
  signOut,
  fetchProfileFromDB,
  updateProfileInDB,
  fetchMemoriesFromDB,
  insertMemoryToDB,
  deleteMemoryFromDB,
  fetchNotesFromDB,
  insertNoteToDB,
  deleteNoteFromDB,
  fetchTasksFromDB,
  insertTaskToDB,
  updateTaskStatusInDB,
  deleteTaskFromDB,
  deleteUserAccount,
  isSupabaseConfigured,
} from '../services/supabase';

interface AppContextType {
  // Authentication & Session (Part 21.1 & 21.2)
  authUser: any | null;
  isAuthenticated: boolean;
  logoutUser: () => Promise<void>;
  deleteStudentAccount: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;

  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  addMemoryFact: (fact: string) => void;
  removeMemoryFact: (fact: string) => void;
  clearAllMemories: () => void;

  // Chat
  chatSessions: ChatSession[];
  activeSessionId: string;
  setActiveSessionId: (id: string) => void;
  createNewChat: (title?: string) => string;
  addMessageToActiveChat: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newTitle: string) => void;
  pinChat: (id: string) => void;

  // Notes
  notes: NoteDoc[];
  addNote: (note: Omit<NoteDoc, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;

  // Flashcards
  flashcardDecks: FlashcardDeck[];
  addFlashcardDeck: (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => void;
  deleteFlashcardDeck: (id: string) => void;
  toggleCardMastered: (deckId: string, cardId: string | number) => void;

  // Tasks
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  // Study Plan
  studyPlan: StudyPlanItem[];
  setStudyPlan: React.Dispatch<React.SetStateAction<StudyPlanItem[]>>;
  togglePlanItem: (id: string) => void;

  // Exams
  exams: ExamCountdown[];
  addExam: (exam: Omit<ExamCountdown, 'id'>) => void;
  updateExamChapters: (id: string, completed: number) => void;
  deleteExam: (id: string) => void;

  // Library
  library: LibraryResource[];
  addLibraryItem: (item: Omit<LibraryResource, 'id' | 'dateAdded'>) => void;
  deleteLibraryItem: (id: string) => void;
  toggleFavoriteLibraryItem: (id: string) => void;

  // Achievements
  achievements: AchievementBadge[];
  checkAndAwardAchievement: (badgeId: string) => void;

  // Study Together Session
  activeStudySession: {
    isActive: boolean;
    subject: string;
    topic: string;
    goal: string;
    timeRemaining: number;
    initialTime: number;
    isPaused: boolean;
  };
  startStudySession: (subject: string, topic: string, goal: string, minutes: number) => void;
  pauseStudySession: () => void;
  resumeStudySession: () => void;
  endStudySession: (completedNaturally?: boolean) => void;

  // Helpers
  triggerCelebration: () => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const STORAGE_KEY_PREFIX = 'iris_learning_';

const initialProfile: StudentProfile = {
  id: 'student_1',
  name: 'Alex',
  grade: 'Class 11 / Grade 11',
  board: 'CBSE',
  subjects: ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'English'],
  favoriteSubject: 'Physics',
  difficultTopics: ['Rotational Mechanics', 'Chemical Kinetics', 'Integration'],
  learningGoals: ['Score 95%+ in upcoming midterms', 'Master Python Data Structures', 'Build consistent 2-hour daily study habit'],
  personalityStyle: 'Friendly and Casual',
  preferredLanguage: 'English',
  avatarSeed: 'alex_companion',
  memoryFacts: [
    'Prepares best with intuitive visual analogies before diving into formulas',
    'Aspirations: Computer Science & Aerospace Engineering',
    'Midterm examinations approach in 3 weeks',
    'Enjoys learning with 25-minute Pomodoro sprints and quick doubt clearing',
    'Has mastered Kinematics, Newton’s Laws, and Python basics',
  ],
  streakDays: 8,
  totalStudyMinutes: 380,
  quizzesTaken: 9,
  averageQuizScore: 92,
  lastActiveDate: new Date().toISOString(),
};

const defaultNotes: NoteDoc[] = [
  {
    id: 'note_1',
    title: 'Rotational Dynamics & Torque Formula Sheet',
    subject: 'Physics',
    topic: 'Rotational Motion',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isFavorite: true,
    tags: ['Physics', 'Mechanics', 'Formulas'],
    content: `# Rotational Dynamics & Torque Quick Guide

## Core Intuition
Rotational motion is the angular equivalent of linear mechanics:
- **Mass ($m$)** $\\rightarrow$ **Moment of Inertia ($I$)**: Resistance to rotational acceleration.
- **Force ($F$)** $\\rightarrow$ **Torque ($\\tau$)**: Rotational twist caused by force at a lever arm.
- **Linear Momentum ($p = mv$)** $\\rightarrow$ **Angular Momentum ($L = I\\omega$)**.

## Key Equations
1. $\\tau = r \\times F = r F \\sin(\\theta)$
2. $\\tau_{net} = I \\alpha$ (Newton's 2nd Law for Rotation)
3. Rotational Kinetic Energy: $K_{rot} = \\frac{1}{2} I \\omega^2$
4. Total KE of a rolling sphere without slipping: $K_{total} = \\frac{1}{2}mv^2 + \\frac{1}{2}I\\omega^2 = \\frac{7}{10}mv^2$

## Common Exam Pitfall
Always ensure the lever arm distance $r$ is measured perpendicular to the line of action of the force!`,
  },
  {
    id: 'note_2',
    title: 'Photosynthesis & Electron Transport Summary',
    subject: 'Biology / Science',
    topic: 'Cellular Bioenergetics',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isFavorite: false,
    tags: ['Biology', 'Cells'],
    content: `# Light Reactions & Calvin Cycle Essentials

## 1. Light-Dependent Reactions (Thylakoid Membrane)
- Photolysis of water releases $O_2$, protons, and electrons: $2H_2O \\rightarrow 4H^+ + 4e^- + O_2$.
- Light excitation in Photosystem II (P680) and Photosystem I (P700).
- ATP synthesis via Chemiosmosis across ATP synthase.
- NADPH generated as reducing power.

## 2. Light-Independent Reactions (Calvin Cycle in Stroma)
- **Carbon Fixation**: Enzyme RuBisCO fixes $CO_2$ with RuBP to form 3-PGA.
- **Reduction**: 3-PGA reduced to G3P using ATP and NADPH.
- **Regeneration**: RuBP is regenerated for the cycle to continue.`,
  },
];

const defaultFlashcards: FlashcardDeck[] = [
  {
    id: 'deck_1',
    title: 'High-Yield Physics Laws & Constants',
    subject: 'Physics',
    topic: 'Fundamental Constants & Principles',
    createdAt: new Date().toISOString(),
    cards: [
      {
        id: 1,
        front: "State Newton's First Law of Motion",
        back: 'An object remains at rest or in uniform motion unless acted upon by a net external force (Law of Inertia).',
        hint: 'Think inertia',
        category: 'Laws',
        mastered: true,
      },
      {
        id: 2,
        front: "What is the formula for Torque in terms of Moment of Inertia?",
        back: 'τ = I × α (Torque = Moment of Inertia multiplied by Angular Acceleration).',
        hint: 'Analogous to F = ma',
        category: 'Rotational Mechanics',
        mastered: false,
      },
      {
        id: 3,
        front: "Define Escape Velocity on Earth's surface",
        back: 'v_e = √(2GM/R) ≈ 11.2 km/s. The minimum speed needed for an object to break free from gravitational attraction.',
        hint: 'Sqrt of 2GM/R',
        category: 'Gravitation',
        mastered: true,
      },
      {
        id: 4,
        front: "What is Lenz's Law of Electromagnetic Induction?",
        back: 'The direction of an induced electromotive force (EMF) always opposes the change in magnetic flux that produced it.',
        hint: 'Conservation of energy opposing change',
        category: 'Electromagnetism',
        mastered: false,
      },
    ],
  },
];

const defaultTasks: StudyTask[] = [
  {
    id: 't_1',
    title: 'Solve 10 numerical problems on Rotational Inertia',
    subject: 'Physics',
    priority: 'high',
    completed: true,
    estimatedMinutes: 45,
  },
  {
    id: 't_2',
    title: 'Review Organic Reaction mechanisms (SN1 vs SN2)',
    subject: 'Chemistry',
    priority: 'high',
    completed: false,
    estimatedMinutes: 30,
  },
  {
    id: 't_3',
    title: 'Write Python recursion exercise & binary search tree demo',
    subject: 'Computer Science',
    priority: 'medium',
    completed: false,
    estimatedMinutes: 40,
  },
  {
    id: 't_4',
    title: 'Complete Quiz on Trigonometric Identities with I.R.I.S.',
    subject: 'Mathematics',
    priority: 'medium',
    completed: false,
    estimatedMinutes: 20,
  },
];

const defaultStudyPlan: StudyPlanItem[] = [
  { id: 'sp_1', day: 'Monday', timeSlot: '05:00 PM - 06:00 PM', subject: 'Physics', topic: 'Center of Mass & Rigid Bodies', taskType: 'Practice', completed: true },
  { id: 'sp_2', day: 'Monday', timeSlot: '06:15 PM - 07:15 PM', subject: 'Chemistry', topic: 'Thermodynamics & Enthalpy', taskType: 'Theory', completed: true },
  { id: 'sp_3', day: 'Tuesday', timeSlot: '05:00 PM - 06:00 PM', subject: 'Mathematics', topic: 'Definite Integrals & Properties', taskType: 'Practice', completed: false },
  { id: 'sp_4', day: 'Tuesday', timeSlot: '06:15 PM - 07:15 PM', subject: 'Computer Science', topic: 'Object-Oriented Programming & Classes', taskType: 'Theory', completed: false },
  { id: 'sp_5', day: 'Wednesday', timeSlot: '05:00 PM - 06:30 PM', subject: 'Physics', topic: 'Full Mock Test: Mechanics', taskType: 'Mock Test', completed: false },
];

const defaultExams: ExamCountdown[] = [
  {
    id: 'ex_1',
    subject: 'Physics Midterm Examination',
    examDate: new Date(Date.now() + 86400000 * 18).toISOString().split('T')[0],
    totalChapters: 8,
    completedChapters: 6,
    targetScore: '96%',
    notes: 'Focus on Rotational Motion and Gravitation derivations',
  },
  {
    id: 'ex_2',
    subject: 'Chemistry Term Paper',
    examDate: new Date(Date.now() + 86400000 * 24).toISOString().split('T')[0],
    totalChapters: 7,
    completedChapters: 4,
    targetScore: '92%',
    notes: 'Revise coordinate compounds and electrochemistry equations',
  },
  {
    id: 'ex_3',
    subject: 'Mathematics Board Pre-Boards',
    examDate: new Date(Date.now() + 86400000 * 35).toISOString().split('T')[0],
    totalChapters: 12,
    completedChapters: 8,
    targetScore: '98%',
    notes: 'Calculus makes up 44% of total weightage',
  },
];

const defaultLibrary: LibraryResource[] = [
  {
    id: 'lib_1',
    title: 'NCERT / Standard Physics Reference Manual - Mechanics',
    category: 'Textbooks',
    subject: 'Physics',
    description: 'Comprehensive concepts, illustrated diagrams, solved examples, and numerical exercises.',
    dateAdded: '2026-03-01',
    isFavorite: true,
  },
  {
    id: 'lib_2',
    title: 'Formula Master Handbook: 100 Golden Formulas for STEM',
    category: 'Formulas',
    subject: 'Mathematics & Physics',
    description: 'Curated pocket formulas with dimensional analysis and condition checks.',
    dateAdded: '2026-03-10',
    isFavorite: true,
  },
  {
    id: 'lib_3',
    title: 'Previous 5-Year Solved Board Examination Papers',
    category: 'Sample Papers',
    subject: 'Science & Math',
    description: 'Authentic previous year question papers with model answers and step-marking breakdown.',
    dateAdded: '2026-03-12',
    isFavorite: false,
  },
];

const defaultAchievements: AchievementBadge[] = [
  { id: 'ach_1', title: 'First Contact', description: 'Met I.R.I.S. and started your study journey', icon: 'Sparkles', unlocked: true, unlockedAt: '2026-03-01' },
  { id: 'ach_2', title: 'Streak Titan', description: 'Maintained a 7-day learning streak', icon: 'Flame', unlocked: true, unlockedAt: '2026-03-08' },
  { id: 'ach_3', title: 'Deep Thinker', description: 'Engaged with I.R.I.S. NEO Advanced Reasoning', icon: 'BrainCircuit', unlocked: true, unlockedAt: '2026-03-07' },
  { id: 'ach_4', title: 'Quiz Ace', description: 'Achieved 90%+ in 5 academic quizzes', icon: 'Award', unlocked: true, unlockedAt: '2026-03-09' },
  { id: 'ach_5', title: 'Focus Master', description: 'Completed 2 hours in Study Together sessions', icon: 'Hourglass', unlocked: true, unlockedAt: '2026-03-05' },
  { id: 'ach_6', title: 'Memory Vault Keeper', description: 'Curated 5 personalized memory facts for IRIS', icon: 'ShieldCheck', unlocked: true, unlockedAt: '2026-03-04' },
  { id: 'ach_7', title: 'Code Architect', description: 'Analyzed or debugged code with Computer Science Tutor', icon: 'Terminal', unlocked: false, progress: 2, maxProgress: 5 },
  { id: 'ach_8', title: 'Exam Centurion', description: 'Complete all chapter revisions before target exam date', icon: 'Trophy', unlocked: false, progress: 6, maxProgress: 8 },
];

const initialChatSession: ChatSession = {
  id: 'chat_init',
  title: 'Welcome to I.R.I.S.!',
  messages: [
    {
      id: 'msg_welcome',
      role: 'model',
      content: `Hey Alex! Welcome back to **I.R.I.S.**! 

I'm your AI best friend, your tutor, and your personal study companion. What's on your radar today? 

- Want to tackle that **Rotational Motion** chapter we talked about?
- Take a quick, fun 5-question quiz to test your memory?
- Or just hang out and plan out an easy, stress-free week?

Whatever you need, I'm right here with you! Let's make learning feel effortless and fun. ✨`,
      timestamp: new Date().toISOString(),
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPinned: true,
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}chats`);
    return saved ? JSON.parse(saved) : [initialChatSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return chatSessions[0]?.id || initialChatSession.id;
  });

  const [notes, setNotes] = useState<NoteDoc[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}notes`);
    return saved ? JSON.parse(saved) : defaultNotes;
  });

  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}flashcards`);
    return saved ? JSON.parse(saved) : defaultFlashcards;
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tasks`);
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}study_plan`);
    return saved ? JSON.parse(saved) : defaultStudyPlan;
  });

  const [exams, setExams] = useState<ExamCountdown[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}exams`);
    return saved ? JSON.parse(saved) : defaultExams;
  });

  const [library, setLibrary] = useState<LibraryResource[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}library`);
    return saved ? JSON.parse(saved) : defaultLibrary;
  });

  const [achievements, setAchievements] = useState<AchievementBadge[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}achievements`);
    return saved ? JSON.parse(saved) : defaultAchievements;
  });

  // Active study session
  const [activeStudySession, setActiveStudySession] = useState<{
    isActive: boolean;
    subject: string;
    topic: string;
    goal: string;
    timeRemaining: number;
    initialTime: number;
    isPaused: boolean;
  }>({
    isActive: false,
    subject: '',
    topic: '',
    goal: '',
    timeRemaining: 25 * 60,
    initialTime: 25 * 60,
    isPaused: false,
  });

  // Auth state & modals (Part 21.1)
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const isAuthenticated = Boolean(authUser);

  // Load user data from Supabase PostgreSQL tables
  const loadUserDataFromSupabase = async (userId: string) => {
    try {
      const dbProfile = await fetchProfileFromDB(userId);
      if (dbProfile) {
        setProfile((prev) => ({
          ...prev,
          name: dbProfile.name || prev.name,
          grade: dbProfile.grade || prev.grade,
          board: dbProfile.board || prev.board,
          subjects: dbProfile.subjects || prev.subjects,
          favoriteSubject: dbProfile.favorite_subject || prev.favoriteSubject,
          streakDays: dbProfile.streak_days || prev.streakDays,
          totalStudyMinutes: dbProfile.total_study_minutes || prev.totalStudyMinutes,
          quizzesTaken: dbProfile.quizzes_taken || prev.quizzesTaken,
          averageQuizScore: dbProfile.average_quiz_score || prev.averageQuizScore,
        }));
      }

      const dbMemories = await fetchMemoriesFromDB(userId);
      if (dbMemories && dbMemories.length > 0) {
        setProfile((prev) => ({
          ...prev,
          memoryFacts: dbMemories.map((m: any) => m.fact),
        }));
      }

      const dbNotes = await fetchNotesFromDB(userId);
      if (dbNotes && dbNotes.length > 0) {
        setNotes(
          dbNotes.map((n: any) => ({
            id: n.id,
            title: n.title,
            subject: n.subject,
            topic: n.topic,
            content: n.content,
            createdAt: n.created_at,
            isFavorite: n.is_favorite,
            tags: n.tags || [],
          }))
        );
      }

      const dbTasks = await fetchTasksFromDB(userId);
      if (dbTasks && dbTasks.length > 0) {
        setTasks(
          dbTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            subject: t.subject,
            priority: t.priority,
            completed: t.completed,
            estimatedMinutes: t.estimated_minutes,
            dueDate: t.due_date,
          }))
        );
      }
    } catch (err) {
      console.warn('Error loading Supabase database tables:', err);
    }
  };

  // Supabase session listener
  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setAuthUser(data.session.user);
          loadUserDataFromSupabase(data.session.user.id);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            setAuthUser(session.user);
            loadUserDataFromSupabase(session.user.id);
          } else {
            setAuthUser(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}chats`, JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}notes`, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}flashcards`, JSON.stringify(flashcardDecks));
  }, [flashcardDecks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tasks`, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}study_plan`, JSON.stringify(studyPlan));
  }, [studyPlan]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}exams`, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}library`, JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}achievements`, JSON.stringify(achievements));
  }, [achievements]);

  // Focus Timer interval for Study Together
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (activeStudySession.isActive && !activeStudySession.isPaused && activeStudySession.timeRemaining > 0) {
      timer = setInterval(() => {
        setActiveStudySession((prev) => {
          if (prev.timeRemaining <= 1) {
            triggerCelebration();
            // Award study minutes to profile
            const sessionMins = Math.round(prev.initialTime / 60);
            updateProfile({ totalStudyMinutes: profile.totalStudyMinutes + sessionMins });
            return { ...prev, timeRemaining: 0, isActive: false };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeStudySession.isActive, activeStudySession.isPaused, activeStudySession.timeRemaining]);

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      if (authUser?.id && isSupabaseConfigured) {
        updateProfileInDB(authUser.id, {
          name: next.name,
          grade: next.grade,
          board: next.board,
          favorite_subject: next.favoriteSubject,
          streak_days: next.streakDays,
          total_study_minutes: next.totalStudyMinutes,
          quizzes_taken: next.quizzesTaken,
          average_quiz_score: next.averageQuizScore,
        });
      }
      return next;
    });
  };

  const addMemoryFact = (fact: string) => {
    if (!fact.trim()) return;
    const cleanFact = fact.trim();
    setProfile((prev) => ({
      ...prev,
      memoryFacts: [...prev.memoryFacts, cleanFact],
    }));

    if (authUser?.id && isSupabaseConfigured) {
      insertMemoryToDB(authUser.id, cleanFact);
    }
  };

  const removeMemoryFact = (fact: string) => {
    setProfile((prev) => ({
      ...prev,
      memoryFacts: prev.memoryFacts.filter((f) => f !== fact),
    }));
  };

  const clearAllMemories = () => {
    setProfile((prev) => ({
      ...prev,
      memoryFacts: [],
    }));
  };

  const logoutUser = async () => {
    await signOut();
    setAuthUser(null);
    setProfile(initialProfile);
    setIsAuthModalOpen(true);
    setAuthModalMode('login');
  };

  const deleteStudentAccount = async () => {
    if (authUser?.id) {
      await deleteUserAccount(authUser.id);
    }
    await logoutUser();
  };

  const createNewChat = (title = 'New Conversation') => {
    const newChat: ChatSession = {
      id: `chat_${Date.now()}`,
      title,
      messages: [
        {
          id: `msg_${Date.now()}`,
          role: 'model',
          content: `Hey ${profile.name}! I'm all ears. What would you like to explore or study together?`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChatSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newChat.id);
    return newChat.id;
  };

  const addMessageToActiveChat = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const fullMsg: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    setChatSessions((prev) =>
      prev.map((session) => {
        if (session.id === activeSessionId) {
          return {
            ...session,
            messages: [...session.messages, fullMsg],
            updatedAt: new Date().toISOString(),
          };
        }
        return session;
      })
    );
  };

  const deleteChat = (id: string) => {
    setChatSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSessionId === id && filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const renameChat = (id: string, newTitle: string) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const pinChat = (id: string) => {
    setChatSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const addNote = (note: Omit<NoteDoc, 'id' | 'createdAt'>) => {
    const newNote: NoteDoc = {
      ...note,
      id: `note_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);

    if (authUser?.id && isSupabaseConfigured) {
      insertNoteToDB(authUser.id, {
        title: note.title,
        subject: note.subject,
        topic: note.topic,
        content: note.content,
        tags: note.tags,
        is_favorite: note.isFavorite,
      });
    }
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (authUser?.id && isSupabaseConfigured && !id.startsWith('note_')) {
      deleteNoteFromDB(id);
    }
  };

  const toggleFavoriteNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFavorite: !n.isFavorite } : n))
    );
  };

  const addFlashcardDeck = (deck: Omit<FlashcardDeck, 'id' | 'createdAt'>) => {
    const newDeck: FlashcardDeck = {
      ...deck,
      id: `deck_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFlashcardDecks((prev) => [newDeck, ...prev]);
  };

  const deleteFlashcardDeck = (id: string) => {
    setFlashcardDecks((prev) => prev.filter((d) => d.id !== id));
  };

  const toggleCardMastered = (deckId: string, cardId: string | number) => {
    setFlashcardDecks((prev) =>
      prev.map((d) => {
        if (d.id !== deckId) return d;
        return {
          ...d,
          cards: d.cards.map((c) =>
            String(c.id) === String(cardId) ? { ...c, mastered: !c.mastered } : c
          ),
        };
      })
    );
  };

  const addTask = (task: Omit<StudyTask, 'id' | 'completed'>) => {
    const newTask: StudyTask = {
      ...task,
      id: `task_${Date.now()}`,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);

    if (authUser?.id && isSupabaseConfigured) {
      insertTaskToDB(authUser.id, {
        title: task.title,
        subject: task.subject,
        priority: task.priority,
        estimated_minutes: task.estimatedMinutes,
      });
    }
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const next = !t.completed;
          if (next) triggerCelebration();
          if (authUser?.id && isSupabaseConfigured && !id.startsWith('task_')) {
            updateTaskStatusInDB(id, next);
          }
          return { ...t, completed: next };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (authUser?.id && isSupabaseConfigured && !id.startsWith('task_')) {
      deleteTaskFromDB(id);
    }
  };

  const togglePlanItem = (id: string) => {
    setStudyPlan((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const next = !p.completed;
          if (next) triggerCelebration();
          return { ...p, completed: next };
        }
        return p;
      })
    );
  };

  const addExam = (exam: Omit<ExamCountdown, 'id'>) => {
    const newExam: ExamCountdown = {
      ...exam,
      id: `exam_${Date.now()}`,
    };
    setExams((prev) => [...prev, newExam]);
  };

  const updateExamChapters = (id: string, completed: number) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completedChapters: completed } : e))
    );
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const addLibraryItem = (item: Omit<LibraryResource, 'id' | 'dateAdded'>) => {
    const newItem: LibraryResource = {
      ...item,
      id: `lib_${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setLibrary((prev) => [newItem, ...prev]);
  };

  const deleteLibraryItem = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleFavoriteLibraryItem = (id: string) => {
    setLibrary((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const checkAndAwardAchievement = (badgeId: string) => {
    setAchievements((prev) =>
      prev.map((a) => {
        if (a.id === badgeId && !a.unlocked) {
          triggerCelebration();
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] };
        }
        return a;
      })
    );
  };

  const startStudySession = (subject: string, topic: string, goal: string, minutes: number) => {
    setActiveStudySession({
      isActive: true,
      subject,
      topic,
      goal,
      timeRemaining: minutes * 60,
      initialTime: minutes * 60,
      isPaused: false,
    });
  };

  const pauseStudySession = () => {
    setActiveStudySession((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeStudySession = () => {
    setActiveStudySession((prev) => ({ ...prev, isPaused: false }));
  };

  const endStudySession = (completedNaturally = false) => {
    if (completedNaturally) {
      triggerCelebration();
    }
    setActiveStudySession((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
    }));
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f472b6'],
      });
    } catch (e) {
      // Fallback
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_$\\]/g, '').slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        // Auth & Supabase (Part 21)
        authUser,
        isAuthenticated,
        logoutUser,
        deleteStudentAccount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,

        profile,
        updateProfile,
        addMemoryFact,
        removeMemoryFact,
        clearAllMemories,
        chatSessions,
        activeSessionId,
        setActiveSessionId,
        createNewChat,
        addMessageToActiveChat,
        deleteChat,
        renameChat,
        pinChat,
        notes,
        addNote,
        deleteNote,
        toggleFavoriteNote,
        flashcardDecks,
        addFlashcardDeck,
        deleteFlashcardDeck,
        toggleCardMastered,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        studyPlan,
        setStudyPlan,
        togglePlanItem,
        exams,
        addExam,
        updateExamChapters,
        deleteExam,
        library,
        addLibraryItem,
        deleteLibraryItem,
        toggleFavoriteLibraryItem,
        achievements,
        checkAndAwardAchievement,
        activeStudySession,
        startStudySession,
        pauseStudySession,
        resumeStudySession,
        endStudySession,
        triggerCelebration,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
