import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  RotateCw,
  Check,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Plus,
  Trash2,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateFlashcardsAPI } from '../../services/api';
import { FlashcardDeck } from '../../types';

export const FlashcardsView: React.FC = () => {
  const {
    profile,
    flashcardDecks,
    addFlashcardDeck,
    deleteFlashcardDeck,
    toggleCardMastered,
    speakText,
    triggerCelebration,
  } = useApp();

  const [activeDeckId, setActiveDeckId] = useState<string>(
    flashcardDecks[0]?.id || ''
  );
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // New deck creator state
  const [subject, setSubject] = useState(profile.favoriteSubject || 'Physics');
  const [topic, setTopic] = useState('Newton’s Laws & Gravitation');
  const [count, setCount] = useState<number>(6);
  const [isLoading, setIsLoading] = useState(false);

  const activeDeck = flashcardDecks.find((d) => d.id === activeDeckId) || flashcardDecks[0];
  const currentCard = activeDeck?.cards[currentCardIndex];

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    try {
      const data = await generateFlashcardsAPI({
        topic,
        subject,
        count,
      });

      if (data && data.cards) {
        addFlashcardDeck({
          title: data.deckTitle || `${topic} Deck`,
          subject,
          topic,
          cards: data.cards.map((c: any, idx: number) => ({
            id: c.id || idx + 1,
            front: c.front,
            back: c.back,
            hint: c.hint,
            category: c.category || 'General',
            mastered: false,
          })),
        });
        triggerCelebration();
      }
    } catch (err: any) {
      alert(`Could not generate flashcards: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeck.cards.length);
  };

  const handlePrev = () => {
    if (!activeDeck) return;
    setIsFlipped(false);
    setCurrentCardIndex((prev) =>
      prev === 0 ? activeDeck.cards.length - 1 : prev - 1
    );
  };

  const masteredCount = activeDeck?.cards.filter((c) => c.mastered).length || 0;
  const totalCards = activeDeck?.cards.length || 0;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Spaced Repetition Lab
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">AI Flashcards</h1>
          <p className="text-xs text-slate-400">
            Interactive 3D memory cards engineered for active recall and rapid exam memorization.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <BookOpen size={24} />
        </div>
      </div>

      {/* Generator Accordion / Form */}
      <form onSubmit={handleGenerateDeck} className="glass-panel p-5 rounded-2xl border-indigo-900/30 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Create New AI Deck
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
            >
              {profile.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic (e.g. Organic Chemistry Reagents)"
              className="w-full px-3 py-2 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles size={14} className="animate-spin text-cyan-300" />
                  <span>Synthesizing Cards...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Generate Deck</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Deck Selector Tabs */}
      {flashcardDecks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {flashcardDecks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                setActiveDeckId(deck.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                (activeDeck?.id || flashcardDecks[0]?.id) === deck.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-cyan-400/40'
                  : 'glass-input text-slate-400 hover:text-white'
              }`}
            >
              {deck.title} ({deck.cards.length})
            </button>
          ))}
        </div>
      )}

      {/* 3D Flashcard Presentation View */}
      {currentCard ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Card <strong className="text-white">{currentCardIndex + 1}</strong> of {totalCards}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">
                {masteredCount} Mastered
              </span>
              <span>•</span>
              <span className="text-indigo-300">
                {totalCards - masteredCount} In Progress
              </span>
            </div>
          </div>

          {/* Interactive Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 min-h-[280px] sm:min-h-[320px] rounded-3xl glass-panel-glow border-indigo-500/30 p-8 sm:p-12 flex flex-col justify-between items-center text-center relative transition-all duration-300 hover:border-cyan-400/50 shadow-2xl"
          >
            {/* Top card pill & Audio TTS */}
            <div className="w-full flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-950 text-cyan-300 border border-indigo-500/30">
                {isFlipped ? 'Answer / Concept' : 'Question / Prompt'}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakText(isFlipped ? currentCard.back : currentCard.front);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                title="Pronounce / Read aloud"
              >
                <Volume2 size={16} />
              </button>
            </div>

            {/* Middle Question / Answer Content */}
            <div className="my-auto max-w-xl space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>

              {!isFlipped && currentCard.hint && (
                <p className="text-xs text-slate-400 italic">
                  💡 Hint: {currentCard.hint}
                </p>
              )}
            </div>

            {/* Bottom tap instructions */}
            <div className="w-full flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-indigo-900/20">
              <span className="flex items-center gap-1">
                <RotateCw size={13} />
                <span>Click card to flip</span>
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardMastered(activeDeck.id, currentCard.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
                  currentCard.mastered
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-emerald-300'
                }`}
              >
                <Check size={13} />
                <span>{currentCard.mastered ? 'Mastered!' : 'Mark Mastered'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-2xl glass-input text-slate-300 hover:text-white hover:border-cyan-400/40 transition-all cursor-pointer"
              title="Previous card"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <RotateCw size={14} />
              <span>Flip Card</span>
            </button>

            <button
              onClick={handleNext}
              className="p-3 rounded-2xl glass-input text-slate-300 hover:text-white hover:border-cyan-400/40 transition-all cursor-pointer"
              title="Next card"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-sm">
          No flashcards found. Create your first deck above!
        </div>
      )}
    </div>
  );
};
