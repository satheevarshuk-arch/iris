import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DailyCheckInModal } from './components/common/DailyCheckInModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { IrisChat } from './components/chat/IrisChat';
import { StudyTogether } from './components/study-together/StudyTogether';
import { NotesGenerator } from './components/learning/NotesGenerator';
import { QuizMaker } from './components/learning/QuizMaker';
import { FlashcardsView } from './components/learning/FlashcardsView';
import { HomeworkHelper } from './components/learning/HomeworkHelper';
import { MindMapViewer } from './components/learning/MindMapViewer';
import { DigitalLibrary } from './components/library/DigitalLibrary';
import { StudyPlanner } from './components/planner/StudyPlanner';
import { ProductivityCenter } from './components/productivity/ProductivityCenter';
import { ExamCenter } from './components/exam/ExamCenter';
import { CreativeLab } from './components/creative/CreativeLab';
import { CodingLab } from './components/coding/CodingLab';
import { ScienceVisualizer } from './components/interactive/ScienceVisualizer';
import { StudentAnalytics } from './components/analytics/StudentAnalytics';
import { AchievementsView } from './components/achievements/AchievementsView';
import { ProfileSettings } from './components/settings/ProfileSettings';

import { AuthModal } from './components/auth/AuthModal';
import { useApp } from './context/AppContext';

function MainApp() {
  const { isAuthModalOpen, setIsAuthModalOpen, authModalMode } = useApp();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} onOpenCheckIn={() => setIsCheckInOpen(true)} />;
      case 'chat':
        return <IrisChat />;
      case 'study-together':
        return <StudyTogether />;
      case 'notes':
        return <NotesGenerator />;
      case 'quizzes':
        return <QuizMaker />;
      case 'flashcards':
        return <FlashcardsView />;
      case 'homework':
        return <HomeworkHelper />;
      case 'mindmap':
        return <MindMapViewer />;
      case 'library':
        return <DigitalLibrary />;
      case 'planner':
        return <StudyPlanner />;
      case 'productivity':
        return <ProductivityCenter />;
      case 'exam-prep':
      case 'question-paper':
        return <ExamCenter />;
      case 'creative-lab':
        return <CreativeLab />;
      case 'coding-lab':
        return <CodingLab />;
      case 'science-viz':
        return <ScienceVisualizer />;
      case 'analytics':
        return <StudentAnalytics />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <ProfileSettings />;
      default:
        return <Dashboard setActiveTab={setActiveTab} onOpenCheckIn={() => setIsCheckInOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCheckIn={() => setIsCheckInOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-64 overflow-y-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />

      {/* Supabase Authentication Modal (Part 21.1) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
