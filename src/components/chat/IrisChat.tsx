import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  Sliders,
  Paperclip,
  Mic,
  MicOff,
  Copy,
  Check,
  BookmarkPlus,
  RotateCcw,
  Pin,
  Trash2,
  Plus,
  Search,
  Volume2,
  FileText,
  Image as ImageIcon,
  Zap,
  Info,
  X,
  Share2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IrisAvatar } from '../common/IrisAvatar';
import { sendChatMessage } from '../../services/api';
import { AIMode, LearningMode, ChatAttachment } from '../../types';

export const IrisChat: React.FC = () => {
  const {
    profile,
    chatSessions,
    activeSessionId,
    setActiveSessionId,
    createNewChat,
    addMessageToActiveChat,
    deleteChat,
    pinChat,
    addNote,
    speakText,
    triggerCelebration,
  } = useApp();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiMode, setAiMode] = useState<AIMode>('default');
  const [thinkLonger, setThinkLonger] = useState(false);
  const [learningMode, setLearningMode] = useState<LearningMode>('Explain');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [customOverride, setCustomOverride] = useState({
    detail: 'High Depth & Analytical',
    format: 'Structured with Examples & Takeaways',
    tone: 'Supportive & Rigorous',
    focus: 'First Principles & Intuition',
  });
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession =
    chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  // Speech recognition setup
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        const resultStr = reader.result as string;
        const base64Data = resultStr.split(',')[1] || '';
        const attachment: ChatAttachment = {
          name: file.name,
          mimeType: file.type || 'text/plain',
          data: base64Data,
          previewUrl: file.type.startsWith('image/') ? resultStr : undefined,
          size: file.size,
        };
        setAttachments((prev) => [...prev, attachment]);
      };

      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSendMessage = async (e?: React.FormEvent, directPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = directPrompt || input;
    if ((!promptToSend.trim() && attachments.length === 0) || isLoading) return;

    const userMessageContent = promptToSend.trim();
    const currentAttachments = [...attachments];

    // Clear input & attachments
    setInput('');
    setAttachments([]);

    // Add user message to active chat
    addMessageToActiveChat({
      role: 'user',
      content: userMessageContent,
      attachments: currentAttachments,
      aiMode,
    });

    setIsLoading(true);

    try {
      // Build conversation history for API
      const history = (activeSession?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));

      history.push({
        role: 'user',
        content: userMessageContent,
        attachments: currentAttachments,
      });

      const responseText = await sendChatMessage({
        messages: history,
        studentProfile: profile,
        aiMode,
        thinkLonger,
        learningMode,
        personalityStyle: profile.personalityStyle,
        customOverride: aiMode === 'override' ? customOverride : undefined,
      });

      addMessageToActiveChat({
        role: 'model',
        content: responseText,
        aiMode,
      });
    } catch (err: any) {
      addMessageToActiveChat({
        role: 'model',
        content: `I'm having a slight hiccup connecting to my knowledge base: ${err.message}. Don't worry, let's try again in a second!`,
        aiMode,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSaveToNotes = (content: string) => {
    const titleMatch = content.match(/^#+\s*(.+)/m);
    const title = titleMatch ? titleMatch[1].slice(0, 45) : 'Saved Insight from IRIS';

    addNote({
      title,
      subject: profile.favoriteSubject || 'General',
      topic: 'Saved from Chat',
      content,
      tags: ['SavedFromChat'],
      isFavorite: true,
    });
    triggerCelebration();
  };

  const filteredSessions = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const samplePrompts = [
    { title: 'Explain simply', text: 'Explain the concept of Quantum Superposition using an everyday analogy.' },
    { title: 'Step-by-step math', text: 'Solve this step by step: Find the derivative of f(x) = x^2 * sin(x).' },
    { title: 'Quiz my knowledge', text: 'Ask me 3 challenging questions on Newton’s 3rd Law and wait for my answer.' },
    { title: 'Study burnout advice', text: "I'm feeling mentally exhausted and lost motivation. How do we break it down gently?" },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Chat History Pane */}
      <div className="w-72 hidden md:flex flex-col border-r border-indigo-950/60 glass-panel bg-slate-950/40">
        <div className="p-3 border-b border-indigo-900/30 flex items-center justify-between gap-2">
          <button
            onClick={() => createNewChat()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus size={15} />
            <span>New Discussion</span>
          </button>
        </div>

        {/* Search Chat History */}
        <div className="p-2 border-b border-indigo-900/20">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs glass-input text-slate-300 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-indigo-900/50 text-cyan-200 border border-cyan-500/30 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {session.isPinned && <Pin size={11} className="text-cyan-400 shrink-0" />}
                  <span className="truncate">{session.title}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pinChat(session.id);
                    }}
                    className="p-1 hover:text-cyan-300"
                    title={session.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={12} />
                  </button>
                  {chatSessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(session.id);
                      }}
                      className="p-1 hover:text-rose-400"
                      title="Delete chat"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 flex flex-col bg-[#050b18]">
        {/* Chat Top Banner & Active Mode Pill */}
        <div className="px-4 py-2.5 border-b border-indigo-900/30 glass-panel flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IrisAvatar size="sm" mood={isLoading ? 'thinking' : 'idle'} showStatusBadge />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  {activeSession?.title || 'I.R.I.S. Conversation'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-mono">
                  {aiMode === 'neo' ? 'NEO REASONING' : aiMode === 'override' ? 'CUSTOM OVERRIDE' : 'DEFAULT IRIS'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mode: <span className="text-indigo-300 font-medium">{learningMode}</span> • Personality: {profile.personalityStyle}
              </p>
            </div>
          </div>

          {/* Quick Learning Mode Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 hidden sm:inline">Learning Mode:</label>
            <select
              value={learningMode}
              onChange={(e) => setLearningMode(e.target.value as LearningMode)}
              className="text-xs px-2.5 py-1.5 rounded-lg glass-input text-slate-200 border-indigo-500/30 focus:outline-none cursor-pointer"
            >
              <option value="Explain">Explain Mode</option>
              <option value="Deep Learning">Deep Learning Mode</option>
              <option value="Step-by-Step">Step-by-Step Mode</option>
              <option value="Practice">Practice Mode</option>
              <option value="Revision">Revision Mode</option>
              <option value="Exam Preparation">Exam Preparation Mode</option>
              <option value="Socratic">Socratic Learning Mode</option>
              <option value="Doubt Clearing">Doubt Clearing Mode</option>
              <option value="Teach Me">Teach Me Mode</option>
              <option value="Challenge">Challenge Mode</option>
            </select>
          </div>
        </div>

        {/* Message Bubble Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeSession?.messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser ? (
                  <IrisAvatar size="sm" mood="idle" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md">
                    {profile.name.charAt(0)}
                  </div>
                )}

                <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                        : msg.aiMode === 'neo'
                        ? 'glass-panel-glow border-indigo-500/40 text-slate-200 rounded-tl-none'
                        : 'glass-panel text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* Attachment Previews */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((att, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs"
                          >
                            {att.previewUrl ? (
                              <img src={att.previewUrl} alt={att.name} className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <FileText size={14} className="text-cyan-400" />
                            )}
                            <span className="truncate max-w-[120px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content formatted with clean Markdown-style layout */}
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>

                  {/* Message Actions (Copy, TTS read-aloud, Save to notes) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pl-1 text-slate-400 text-xs">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Copy Response"
                      >
                        {copiedMsgId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => speakText(msg.content)}
                        className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Read aloud"
                      >
                        <Volume2 size={13} />
                        <span>Listen</span>
                      </button>

                      <button
                        onClick={() => handleSaveToNotes(msg.content)}
                        className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
                        title="Save response to Notes"
                      >
                        <BookmarkPlus size={13} />
                        <span>Save to Notes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-2xl mr-auto items-center">
              <IrisAvatar size="sm" mood="thinking" />
              <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3 text-xs text-cyan-300 border border-cyan-400/30">
                <Brain size={16} className="animate-spin text-indigo-400" />
                <span>
                  {aiMode === 'neo' || thinkLonger
                    ? 'I.R.I.S. NEO is deeply analyzing, solving step-by-step...'
                    : 'I.R.I.S. is synthesizing your answer...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts if conversation is fresh */}
        {activeSession?.messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-indigo-900/20 bg-slate-950/30">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              💡 Suggested topics to ask I.R.I.S.:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, p.text)}
                  className="px-2.5 py-1 rounded-lg text-xs bg-indigo-950/50 hover:bg-indigo-900/70 border border-indigo-500/20 hover:border-cyan-400/40 text-slate-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <span className="text-cyan-400 font-medium">{p.title}:</span> {p.text.slice(0, 45)}...
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Control Center (Modes + Input Box) */}
        <div className="p-3 sm:p-4 border-t border-indigo-900/40 glass-panel bg-[#081026]/90">
          {/* Top of input: Three AI Modes + Think Longer toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            {/* The 3 AI Modes Required by PART 3 */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-indigo-900/40">
              <button
                type="button"
                onClick={() => setAiMode('default')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  aiMode === 'default'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                DEFAULT — I.R.I.S.
              </button>

              <button
                type="button"
                onClick={() => setAiMode('neo')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  aiMode === 'neo'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-violet-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Brain size={12} className={aiMode === 'neo' ? 'animate-pulse text-cyan-300' : ''} />
                <span>I.R.I.S. NEO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiMode('override');
                  setShowOverrideModal(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  aiMode === 'override'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders size={12} />
                <span>OVERRIDE MODE</span>
              </button>
            </div>

            {/* Think Longer toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-cyan-300 transition-colors">
              <input
                type="checkbox"
                checked={thinkLonger}
                onChange={(e) => setThinkLonger(e.target.checked)}
                className="w-4 h-4 rounded border-indigo-500 text-cyan-500 focus:ring-0 bg-slate-900 cursor-pointer"
              />
              <span className="flex items-center gap-1 font-medium">
                <Sparkles size={13} className="text-cyan-400" />
                <span>Think Longer</span>
              </span>
            </label>
          </div>

          {/* Attached files preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-950/90 border border-cyan-400/30 text-xs text-slate-200"
                >
                  <FileText size={13} className="text-cyan-400" />
                  <span className="truncate max-w-[150px]">{att.name}</span>
                  <button onClick={() => removeAttachment(idx)} className="text-slate-400 hover:text-rose-400">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl glass-input text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 transition-colors"
              title="Attach Images, Documents, Code or Worksheets"
            >
              <Paperclip size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,text/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Voice Input Mic */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : 'glass-input text-slate-400 hover:text-cyan-300'
              }`}
              title={isListening ? 'Listening...' : 'Voice Conversation'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                aiMode === 'neo'
                  ? 'Ask I.R.I.S. NEO for deep mathematical derivations, coding proofs, or complex concepts...'
                  : `Ask your best friend I.R.I.S. anything about school, studies, or ideas...`
              }
              className="flex-1 px-4 py-3 rounded-xl glass-input text-slate-100 placeholder-slate-500 text-sm focus:outline-none"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-medium shadow-lg shadow-indigo-600/30 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* OVERRIDE MODE Configuration Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Sliders size={20} className="text-cyan-400" />
              <h3 className="text-lg font-bold text-white">I.R.I.S. Override Parameters</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Configure exact response style, depth, formatting, and pedagogical focus for your specific requirements.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Depth & Rigor:</label>
                <select
                  value={customOverride.detail}
                  onChange={(e) => setCustomOverride({ ...customOverride, detail: e.target.value })}
                  className="w-full p-2 rounded-lg glass-input text-slate-200"
                >
                  <option value="Ultra Comprehensive & Step-by-Step">Ultra Comprehensive & Step-by-Step</option>
                  <option value="High Depth & Analytical">High Depth & Analytical</option>
                  <option value="Quick High-Yield Summary">Quick High-Yield Summary</option>
                  <option value="Beginner Friendly Simple Analogies">Beginner Friendly Simple Analogies</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Output Structure:</label>
                <select
                  value={customOverride.format}
                  onChange={(e) => setCustomOverride({ ...customOverride, format: e.target.value })}
                  className="w-full p-2 rounded-lg glass-input text-slate-200"
                >
                  <option value="Structured with Examples & Takeaways">Structured with Examples & Takeaways</option>
                  <option value="Bulleted Cheat-Sheet">Bulleted Cheat-Sheet</option>
                  <option value="Formal Academic Textbook Style">Formal Academic Textbook Style</option>
                  <option value="Interactive Dialogue & Q&A">Interactive Dialogue & Q&A</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Pedagogical Tone:</label>
                <select
                  value={customOverride.tone}
                  onChange={(e) => setCustomOverride({ ...customOverride, tone: e.target.value })}
                  className="w-full p-2 rounded-lg glass-input text-slate-200"
                >
                  <option value="Supportive & Rigorous">Supportive & Rigorous</option>
                  <option value="Strict Senior Board Examiner">Strict Senior Board Examiner</option>
                  <option value="Enthusiastic STEM Coach">Enthusiastic STEM Coach</option>
                  <option value="Gentle Patient Best Friend">Gentle Patient Best Friend</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
              >
                Apply Override Config
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
