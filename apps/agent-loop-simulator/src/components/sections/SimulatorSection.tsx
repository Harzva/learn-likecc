import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SequenceDiagram from '../SequenceDiagram';
import TerminalEmulator from '../TerminalEmulator';
import ControlBar from '../ControlBar';
import MessageDetailModal from '../MessageDetailModal';
import type { SequenceMessage } from '../../data/simulatorData';

interface SimulatorSectionProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function SimulatorSection({ currentStep, onStepChange }: SimulatorSectionProps) {
  const [selectedMessage, setSelectedMessage] = useState<SequenceMessage | null>(null);
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = useCallback(() => {
    setReplayKey((prev) => prev + 1);
  }, []);

  return (
    <motion.section
      id="simulator"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="px-4 pb-20 sm:px-6"
    >
      <div className="mx-auto w-full max-w-[1680px]">
        <div className="mb-4 grid gap-3 rounded-xl border p-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.62)' }}>
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>Trace 对动态模拟器的启发</div>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              当前回放还是教学版剧情；更真实的版本应该从 trace 抽取 request、assistant、tool_use、tool_result，再生成左侧消息流和右侧终端回放。
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {['真实 request 分层', '工具调用时间线', '累计 prompt 视图'].map((item) => (
              <a key={item} href="../agent-trace-simulator/" className="rounded-lg border px-3 py-2 text-[12px] font-semibold" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff', color: 'var(--text-primary)' }}>
                {item} →
              </a>
            ))}
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]" key={replayKey}>
          <SequenceDiagram
            currentStep={currentStep}
            onMessageClick={setSelectedMessage}
          />
          <div className="min-w-0 overflow-hidden rounded-xl">
            <TerminalEmulator currentStep={currentStep} />
            <ControlBar
              currentStep={currentStep}
              onStepChange={onStepChange}
              onReplay={handleReplay}
            />
          </div>
        </div>
      </div>

      <MessageDetailModal
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
      />
    </motion.section>
  );
}
