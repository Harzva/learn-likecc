import { motion } from 'framer-motion';
import type { SequenceMessage } from '../data/simulatorData';
import { messageColors } from '../data/simulatorData';

interface MessageBlockProps {
  message: SequenceMessage;
  index: number;
  onClick: (msg: SequenceMessage) => void;
}

export default function MessageBlock({ message, index, onClick }: MessageBlockProps) {
  const colors = messageColors[message.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      onClick={() => onClick(message)}
      className="rounded-lg cursor-pointer relative"
      style={{
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        padding: '10px 14px',
        maxWidth: 184,
        boxShadow: '0 4px 10px rgba(234, 88, 12, 0.08)',
      }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.08 + 0.1 }}
        className="block text-[10px] font-bold uppercase tracking-wider mb-1"
        style={{ color: colors.tag, letterSpacing: '0.5px' }}
      >
        {message.type}
      </motion.span>
      <p className="text-[13px] font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>
        {message.text}
      </p>
    </motion.div>
  );
}
