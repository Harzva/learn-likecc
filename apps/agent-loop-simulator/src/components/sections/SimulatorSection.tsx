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
      className="px-6 pb-20"
    >
      <div className="mx-auto w-full max-w-[1560px]">
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]" key={replayKey}>
          <SequenceDiagram
            currentStep={currentStep}
            onMessageClick={setSelectedMessage}
          />
          <div className="min-w-0">
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
