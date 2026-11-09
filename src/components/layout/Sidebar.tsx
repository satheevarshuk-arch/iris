import React from 'react';
import {
  LayoutDashboard,
  MessageSquareHeart,
  Users,
  BookOpen,
  FileText,
  ListCollapse,
  HelpCircle,
  Network,
  FolderGit2,
  CalendarDays,
  Clock,
  CheckSquare,
  GraduationCap,
  FileCheck2,
  Palette,
  Code2,
  Atom,
  BarChart3,
  Award,
  Brain,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  activeTab,
  setActiveTab,
  onCloseMobile,
}) => {
  const navSections = [
    {
      group: 'HOME',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'chat', label: 'My AI Friend', icon: MessageSquareHeart, badge: 'Live' },
        { id: 'study-together', label: 'Study Together', icon: Users, badge: 'Focus' },
      ],
    },
    {
      group: 'LEARNING',
      items: [
        { id: 'notes', label: 'AI Notes Generator', icon: FileText },
        { id: 'quizzes', label: 'AI Quiz Maker', icon: HelpCircle },
        { id: 'flashcards', label: 'AI Flashcards', icon: BookOpen },
        { id: 'homework', label: 'Homework Helper', icon: ListCollapse },
        { id: 'mindmap', label: 'Mind Map Explorer', icon: Network },
        { id: 'library', label: 'Digital Library', icon: FolderGit2 },
      ],
    },
    {
      group: 'PRODUCTIVITY',
      items: [
        { id: 'planner', label: 'Smart Study Planner', icon: CalendarDays },
        { id: 'productivity', label: 'Tasks & Habits', icon: CheckSquare },
      ],
    },
    {
      group: 'EXAM CENTER',
      items: [
        { id: 'exam-prep', label: 'Exam Prep & Countdown', icon: GraduationCap },
        { id: 'question-paper', label: 'Mock Question Papers', icon: FileCheck2 },
      ],
    },
    {
      group: 'AI LAB',
      items: [
        { id: 'creative-lab', label: 'Creative AI Lab', icon: Palette },
        { id: 'coding-lab', label: 'Coding & Tech Lab', icon: Code2 },
        { id: 'science-viz', label: 'Science Visualizer', icon: Atom },
      ],
    },
    {
      group: 'MY SPACE',
      items: [
        { id: 'analytics', label: 'Student Analytics', icon: BarChart3 },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'settings', label: 'Memory Vault & Profile', icon: Brain },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 glass-panel border-r border-indigo-900/30 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 space-y-5">
          {navSections.map((sec) => (
            <div key={sec.group} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400/90 uppercase">
                {sec.group}
              </div>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-cyan-500/10 text-cyan-200 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          size={16}
                          className={`shrink-0 transition-colors ${
                            isActive
                              ? 'text-cyan-400'
                              : 'text-slate-400 group-hover:text-indigo-300'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge ? (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                              : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/20'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : isActive ? (
                        <ChevronRight size={14} className="text-cyan-400 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick AI Companion encouragement card at bottom of sidebar */}
          <div className="pt-2 px-1">
            <div className="p-3 rounded-xl bg-gradient-to-b from-indigo-950/60 to-blue-950/40 border border-indigo-500/20 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Sparkles size={13} />
                <span>Iris Study Tip</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                "Small consistent sprints beat frantic all-nighters every single time. Take a deep breath!"
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
