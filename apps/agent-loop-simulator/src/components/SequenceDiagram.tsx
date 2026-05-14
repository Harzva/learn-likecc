import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Bot, Wrench } from 'lucide-react';
import type { SequenceMessage } from '../data/simulatorData';
import { sequenceMessages, messageColors } from '../data/simulatorData';
import MessageBlock from './MessageBlock';

interface SequenceDiagramProps {
  currentStep: number;
  onMessageClick: (msg: SequenceMessage) => void;
}

const participants = [
  { id: 'llm-api', name: 'LLM API', icon: Sun, color: '#ea580c' },
  { id: 'agent-runtime', name: 'Agent Runtime', icon: Bot, color: '#c2410c' },
  { id: 'tools', name: 'Tools', icon: Wrench, color: '#6366f1' },
];

export default function SequenceDiagram({ currentStep, onMessageClick }: SequenceDiagramProps) {
  const visibleMessages = sequenceMessages.filter((m) => m.step <= currentStep);
  const laneHeight = 112;
  const arrowGap = 10;
  const diagramHeight = Math.max(520, 72 + visibleMessages.length * laneHeight);

  const estimatedBlockHeight: Record<SequenceMessage['type'], number> = {
    STDIN: 72,
    REQUEST: 76,
    ASSISTANT: 78,
    LOOP: 72,
    TOOL_RESULT: 72,
  };

  const getArrowY = (msg: SequenceMessage, rowIdx: number) => {
    const messageTop = 18 + rowIdx * laneHeight;
    const blockHeight = estimatedBlockHeight[msg.type] ?? 74;

    return messageTop + Math.min(blockHeight + arrowGap, laneHeight - 18);
  };

  const getArrowPoints = (fromIdx: number, toIdx: number) => {
    const from = ((fromIdx + 0.5) / participants.length) * 100;
    const to = ((toIdx + 0.5) / participants.length) * 100;
    const sourceInset = 12.4;
    const targetInset = 4.8;

    if (from === to) {
      return { x1: `${from}%`, x2: `${to}%` };
    }

    return from < to
      ? { x1: `${from + sourceInset}%`, x2: `${to - targetInset}%` }
      : { x1: `${from - sourceInset}%`, x2: `${to + targetInset}%` };
  };

  return (
    <div
      className="agent-loop-terminal-scroll relative overflow-auto rounded-xl p-4 sm:p-5"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        minHeight: 640,
        maxHeight: 'min(760px, calc(100dvh - 130px))',
      }}
    >
      <div className="min-w-[720px]">
      {/* Participants header */}
      <div className="grid grid-cols-3 relative z-10 mb-4">
        {participants.map((p) => (
          <div key={p.id} className="flex flex-col items-center">
            <div
              className="w-7 h-7 flex items-center justify-center rounded-md"
              style={{ backgroundColor: `${p.color}15` }}
            >
              <p.icon size={18} style={{ color: p.color }} />
            </div>
            <span className="text-[13px] font-semibold mt-1.5" style={{ color: p.color }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>

      {/* Lifelines and messages area */}
      <div className="relative" style={{ height: diagramHeight }}>
        {/* Lifelines */}
        <div className="absolute inset-0 grid grid-cols-3">
          {participants.map((p) => (
            <div key={p.id} className="flex justify-center h-full">
              <div
                className="h-full"
                style={{ borderLeft: '1.5px dashed #fdba74' }}
              />
            </div>
          ))}
        </div>

        {/* Messages */}
        <div className="relative z-10 h-full">
          <AnimatePresence>
            {visibleMessages.map((msg, idx) => {
              const colIndex =
                msg.target === 'self'
                  ? participants.findIndex((p) => p.id === msg.source)
                  : participants.findIndex((p) => p.id === msg.source);

              const rowIndex = idx;
              const topOffset = 18 + rowIndex * laneHeight;

              return (
                <div
                  key={`${msg.step}-${msg.type}`}
                  className="absolute flex justify-center"
                  style={{
                    left: `${(colIndex / 3) * 100}%`,
                    width: `${100 / 3}%`,
                    top: topOffset,
                  }}
                >
                  <MessageBlock
                    message={msg}
                    index={idx}
                    onClick={onMessageClick}
                  />
                </div>
              );
            })}
          </AnimatePresence>

          {/* Arrow lines between participants */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <AnimatePresence>
              {visibleMessages
                .filter((msg) => msg.target !== 'self')
                .map((msg) => {
                  const fromIdx = participants.findIndex((p) => p.id === msg.source);
                  const toIdx = participants.findIndex((p) => p.id === msg.target);
                  const rowIdx = visibleMessages.indexOf(msg);
                  const yPos = getArrowY(msg, rowIdx);
                  const { x1, x2 } = getArrowPoints(fromIdx, toIdx);

                  return (
                    <motion.line
                      key={`arrow-${msg.step}-${msg.type}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      x1={x1}
                      y1={`${yPos}px`}
                      x2={x2}
                      y2={`${yPos}px`}
                      stroke={messageColors[msg.type]?.arrow || '#999'}
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      markerEnd={`url(#arrowhead-${msg.type})`}
                    />
                  );
                })}
            </AnimatePresence>
            <defs>
              {Object.entries(messageColors).map(([type, colors]) => (
                <marker
                  key={type}
                  id={`arrowhead-${type}`}
                  markerWidth="7"
                  markerHeight="5"
                  refX="6.2"
                  refY="2.5"
                  orient="auto"
                >
                  <polygon points="0 0, 7 2.5, 0 5" fill={colors.arrow} />
                </marker>
              ))}
            </defs>
          </svg>
        </div>
      </div>
      </div>
    </div>
  );
}
