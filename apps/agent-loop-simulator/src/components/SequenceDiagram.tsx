import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

interface ArrowSegment {
  id: string;
  type: SequenceMessage['type'];
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function SequenceDiagram({ currentStep, onMessageClick }: SequenceDiagramProps) {
  const visibleMessages = useMemo(
    () => sequenceMessages.filter((m) => m.step <= currentStep),
    [currentStep],
  );
  const messageKeys = useMemo(
    () => visibleMessages.map((msg, idx) => `${msg.step}-${msg.type}-${idx}`),
    [visibleMessages],
  );
  const messageLayerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [arrowSegments, setArrowSegments] = useState<ArrowSegment[]>([]);
  const laneHeight = 112;
  const diagramHeight = Math.max(520, 72 + visibleMessages.length * laneHeight);

  const setMessageRef = useCallback((key: string) => (node: HTMLDivElement | null) => {
    if (node) {
      messageRefs.current.set(key, node);
    } else {
      messageRefs.current.delete(key);
    }
  }, []);

  const syncArrowSegments = useCallback(() => {
    const layer = messageLayerRef.current;
    if (!layer || visibleMessages.length < 2) {
      setArrowSegments([]);
      return;
    }

    const layerRect = layer.getBoundingClientRect();
    const nextSegments: ArrowSegment[] = [];

    for (let idx = 0; idx < visibleMessages.length - 1; idx += 1) {
      const fromEl = messageRefs.current.get(messageKeys[idx]);
      const toEl = messageRefs.current.get(messageKeys[idx + 1]);
      const nextMessage = visibleMessages[idx + 1];
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      const fromCenterX = fromRect.left + fromRect.width / 2 - layerRect.left;
      const toCenterX = toRect.left + toRect.width / 2 - layerRect.left;
      const sameLane = Math.abs(toCenterX - fromCenterX) < 28;
      const sideGap = 8;

      let x1: number;
      let y1: number;
      let x2: number;
      let y2: number;

      if (sameLane) {
        x1 = fromCenterX - 14;
        y1 = fromRect.bottom - layerRect.top + 6;
        x2 = toCenterX + 14;
        y2 = toRect.top - layerRect.top - 8;
      } else if (toCenterX < fromCenterX) {
        x1 = fromRect.left - layerRect.left - sideGap;
        y1 = fromRect.top - layerRect.top + fromRect.height * 0.72;
        x2 = toRect.right - layerRect.left + sideGap;
        y2 = toRect.top - layerRect.top + toRect.height * 0.36;
      } else {
        x1 = fromRect.right - layerRect.left + sideGap;
        y1 = fromRect.top - layerRect.top + fromRect.height * 0.72;
        x2 = toRect.left - layerRect.left - sideGap;
        y2 = toRect.top - layerRect.top + toRect.height * 0.36;
      }

      nextSegments.push({
        id: `flow-${messageKeys[idx]}-${messageKeys[idx + 1]}`,
        type: nextMessage.type,
        x1,
        y1,
        x2,
        y2,
      });
    }

    setArrowSegments(nextSegments);
  }, [messageKeys, visibleMessages]);

  useLayoutEffect(() => {
    let rafId = window.requestAnimationFrame(syncArrowSegments);
    const settleTimer = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(syncArrowSegments);
    }, 480);
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(syncArrowSegments);

    if (messageLayerRef.current && resizeObserver) {
      resizeObserver.observe(messageLayerRef.current);
      messageRefs.current.forEach((node) => resizeObserver.observe(node));
    }
    window.addEventListener('resize', syncArrowSegments);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', syncArrowSegments);
      resizeObserver?.disconnect();
    };
  }, [syncArrowSegments]);

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
        <div ref={messageLayerRef} className="relative z-10 h-full">
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
                    cardRef={setMessageRef(messageKeys[idx])}
                    onClick={onMessageClick}
                  />
                </div>
              );
            })}
          </AnimatePresence>

          {/* Arrow lines between adjacent message cards */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
            <AnimatePresence>
              {arrowSegments.map((segment) => (
                <motion.line
                  key={segment.id}
                  data-flow-arrow="card"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeInOut' }}
                  x1={segment.x1}
                  y1={segment.y1}
                  x2={segment.x2}
                  y2={segment.y2}
                  stroke={messageColors[segment.type]?.arrow || '#999'}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  markerEnd={`url(#card-arrowhead-${segment.type})`}
                />
              ))}
            </AnimatePresence>
            <defs>
              {Object.entries(messageColors).map(([type, colors]) => (
                <marker
                  key={type}
                  id={`card-arrowhead-${type}`}
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
