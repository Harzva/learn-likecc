import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion } from '@/data/modules';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface QuizProps {
  questions: QuizQuestion[];
}

type QuizState = 'answering' | 'correct' | 'incorrect';

export default function Quiz({ questions }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('answering');
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = completed
    ? 100
    : ((currentIndex + (quizState !== 'answering' ? 1 : 0)) / questions.length) * 100;

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (quizState !== 'answering') return;

      setSelectedOption(optionIndex);

      if (optionIndex === currentQuestion.correctIndex) {
        setQuizState('correct');
        setScore((s) => s + 1);
      } else {
        setQuizState('incorrect');
      }
    },
    [quizState, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setQuizState('answering');
    }
  }, [currentIndex, questions.length]);

  const handleTryAgain = useCallback(() => {
    setSelectedOption(null);
    setQuizState('answering');
  }, []);

  const handleRetake = useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setQuizState('answering');
    setScore(0);
    setCompleted(false);
  }, []);

  if (questions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        delay: 0.4,
      }}
      className="rounded-xl border p-6"
      style={{
        backgroundColor: '#ffffff',
        borderColor: 'var(--border-color)',
        marginTop: '24px',
      }}
    >
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <h3
          className="text-[24px] font-semibold"
          style={{ color: 'var(--text-primary)', lineHeight: 1.3, letterSpacing: '-0.005em' }}
        >
          Check Your Understanding
        </h3>
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          {completed
            ? `${questions.length} questions completed`
            : `Question ${currentIndex + 1} of ${questions.length}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 mb-4 h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--border-color)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: 'var(--accent-amber)' }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        />
      </div>

      <AnimatePresence mode="wait">
        {completed ? (
          /* Completion state */
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="flex flex-col items-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                delay: 0.2,
              }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: '#dcfce7' }}
            >
              <span className="text-[28px] font-bold" style={{ color: '#166534' }}>
                {score}
              </span>
            </motion.div>
            <h4
              className="text-[18px] font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Module Complete!
            </h4>
            <p className="mt-1 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
              You scored {score} out of {questions.length} correct
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRetake}
                className="rounded-lg px-6 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                Retake Quiz
              </button>
            </div>
          </motion.div>
        ) : (
          /* Question state */
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question text */}
            <p
              className="mb-4 text-[18px] font-semibold"
              style={{ color: 'var(--text-primary)', lineHeight: 1.35, marginTop: '16px' }}
            >
              {currentQuestion.question}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {currentQuestion.options.map((option, idx) => {
                let optionStyle: React.CSSProperties = {};
                let containerClasses = '';

                if (quizState === 'answering') {
                  containerClasses =
                    selectedOption === idx
                      ? 'border-[var(--accent-amber)] bg-[var(--accent-amber-light)]'
                      : 'hover:bg-[var(--cream-dark)]';
                  optionStyle = {
                    borderColor:
                      selectedOption === idx
                        ? 'var(--accent-amber)'
                        : 'var(--border-color)',
                    backgroundColor:
                      selectedOption === idx
                        ? 'var(--accent-amber-light)'
                        : 'transparent',
                  };
                } else if (quizState === 'correct') {
                  if (idx === currentQuestion.correctIndex) {
                    containerClasses = 'border-[#86efac] bg-[#f0fdf4]';
                    optionStyle = { borderColor: '#86efac', backgroundColor: '#f0fdf4' };
                  }
                } else if (quizState === 'incorrect') {
                  if (idx === currentQuestion.correctIndex) {
                    containerClasses = 'border-[#86efac] bg-[#f0fdf4]';
                    optionStyle = { borderColor: '#86efac', backgroundColor: '#f0fdf4' };
                  } else if (idx === selectedOption) {
                    containerClasses = 'border-[#fca5a5] bg-[#fef2f2]';
                    optionStyle = { borderColor: '#fca5a5', backgroundColor: '#fef2f2' };
                  }
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={quizState !== 'answering'}
                    className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-[15px] font-medium transition-all duration-200 ${containerClasses}`}
                    style={{
                      color: 'var(--text-primary)',
                      ...optionStyle,
                    }}
                    whileHover={quizState === 'answering' ? { scale: 1.01 } : undefined}
                    whileTap={quizState === 'answering' ? { scale: 0.99 } : undefined}
                  >
                    {/* Icon for correct/incorrect */}
                    {quizState !== 'answering' && idx === currentQuestion.correctIndex && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                        }}
                      >
                        <CheckIcon className="text-green-500" />
                      </motion.div>
                    )}
                    {quizState === 'incorrect' && idx === selectedOption && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                        }}
                      >
                        <XIcon className="text-red-500" />
                      </motion.div>
                    )}
                    <span className="flex-1">{option}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback area */}
            <AnimatePresence>
              {quizState === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="mt-4 rounded-lg border border-[#86efac] bg-[#f0fdf4] p-4 text-[15px]"
                  style={{ color: '#166534' }}
                >
                  <span className="font-semibold">Correct! </span>
                  {currentQuestion.explanation}
                </motion.div>
              )}
              {quizState === 'incorrect' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="mt-4 rounded-lg border border-[#fca5a5] bg-[#fef2f2] p-4 text-[15px]"
                  style={{ color: '#dc2626' }}
                >
                  <span className="font-semibold">Not quite. </span>
                  {currentQuestion.explanation}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons */}
            <AnimatePresence>
              {quizState !== 'answering' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="mt-4 flex gap-3"
                >
                  {quizState === 'incorrect' && (
                    <button
                      onClick={handleTryAgain}
                      className="rounded-lg border px-6 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02]"
                      style={{
                        borderColor: 'var(--border-dark)',
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent',
                      }}
                    >
                      Try again
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="rounded-lg px-6 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: '#1a1a1a' }}
                  >
                    {currentIndex + 1 >= questions.length ? 'See results' : 'Next question'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
