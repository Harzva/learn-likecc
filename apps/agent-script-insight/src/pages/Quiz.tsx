import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modules } from '@/data/modules';
import type { QuizQuestion } from '@/data/modules';
import CheckIcon from '@/components/icons/CheckIcon';
import XIcon from '@/components/icons/XIcon';

interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedOption: number | null;
  answered: boolean;
  score: number;
  correctCount: number;
  shuffledIndices: number[];
}

const TAB_ALL = 'all';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createInitialState(questions: QuizQuestion[]): QuizState {
  const shuffledIndices = shuffleArray(questions.map((_, i) => i));
  return {
    questions,
    currentIndex: 0,
    selectedOption: null,
    answered: false,
    score: 0,
    correctCount: 0,
    shuffledIndices,
  };
}

function getPerformanceMessage(percentage: number): string {
  if (percentage === 100) return "Perfect score! You're a Claude Code master!";
  if (percentage >= 80) return 'Excellent work! You really know your stuff.';
  if (percentage >= 60) return "Good job! A bit more practice and you'll be an expert.";
  if (percentage >= 40) return 'Not bad! Review the modules and try again.';
  return 'Keep learning! Check out the modules to build your knowledge.';
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return '#16a34a';
  if (percentage >= 50) return 'var(--accent-amber)';
  return '#dc2626';
}

const moduleTabs = [
  { id: TAB_ALL, label: 'All Modules', count: modules.reduce((sum, m) => sum + m.quiz.length, 0) },
  ...modules.map((m) => ({ id: m.id, label: m.title, count: m.quiz.length })),
];

export default function Quiz() {
  const [selectedModule, setSelectedModule] = useState<string>(TAB_ALL);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [quizKey, setQuizKey] = useState(0);

  const currentModule = useMemo(() => modules.find((m) => m.id === selectedModule), [selectedModule]);

  const questionsForModule = useMemo(() => {
    if (selectedModule === TAB_ALL) {
      return modules.flatMap((m) => m.quiz);
    }
    return currentModule?.quiz ?? [];
  }, [selectedModule, currentModule]);

  // Initialize quiz when module changes or quizKey changes
  useEffect(() => {
    if (questionsForModule.length > 0) {
      setQuiz(createInitialState(questionsForModule));
    }
  }, [questionsForModule, quizKey]);

  const handleSelectModule = useCallback((moduleId: string) => {
    setSelectedModule(moduleId);
    setQuizKey((k) => k + 1);
  }, []);

  const handleSelectOption = useCallback((optionIndex: number) => {
    if (!quiz || quiz.answered) return;
    setQuiz((prev) => {
      if (!prev || prev.answered) return prev;
      const currentQ = prev.questions[prev.shuffledIndices[prev.currentIndex]];
      const isCorrect = optionIndex === currentQ.correctIndex;
      return {
        ...prev,
        selectedOption: optionIndex,
        answered: true,
        correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
      };
    });
  }, [quiz]);

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;
    setQuiz((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
        selectedOption: null,
        answered: false,
      };
    });
  }, [quiz]);

  const handleTryAgain = useCallback(() => {
    if (!quiz) return;
    setQuiz((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        selectedOption: null,
        answered: false,
      };
    });
  }, [quiz]);

  const handleRetake = useCallback(() => {
    setQuizKey((k) => k + 1);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!quiz || quiz.currentIndex >= quiz.questions.length) return;

      if (!quiz.answered) {
        if (e.key >= '1' && e.key <= '4') {
          const idx = parseInt(e.key, 10) - 1;
          const currentQ = quiz.questions[quiz.shuffledIndices[quiz.currentIndex]];
          if (idx < currentQ.options.length) {
            handleSelectOption(idx);
          }
        }
      } else {
        if (e.key === 'Enter') {
          handleNextQuestion();
        } else if (e.key === 't' || e.key === 'T') {
          if (quiz.selectedOption !== quiz.questions[quiz.shuffledIndices[quiz.currentIndex]].correctIndex) {
            handleTryAgain();
          }
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [quiz, handleSelectOption, handleNextQuestion, handleTryAgain]);

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6">
        <h1 className="font-playfair text-[42px] font-bold" style={{ color: 'var(--text-primary)' }}>
          Quiz
        </h1>
        <p className="mt-4 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
          No questions available.
        </p>
      </div>
    );
  }

  const isComplete = quiz.currentIndex >= quiz.questions.length;
  const currentQuestionIndex = !isComplete ? quiz.shuffledIndices[quiz.currentIndex] : 0;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((quiz.correctCount / totalQuestions) * 100) : 0;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-8 sm:px-6 lg:py-8">
      {/* Section 1: Page Header */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          className="font-playfair text-[42px] font-bold"
          style={{ color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.015em' }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          Quiz
        </motion.h1>
        <motion.p
          className="mx-auto mt-3 max-w-[520px] text-[15px]"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 }}
        >
          Test your Claude Code knowledge. Select a module below or take the full quiz covering all topics.
        </motion.p>
      </motion.div>

      {/* Section 2: Module Selector */}
      {!isComplete && (
        <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <p className="mb-3 text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Choose a module:
          </p>
          <div className="flex flex-wrap gap-2">
            {moduleTabs.map((tab, i) => {
              const isActive = tab.id === selectedModule;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => handleSelectModule(tab.id)}
                  className="rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-amber)' : 'var(--cream-dark)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--accent-amber)' : '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--accent-amber)';
                      e.currentTarget.style.color = 'var(--accent-amber)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1 + i * 0.03,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  title={`${tab.count} questions`}
                >
                  {tab.label}
                  <span className="ml-1.5 opacity-70">({tab.count})</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Section 3: Quiz Interface or Completion */}
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key={`${selectedModule}-${quiz.currentIndex}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            {/* Quiz Header Bar */}
            <div className="mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Question {quiz.currentIndex + 1} of {totalQuestions}
                </span>
                <motion.span
                  className="text-[13px] font-medium"
                  style={{ color: 'var(--text-secondary)' }}
                  animate={{ scale: quiz.answered ? [1.1, 1] : 1 }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                >
                  Score: {quiz.correctCount}/{totalQuestions}
                </motion.span>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: 'var(--accent-amber)' }}
                  initial={{ width: `${(quiz.currentIndex / totalQuestions) * 100}%` }}
                  animate={{ width: `${((quiz.currentIndex + (quiz.answered ? 1 : 0)) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div
              className="rounded-xl border bg-white p-6 sm:p-7"
              style={{
                borderColor: 'var(--border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              {/* Question Text */}
              <h2
                className="text-[22px] font-semibold sm:text-[24px]"
                style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}
              >
                {currentQuestion.question}
              </h2>

              {/* Options */}
              <div className="mt-5 flex flex-col gap-2.5">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = quiz.selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;
                  const showCorrect = quiz.answered && isCorrect;
                  const showIncorrect = quiz.answered && isSelected && !isCorrect;
                  const showNeutral = !quiz.answered;

                  let borderColor = 'var(--border)';
                  let bgColor = '#ffffff';
                  let textColor = 'var(--text-primary)';

                  if (showNeutral && isSelected) {
                    borderColor = 'var(--accent-amber)';
                    bgColor = 'var(--accent-amber-light)';
                  } else if (showCorrect) {
                    borderColor = '#86efac';
                    bgColor = '#f0fdf4';
                    textColor = '#166534';
                  } else if (showIncorrect) {
                    borderColor = '#fca5a5';
                    bgColor = '#fef2f2';
                    textColor = '#dc2626';
                  }

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={quiz.answered}
                      className="flex items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-[15px] transition-all duration-200 sm:px-5"
                      style={{
                        borderColor,
                        backgroundColor: bgColor,
                        color: textColor,
                        cursor: quiz.answered ? 'default' : 'pointer',
                      }}
                      whileHover={!quiz.answered ? { scale: 1.01 } : {}}
                      whileTap={!quiz.answered ? { scale: 0.99 } : {}}
                    >
                      {/* Option letter */}
                      <span
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-semibold"
                        style={{
                          backgroundColor: showCorrect ? '#86efac' : showIncorrect ? '#fca5a5' : isSelected ? 'var(--accent-amber)' : 'var(--cream-dark)',
                          color: showCorrect ? '#166534' : showIncorrect ? '#dc2626' : isSelected ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        {showCorrect ? (
                          <CheckIcon className="text-green-600" />
                        ) : showIncorrect ? (
                          <XIcon className="text-red-600" />
                        ) : (
                          String.fromCharCode(65 + idx)
                        )}
                      </span>
                      <span className="flex-1">{option}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback Area */}
              <AnimatePresence>
                {quiz.answered && (
                  <motion.div
                    className="mt-4 rounded-lg border p-4"
                    style={{
                      backgroundColor: quiz.selectedOption === currentQuestion.correctIndex ? '#f0fdf4' : '#fef2f2',
                      borderColor: quiz.selectedOption === currentQuestion.correctIndex ? '#86efac' : '#fca5a5',
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                  >
                    <div className="flex items-start gap-2.5">
                      {quiz.selectedOption === currentQuestion.correctIndex ? (
                        <CheckIcon className="mt-0.5 flex-shrink-0 text-green-600" />
                      ) : (
                        <XIcon className="mt-0.5 flex-shrink-0 text-red-500" />
                      )}
                      <div>
                        <p
                          className="text-[15px] font-medium"
                          style={{
                            color: quiz.selectedOption === currentQuestion.correctIndex ? '#166534' : '#dc2626',
                          }}
                        >
                          {quiz.selectedOption === currentQuestion.correctIndex ? 'Correct!' : 'Not quite.'}
                        </p>
                        <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                          {currentQuestion.explanation}
                        </p>
                        {quiz.selectedOption !== currentQuestion.correctIndex && (
                          <p className="mt-1 text-[14px] font-medium" style={{ color: 'var(--accent-amber)' }}>
                            Correct answer: {currentQuestion.options[currentQuestion.correctIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              {quiz.answered && (
                <motion.div
                  className="mt-5 flex gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {quiz.selectedOption !== currentQuestion.correctIndex && (
                    <button
                      onClick={handleTryAgain}
                      className="rounded-lg border border-[var(--border-dark)] bg-transparent px-5 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--cream-dark)]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Try again
                    </button>
                  )}
                  <button
                    onClick={handleNextQuestion}
                    className="rounded-lg px-6 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: 'var(--text-primary)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-amber)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--text-primary)'; }}
                  >
                    Next question
                  </button>
                </motion.div>
              )}
            </div>

            {/* Keyboard hints */}
            {!quiz.answered && (
              <p className="mt-3 text-center text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                Press 1–4 to select an option
              </p>
            )}
          </motion.div>
        ) : (
          /* Section 4: Quiz Complete */
          <motion.div
            key="complete"
            className="mx-auto mt-10 max-w-[480px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          >
            <div
              className="rounded-2xl border bg-white p-8 text-center sm:p-10"
              style={{
                borderColor: 'var(--border)',
              }}
            >
              {/* Trophy Icon */}
              <motion.div
                className="mx-auto flex h-16 w-16 items-center justify-center"
                style={{
                  color: percentage >= 60 ? 'var(--accent-amber)' : '#dc2626',
                }}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], delay: 0.2 }}
              >
                {percentage >= 60 ? (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 7 6 7 6h10s0-2 2.5-2a2.5 2.5 0 0 1 0 5H18" />
                    <path d="M8 9v8a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9" />
                    <path d="M6 9h12v2a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9z" />
                    <line x1="12" y1="2" x2="12" y2="4" />
                  </svg>
                ) : (
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                )}
              </motion.div>

              <motion.h2
                className="mt-4 font-playfair text-[32px] font-bold"
                style={{ color: 'var(--text-primary)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                Quiz Complete!
              </motion.h2>

              <motion.p
                className="mt-3 text-[22px] font-semibold"
                style={{ color: 'var(--text-primary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
              >
                You scored {quiz.correctCount} out of {totalQuestions}
              </motion.p>

              <motion.p
                className="mt-2 text-[18px] font-semibold"
                style={{ color: getScoreColor(percentage) }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                ({percentage}%)
              </motion.p>

              <motion.p
                className="mt-2 text-[15px]"
                style={{ color: 'var(--text-secondary)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                {getPerformanceMessage(percentage)}
              </motion.p>

              <motion.div
                className="my-6 h-px w-full"
                style={{ backgroundColor: 'var(--border)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              />

              <motion.div
                className="flex flex-wrap justify-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1 }}
              >
                <button
                  onClick={handleRetake}
                  className="rounded-lg border border-[var(--border-dark)] bg-transparent px-5 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--cream-dark)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Retake Quiz
                </button>
                <a
                  href="#/learn"
                  className="rounded-lg px-5 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                  style={{ backgroundColor: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-amber)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--text-primary)'; }}
                >
                  Back to Learn
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
