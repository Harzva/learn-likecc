import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TerminalSimulator from '@/components/TerminalSimulator';
import ResetIcon from '@/components/icons/ResetIcon';

const quickCommands = ['/help', '/compact', '/clear', '/context', '/cost', '/status', '/model', '/effort'];

export default function Playground() {
  const [terminalKey, setTerminalKey] = useState(0);
  const [resetFlash, setResetFlash] = useState(false);

  const handleReset = useCallback(() => {
    setTerminalKey((k) => k + 1);
    setResetFlash(true);
    setTimeout(() => setResetFlash(false), 2000);
  }, []);

  const handleQuickCommand = useCallback((cmd: string) => {
    // Programmatically send command to terminal by simulating input
    const terminalBody = document.querySelector('.terminal-playground-input') as HTMLInputElement | null;
    if (terminalBody) {
      // Focus the hidden input approach won't work directly
      // Instead, dispatch a custom event that the terminal can pick up
      const event = new CustomEvent('playground-command', { detail: { command: cmd } });
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:py-8">
      {/* Section 1: Page Header */}
      <motion.div
        className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          {/* Breadcrumb */}
          <motion.nav
            className="mb-3 text-[13px]"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <a
              href="#/"
              className="transition-colors duration-200 hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              Home
            </a>
            <span className="mx-2">/</span>
            <span style={{ color: 'var(--text-primary)' }}>Playground</span>
          </motion.nav>

          {/* Title */}
          <motion.h1
            className="font-playfair text-[42px] font-bold sm:text-[42px]"
            style={{ color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.015em' }}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
          >
            Playground
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-1 text-[18px] font-semibold"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.35 }}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
          >
            Terminal Practice
          </motion.p>

          {/* Description */}
          <motion.p
            className="mt-2 max-w-[560px] text-[15px]"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
          >
            Practice Claude Code commands in a safe environment. Type any command and see how Claude Code responds.
          </motion.p>

          {/* Reset flash message */}
          {resetFlash && (
            <motion.p
              className="mt-2 text-[14px] font-medium"
              style={{ color: '#4ade80' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Playground reset.
            </motion.p>
          )}
        </div>

        {/* Reset Button */}
        <motion.button
          onClick={handleReset}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border-dark)] bg-transparent px-5 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--cream-dark)] sm:mt-0"
          style={{ color: 'var(--text-primary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ResetIcon />
          Reset Playground
        </motion.button>
      </motion.div>

      {/* Section 2: Full Terminal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
      >
        <TerminalSimulator
          key={terminalKey}
          mode="free"
          title="Claude Code — Playground"
          className="h-[70vh]"
          height="70vh"
        />
      </motion.div>

      {/* Section 3: Quick Reference */}
      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <p className="mb-3 text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Quick Command Reference
        </p>
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((cmd, i) => (
            <motion.button
              key={cmd}
              onClick={() => handleQuickCommand(cmd)}
              className="rounded-md border px-3 py-1.5 text-[12px] font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--cream-dark)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-amber-light)';
                e.currentTarget.style.borderColor = 'var(--accent-amber)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.5 + i * 0.04,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              {cmd}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
