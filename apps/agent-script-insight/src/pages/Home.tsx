import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import TerminalSimulator from '@/components/TerminalSimulator';
import TerminalIcon from '@/components/icons/TerminalIcon';
import ConfigIcon from '@/components/icons/ConfigIcon';
import QuizIcon from '@/components/icons/QuizIcon';
import PlaygroundIcon from '@/components/icons/PlaygroundIcon';
import CheatSheetIcon from '@/components/icons/CheatSheetIcon';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon';
import { modules } from '@/data/modules';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const heroSteps = [
  {
    command: '/help',
    output: [
      '\x1b[1mAvailable commands:\x1b[0m',
      '',
      '  \x1b[93m/help\x1b[0m       Show this help message',
      '  \x1b[93m/compact\x1b[0m    Summarize conversation history',
      '  \x1b[93m/clear\x1b[0m      Clear the screen',
      '  \x1b[93m/context\x1b[0m    Show context window usage',
      '  \x1b[93m/status\x1b[0m     Show system status',
      '  \x1b[93m/login\x1b[0m      Authenticate with Anthropic',
      '',
      'Type any command to get started.',
    ],
    hint: 'Type /help to see available commands',
  },
  {
    command: '/compact',
    output: [
      '\x1b[36mCompacting conversation...\x1b[0m',
      '',
      '\x1b[32m\u2713\x1b[0m Previous conversation summarized.',
      '\x1b[32m\u2713\x1b[0m Freed ~8K tokens from context window.',
      '',
      'Context: 4.2K / 200K tokens',
    ],
    hint: 'Run /compact to summarize history',
  },
  {
    command: '/status',
    output: [
      '\x1b[1mClaude Code Status:\x1b[0m',
      '',
      '  Version:       v1.8.0',
      '  Model:         claude-sonnet-4-20250514',
      '  Authenticated: Yes',
      '  Context:       12.5K / 200K tokens',
      '',
      '\x1b[32mAll systems operational.\x1b[0m',
    ],
    hint: 'Check system status',
  },
];

const featureCards = [
  {
    icon: TerminalIcon,
    title: 'Try before you install',
    description: 'Practice Claude Code commands directly in your browser. No installation, no API keys, no setup.',
  },
  {
    icon: ConfigIcon,
    title: 'Build real configs',
    description: 'Use interactive forms to generate CLAUDE.md, skills, hooks, and MCP server configurations.',
  },
  {
    icon: QuizIcon,
    title: 'Verify understanding',
    description: 'Each module ends with a quiz to test what you\'ve learned. Get immediate feedback and explanations.',
  },
];

const toolCards = [
  {
    icon: PlaygroundIcon,
    title: 'Playground',
    description: 'Free-form terminal practice',
    href: '#/playground',
    external: false,
  },
  {
    icon: ConfigIcon,
    title: 'Config Builder',
    description: 'Generate configuration files',
    href: '#/build',
    external: false,
  },
  {
    icon: CheatSheetIcon,
    title: 'Cheat Sheet',
    description: 'Quick command reference',
    href: '#/reference',
    external: false,
  },
  {
    icon: TerminalIcon,
    title: 'Feature Index',
    description: 'Browse all features',
    href: '#/learn',
    external: false,
  },
  {
    icon: ExternalLinkIcon,
    title: 'Resources',
    description: 'External links & docs',
    href: 'https://docs.anthropic.com/en/docs/claude-code',
    external: true,
  },
];

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Beginner: { bg: '#dcfce7', text: '#166534' },
    Intermediate: { bg: '#fef9c3', text: '#a16207' },
    Advanced: { bg: '#fee2e2', text: '#dc2626' },
  };
  const c = colors[level] || colors.Beginner;

  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-medium uppercase"
      style={{ backgroundColor: c.bg, color: c.text, fontFamily: '"JetBrains Mono", monospace' }}
    >
      {level}
    </span>
  );
}

export default function Home() {
  const [terminalKey, setTerminalKey] = useState(0);

  const handleTerminalDone = useCallback(() => {
    // Restart the auto-play loop
    setTimeout(() => {
      setTerminalKey((k) => k + 1);
    }, 3000);
  }, []);

  return (
    <div>
      {/* ---- HERO SECTION ---- */}
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--cream)',
          padding: '96px 0 64px',
        }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-12 px-6 lg:flex-row">
          {/* Left: Text */}
          <div className="flex-1 lg:max-w-[55%]">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOutExpo }}
              className="font-playfair text-[32px] font-bold leading-tight tracking-tight md:text-[40px] lg:text-[56px]"
              style={{
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
              }}
            >
              Agent scripts by doing, not reading.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.12 }}
              className="mt-2 text-[15px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Learn LikeCode interactive lab
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.24 }}
              className="mt-5 max-w-[480px] text-[17px] leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              A browser-based command script lab for Claude Code workflows, configs, terminal practice, and quizzes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.36 }}
              className="mt-7 flex flex-wrap gap-3"
            >
              <a
                href="#/learn"
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: '#1a1a1a' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b45309';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                }}
              >
                Start Learning
              </a>
              <a
                href="#/playground"
                className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{
                  borderColor: 'var(--border-dark)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Open Playground
              </a>
            </motion.div>
          </div>

          {/* Right: Terminal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.3 }}
            className="w-full lg:max-w-[45%]"
          >
            <TerminalSimulator
              key={terminalKey}
              mode="guided"
              steps={heroSteps}
              autoPlay
              onAutoPlayDone={handleTerminalDone}
              title="Agent Script Lab"
              height="340px"
            />
          </motion.div>
        </div>
      </section>

      {/* ---- FEATURE CARDS ---- */}
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--cream)',
          padding: '64px 0',
        }}
      >
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {featureCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{
                  duration: 0.6,
                  ease: easeOutExpo,
                  delay: i * 0.1,
                }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}
                className="rounded-xl border p-6 transition-colors duration-300"
                style={{
                  backgroundColor: 'var(--cream-dark)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(180, 83, 9, 0.1)' }}
                >
                  <card.icon className="text-[#b45309]" />
                </div>
                <h3
                  className="mt-4 text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {card.title}
                </h3>
                <p
                  className="mt-2 text-[15px] leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- LEARNING MODULES ---- */}
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--cream-dark)',
          padding: '64px 0',
        }}
      >
        <div className="mx-auto max-w-[1200px] px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-6 font-playfair text-[32px] font-semibold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}
          >
            Start with the basics
          </motion.h2>

          <div className="flex flex-col gap-3">
            {modules.slice(0, 5).map((mod, i) => (
              <motion.a
                key={mod.id}
                href={`#/learn/${mod.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{
                  duration: 0.5,
                  ease: easeOutExpo,
                  delay: i * 0.06,
                }}
                whileHover={{
                  x: 4,
                  borderColor: '#b45309',
                  boxShadow: '0 4px 16px rgba(180,83,9,0.08)',
                }}
                className="group flex items-center gap-4 rounded-lg border bg-white p-5 transition-all duration-250"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {/* Number badge */}
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
                  style={{
                    backgroundColor: 'var(--cream-dark)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {mod.title}
                  </h3>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {mod.duration}
                  </p>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                  <DifficultyBadge level={mod.difficulty} />
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <a
              href="#/learn"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:opacity-70"
              style={{ color: '#b45309' }}
            >
              See all 12 modules
              <ArrowRightIcon />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---- EXPLORE TOOLS ---- */}
      <section
        className="w-full"
        style={{
          backgroundColor: 'var(--cream)',
          padding: '64px 0',
        }}
      >
        <div className="mx-auto max-w-[1200px] px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-15%' }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="mb-8 font-playfair text-[32px] font-semibold"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.15 }}
          >
            Explore
          </motion.h2>

          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
            {toolCards.map((tool, i) => (
              <motion.a
                key={tool.title}
                href={tool.href}
                target={tool.external ? '_blank' : undefined}
                rel={tool.external ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-15%' }}
                transition={{
                  duration: 0.6,
                  ease: easeOutExpo,
                  delay: i * 0.08,
                }}
                whileHover={{
                  y: -3,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                }}
                className="rounded-xl border p-5 transition-all duration-300"
                style={{
                  backgroundColor: 'var(--cream-dark)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div style={{ color: '#b45309' }}>
                  <tool.icon />
                </div>
                <h3
                  className="mt-3 text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {tool.title}
                </h3>
                <p
                  className="mt-1 text-[13px] leading-snug"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {tool.description}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
