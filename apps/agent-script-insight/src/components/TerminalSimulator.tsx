import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';
import { getCommandResponse, welcomeMessage } from '@/data/commands';

interface TerminalLine {
  id: number;
  type: 'prompt' | 'command' | 'output' | 'hint';
  text: string;
}

interface TerminalStep {
  command: string;
  output: string[];
  hint: string;
}

interface TerminalSimulatorProps {
  mode: 'guided' | 'free';
  steps?: TerminalStep[];
  height?: string;
  className?: string;
  autoPlay?: boolean;
  onAutoPlayDone?: () => void;
  title?: string;
}

let globalLineId = 0;
function nextId() {
  return ++globalLineId;
}

// Strip ANSI codes for display
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

// Parse ANSI codes into styled spans (simplified)
function renderAnsiLine(line: string): React.ReactNode {
  if (!line.includes('\x1b[')) return line;

  const parts: { text: string; color?: string; bold?: boolean }[] = [];
  let currentColor: string | undefined;
  let currentBold = false;

  const ansiColorMap: Record<string, string> = {
    '32': '#4ade80',
    '31': '#f87171',
    '33': '#fbbf24',
    '36': '#93c5fd',
    '93': '#fbbf24',
    '91': '#f87171',
    '90': '#6b7280',
    '1': '',
  };

  const regex = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        text: line.slice(lastIndex, match.index),
        color: currentColor,
        bold: currentBold,
      });
    }

    const codes = match[1].split(';');
    for (const code of codes) {
      if (code === '0') {
        currentColor = undefined;
        currentBold = false;
      } else if (code === '1') {
        currentBold = true;
      } else if (ansiColorMap[code]) {
        currentColor = ansiColorMap[code];
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push({
      text: line.slice(lastIndex),
      color: currentColor,
      bold: currentBold,
    });
  }

  return parts.map((part, i) => (
    <span
      key={i}
      style={{
        color: part.color,
        fontWeight: part.bold ? 700 : 400,
      }}
    >
      {part.text}
    </span>
  ));
}

export default function TerminalSimulator({
  mode,
  steps = [],
  height = '380px',
  className = '',
  autoPlay = false,
  onAutoPlayDone,
  title = 'Claude Code',
}: TerminalSimulatorProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [typedCommand, setTypedCommand] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState<'hint' | 'typing' | 'output' | 'done'>('hint');
  const [copied, setCopied] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [commandInput, setCommandInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [, setHistoryIndex] = useState(-1);
  const [freeLines, setFreeLines] = useState<TerminalLine[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoPlayStarted = useRef(false);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, typedCommand, freeLines]);

  // Blinking cursor
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // ---- GUIDED MODE ----
  const startGuidedStep = useCallback(
    (stepIdx: number) => {
      if (stepIdx >= steps.length) {
        setPhase('done');
        if (onAutoPlayDone) onAutoPlayDone();
        return;
      }

      setCurrentStepIndex(stepIdx);
      setPhase('hint');
      setTypedCommand('');

      const step = steps[stepIdx];

      // Show hint
      setLines((prev) => [
        ...prev,
        { id: nextId(), type: 'hint', text: step.hint },
      ]);
    },
    [steps, onAutoPlayDone]
  );

  const runGuidedCommand = useCallback(() => {
    if (phase !== 'hint' || currentStepIndex >= steps.length) return;

    const step = steps[currentStepIndex];
    setPhase('typing');

    // Remove hint line
    setLines((prev) => prev.filter((l) => l.type !== 'hint'));

    // Show prompt
    setLines((prev) => [
      ...prev.filter((l) => l.type !== 'hint'),
      { id: nextId(), type: 'prompt', text: '> ' },
    ]);

    // Type command char by char
    const chars = step.command.split('');
    let charIdx = 0;

    const typeInterval = setInterval(() => {
      if (charIdx < chars.length) {
        setTypedCommand(step.command.slice(0, charIdx + 1));
        charIdx++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);

        // After typing, show output
        setTimeout(() => {
          setLines((prev) => [
            ...prev.filter((l) => l.type !== 'prompt'),
            { id: nextId(), type: 'command', text: step.command },
          ]);
          setTypedCommand('');

          // Show output lines with delay
          let lineIdx = 0;
          const outputInterval = setInterval(() => {
            if (lineIdx < step.output.length) {
              setLines((prev) => [
                ...prev,
                { id: nextId(), type: 'output', text: step.output[lineIdx] },
              ]);
              lineIdx++;
            } else {
              clearInterval(outputInterval);
              setPhase('done');

              // Pause then next step
              setTimeout(() => {
                startGuidedStep(currentStepIndex + 1);
              }, 2000);
            }
          }, 100);
        }, 300);
      }
    }, 50);

    setIsTyping(true);
  }, [phase, currentStepIndex, steps, startGuidedStep]);

  // Auto-play on mount for hero terminal
  useEffect(() => {
    if (mode === 'guided' && autoPlay && steps.length > 0 && !autoPlayStarted.current) {
      autoPlayStarted.current = true;
      // Start after a short delay
      const timer = setTimeout(() => {
        startGuidedStep(0);
        // Auto-run first step
        setTimeout(() => {
          runGuidedCommand();
        }, 800);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [mode, autoPlay, steps, startGuidedStep, runGuidedCommand]);

  // ---- FREE MODE ----
  const executeFreeCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const newLines: TerminalLine[] = [
      { id: nextId(), type: 'command', text: trimmed },
    ];

    const response = getCommandResponse(trimmed);

    if (response.clear) {
      setFreeLines([
        ...newLines,
        ...welcomeMessage.map((t) => ({ id: nextId(), type: 'output' as const, text: t })),
      ]);
      return;
    }

    for (const line of response.lines) {
      newLines.push({ id: nextId(), type: 'output', text: line });
    }

    setFreeLines((prev) => [...prev, ...newLines]);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        executeFreeCommand(commandInput);
        setCommandInput('');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistoryIndex((idx) => {
          const newIdx = idx === -1 ? history.length - 1 : Math.max(0, idx - 1);
          setCommandInput(history[newIdx] || '');
          return newIdx;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistoryIndex((idx) => {
          const newIdx = idx === -1 ? -1 : Math.min(history.length - 1, idx + 1);
          if (newIdx === -1 || newIdx >= history.length - 1) {
            setCommandInput('');
            return -1;
          }
          setCommandInput(history[newIdx + 1] || '');
          return newIdx + 1;
        });
      }
    },
    [commandInput, executeFreeCommand, history]
  );

  // Initialize free mode with welcome
  useEffect(() => {
    if (mode === 'free' && freeLines.length === 0) {
      setFreeLines(
        welcomeMessage.map((t) => ({ id: nextId(), type: 'output' as const, text: t }))
      );
    }
  }, [mode, freeLines.length]);

  // Copy output
  const handleCopy = useCallback(() => {
    const allLines = mode === 'guided' ? lines : freeLines;
    const text = allLines
      .filter((l) => l.type === 'output' || l.type === 'command')
      .map((l) => stripAnsi(l.text))
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [lines, freeLines, mode]);

  const displayLines = mode === 'guided' ? lines : freeLines;
  const statusText = isTyping ? 'Typing...' : phase === 'hint' ? 'Ready' : 'Running...';

  return (
    <div
      className={`overflow-hidden rounded-xl shadow-terminal ${className}`}
      style={{ backgroundColor: '#1e1e1e' }}
    >
      {/* Title bar */}
      <div
        className="flex h-9 items-center justify-between px-4"
        style={{ backgroundColor: '#2d2d2d' }}
      >
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ff5f56' }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: '#27c93f' }} />
          <span
            className="ml-3 text-xs"
            style={{ color: '#9ca3af', fontFamily: '"JetBrains Mono", monospace' }}
          >
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: '#9ca3af', fontFamily: '"JetBrains Mono", monospace' }}
          >
            {mode === 'guided' ? statusText : 'Free Type'}
          </span>
          <button
            onClick={handleCopy}
            className="rounded p-1 transition-colors duration-150 hover:bg-white/10"
            style={{ color: '#9ca3af' }}
            title="Copy output"
          >
            {copied ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="terminal-scroll overflow-y-auto p-4"
        style={{
          backgroundColor: '#1e1e1e',
          minHeight: '200px',
          height,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#f0f0f0',
        }}
      >
        <AnimatePresence initial={false}>
          {displayLines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.05 }}
              className="whitespace-pre-wrap"
              style={{
                color:
                  line.type === 'hint'
                    ? '#9ca3af'
                    : line.type === 'command'
                    ? '#fbbf24'
                    : line.type === 'output'
                    ? '#93c5fd'
                    : '#f0f0f0',
                fontStyle: line.type === 'hint' ? 'italic' : 'normal',
              }}
            >
              {line.type === 'command' && (
                <>
                  <span style={{ color: '#60a5fa' }}>{'> '}</span>
                  {renderAnsiLine(line.text)}
                </>
              )}
              {line.type === 'prompt' && (
                <span style={{ color: '#60a5fa' }}>
                  {line.text}
                  {typedCommand}
                  {cursorVisible && <span className="animate-blink">{'\u258c'}</span>}
                </span>
              )}
              {line.type === 'output' && renderAnsiLine(line.text)}
              {line.type === 'hint' && (
                <span style={{ color: '#6b7280' }}>{line.text}</span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing cursor for guided mode */}
        {mode === 'guided' && isTyping && (
          <div style={{ color: '#60a5fa' }}>
            {'> '}
            <span style={{ color: '#fbbf24' }}>{typedCommand}</span>
            <span className="animate-blink">{'\u258c'}</span>
          </div>
        )}

        {/* Free mode input */}
        {mode === 'free' && (
          <div className="mt-1 flex items-center">
            <span style={{ color: '#60a5fa', marginRight: '4px' }}>{'> '}</span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none"
              style={{
                color: '#fbbf24',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '14px',
                caretColor: '#60a5fa',
              }}
              placeholder="Type a command (e.g., /help)"
              autoFocus
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Guided mode controls */}
      {mode === 'guided' && phase === 'hint' && steps.length > 0 && (
        <div
          className="flex items-center justify-between border-t px-4 py-3"
          style={{
            backgroundColor: '#2d2d2d',
            borderColor: '#404040',
          }}
        >
          <span className="text-xs" style={{ color: '#9ca3af' }}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <button
            onClick={runGuidedCommand}
            className="rounded-md px-4 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: '#b45309' }}
          >
            Run
          </button>
        </div>
      )}

      {mode === 'guided' && phase === 'done' && currentStepIndex >= steps.length && (
        <div
          className="border-t px-4 py-3 text-center text-xs"
          style={{
            backgroundColor: '#2d2d2d',
            borderColor: '#404040',
            color: '#4ade80',
          }}
        >
          Tutorial complete!
        </div>
      )}
    </div>
  );
}
