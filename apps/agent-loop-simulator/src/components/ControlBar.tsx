import { motion } from 'framer-motion';
import { RotateCcw, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { stepLabels } from '../data/simulatorData';

interface ControlBarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onReplay: () => void;
}

export default function ControlBar({ currentStep, onStepChange, onReplay }: ControlBarProps) {
  const isStart = currentStep === 0;
  const isEnd = currentStep === 12;

  const nextLabel = isStart ? '开始' : isEnd ? '完成' : '下一步';
  const nextIcon = isStart ? <Play size={14} /> : <ChevronRight size={14} />;

  return (
    <div
      className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 py-3 rounded-b-xl"
      style={{ backgroundColor: '#0f172a', borderTop: '1px solid #1e293b' }}
    >
      {/* Left: Step label */}
      <div className="w-full lg:w-64">
        <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: '#94a3b8' }}>
          STEP {String(currentStep).padStart(2, '0')}
        </span>
        <motion.p
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-[13px] truncate"
          style={{ color: '#e6e6e6' }}
        >
          {stepLabels[currentStep]}
        </motion.p>
      </div>

      {/* Center: Step dots */}
      <div className="flex items-center justify-center gap-2 w-full lg:w-auto">
        {Array.from({ length: 12 }, (_, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <button
              key={stepNum}
              onClick={() => onStepChange(stepNum)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-200 hover:scale-125"
              style={{
                backgroundColor: isActive ? 'var(--primary)' : isCompleted ? 'rgba(234,88,12,0.7)' : 'transparent',
                border: isActive || isCompleted ? 'none' : '1.5px solid #334155',
                opacity: isActive ? 1 : isCompleted ? 0.7 : 0.5,
                transform: isActive ? 'scale(1.2)' : 'scale(1)',
              }}
              title={`Step ${stepNum}`}
            />
          );
        })}
      </div>

      {/* Right: Buttons */}
      <div className="flex items-center justify-center gap-2 w-full lg:w-auto">
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={isStart}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 hover:scale-105 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ border: '1px solid #334155', color: '#e6e6e6' }}
        >
          <ChevronLeft size={14} />
          上一步
        </button>
        <button
          onClick={onReplay}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 hover:scale-105 active:scale-[0.97]"
          style={{ border: '1px solid #334155', color: '#e6e6e6' }}
        >
          <RotateCcw size={14} />
          重播
        </button>
        <button
          onClick={() => onStepChange(isEnd ? currentStep : currentStep + 1)}
          className="flex items-center gap-1 px-4 py-1.5 rounded-md text-[13px] font-medium text-white transition-all duration-150 hover:scale-105 active:scale-[0.97]"
          style={{ background: 'var(--gradient-1)', boxShadow: '0 6px 14px rgba(234, 88, 12, 0.25)' }}
        >
          {nextLabel}
          {nextIcon}
        </button>
      </div>
    </div>
  );
}
