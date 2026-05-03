import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { SequenceMessage } from '../data/simulatorData';
import { messageColors, mockPayloads } from '../data/simulatorData';

interface MessageDetailModalProps {
  message: SequenceMessage | null;
  onClose: () => void;
}

export default function MessageDetailModal({ message, onClose }: MessageDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!message) return null;

  const colors = messageColors[message.type];
  const payload = mockPayloads[message.type] || JSON.stringify({ type: message.type, text: message.text }, null, 2);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
            }}
            onClick={(e) => e.stopPropagation()}
            className="rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: colors.bg, color: colors.tag }}
                >
                  {message.type}
                </span>
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  Step {message.step}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-x-auto overflow-y-auto max-h-[60vh]">
              <p className="text-[14px] mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                {message.text}
              </p>
              <div className="flex items-center gap-2 mb-3 text-[12px]" style={{ color: '#94a3b8' }}>
                <span>From: <strong style={{ color: 'var(--text-primary)' }}>{message.source}</strong></span>
                <span>→</span>
                <span>To: <strong style={{ color: 'var(--text-primary)' }}>{message.target}</strong></span>
              </div>
              <pre
                className="rounded-lg p-4 overflow-x-auto text-[12px] font-mono leading-relaxed"
                style={{ backgroundColor: '#0f172a', color: '#e6e6e6' }}
              >
                {payload}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
