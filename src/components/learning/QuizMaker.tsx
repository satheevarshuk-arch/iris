import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateQuizAPI } from '../../services/api';
import { QuizQuestion } from '../../types';

export const QuizMaker: React.FC = () => {
  const { profile, updateProfile, triggerCelebration } = useApp();

  const [subject, setSubject] = useState(profile.favoriteSubject || 'Physics');
  const [topic, setTopic] = useState('Newton’s Laws of Motion & Friction');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [count, setCount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);

  // Active quiz state
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setUserAnswers({});
    setIsSubmitted(false);

    try {
      const data = await generateQuizAPI({
        topic,
        subject,
        difficulty,
        count,
      });

      if (data && data.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setQuizTitle(data.title || `${topic} Quiz`);
      } else {
        throw new Error('Invalid quiz response structure');
      }
    } catch (err: any) {
      alert(`Could not create quiz: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  const handleSubmitQuiz = () => {
    if (!questions) return;

    let correctCount = 0;
    questions.forEach((q) => {
      const userAns = userAnswers[q.id]?.trim().toLowerCase();
      const actualAns = q.correctAnswer?.trim().toLowerCase();
      if (userAns && actualAns && (userAns === actualAns || actualAns.includes(userAns))) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    setScore(percent);
    setIsSubmitted(true);
    triggerCelebration();

    // Update student profile analytics
    const newQuizzesTaken = profile.quizzesTaken + 1;
    const newAverage = Math.round(
      (profile.averageQuizScore * profile.quizzesTaken + percent) / newQuizzesTaken
    );
    updateProfile({
      quizzesTaken: newQuizzesTaken,
      averageQuizScore: newAverage,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border-indigo-900/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/30">
              Interactive Assessment
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">AI Quiz Maker & Evaluator</h1>
          <p className="text-xs text-slate-400">
            Generate custom academic assessments with instant automated marking and detailed concept explanations.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
          <HelpCircle size={24} />
        </div>
      </div>

      {/* Generator Form */}
      <form onSubmit={handleGenerateQuiz} className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
            >
              {profile.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Periodic Table Trends, Calculus Derivations..."
              className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl glass-input text-slate-200 text-xs focus:outline-none"
            >
              <option value="Easy">Easy (Fundamentals)</option>
              <option value="Medium">Medium (Standard Exam)</option>
              <option value="Hard">Hard (Olympiad / Deep)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Questions:</span>
            {[3, 5, 8].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                  count === n ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'glass-input'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles size={16} className="animate-spin text-cyan-300" />
                <span>Designing Quiz with I.R.I.S...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Create Live Quiz</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Quiz Card */}
      {questions && questions.length > 0 && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border-indigo-900/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{quizTitle}</h2>
              <span className="text-xs text-slate-400">
                {questions.length} Questions • {difficulty} Level
              </span>
            </div>

            {isSubmitted && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Score</span>
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                    {score}%
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award size={24} />
                </div>
              </div>
            )}
          </div>

          {/* Question List */}
          <div className="space-y-5">
            {questions.map((q, idx) => {
              const selectedAnswer = userAnswers[q.id];
              const isCorrect =
                selectedAnswer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

              return (
                <div
                  key={q.id || idx}
                  className="glass-panel p-6 rounded-2xl border-indigo-900/30 space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-950 text-cyan-300 border border-indigo-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </h3>
                  </div>

                  {/* Options */}
                  {q.options && q.options.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedAnswer === opt;
                        const isActualCorrect = opt === q.correctAnswer;

                        let styleClass = 'glass-input text-slate-300 hover:border-cyan-400/40';

                        if (isSubmitted) {
                          if (isActualCorrect) {
                            styleClass = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
                          } else if (isChosen && !isActualCorrect) {
                            styleClass = 'bg-rose-950/50 border-rose-500 text-rose-200';
                          }
                        } else if (isChosen) {
                          styleClass = 'bg-indigo-600/30 border-cyan-400 text-cyan-200 shadow-sm';
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt)}
                            disabled={isSubmitted}
                            className={`p-3 rounded-xl border text-xs text-left font-medium transition-all flex items-center justify-between ${styleClass}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && isActualCorrect && (
                              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-2" />
                            )}
                            {isSubmitted && isChosen && !isActualCorrect && (
                              <XCircle size={16} className="text-rose-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // Fill in blank / short answer input
                    <div className="pt-2">
                      <input
                        type="text"
                        value={selectedAnswer || ''}
                        disabled={isSubmitted}
                        onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full px-3.5 py-2.5 rounded-xl glass-input text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Feedback Explanation */}
                  {isSubmitted && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                        <Sparkles size={13} />
                        <span>I.R.I.S. Explanation:</span>
                      </div>
                      <p className="leading-relaxed text-slate-300">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Reset Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length === 0}
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 disabled:opacity-40 transition-all cursor-pointer"
              >
                Submit & Grade Answers
              </button>
            ) : (
              <button
                onClick={() => {
                  setUserAnswers({});
                  setIsSubmitted(false);
                }}
                className="px-6 py-2.5 rounded-xl glass-input hover:border-cyan-400/40 text-xs text-slate-200 font-semibold flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Retake Quiz</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
