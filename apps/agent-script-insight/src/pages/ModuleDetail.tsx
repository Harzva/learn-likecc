import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { modules, getModuleById } from '@/data/modules';
import ModuleSidebar from '@/components/ModuleSidebar';
import ModuleContentRenderer from '@/components/ModuleContentRenderer';
import TerminalSimulator from '@/components/TerminalSimulator';
import Quiz from '@/components/Quiz';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';

const difficultyColors: Record<
  string,
  { bg: string; text: string }
> = {
  Beginner: { bg: '#dcfce7', text: '#166534' },
  Intermediate: { bg: '#fef9c3', text: '#a16207' },
  Advanced: { bg: '#fee2e2', text: '#dc2626' },
};

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const module = moduleId ? getModuleById(moduleId) : undefined;

  if (!module) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <div className="text-center">
          <h2
            className="text-[24px] font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Module not found
          </h2>
          <p className="mt-2 text-[15px]" style={{ color: 'var(--text-secondary)' }}>
            The module you are looking for does not exist.
          </p>
          <a
            href="#/learn"
            className="mt-4 inline-block rounded-lg px-6 py-2.5 text-[15px] font-medium text-white transition-all duration-200 hover:scale-[1.02]"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            Back to Learn
          </a>
        </div>
      </div>
    );
  }

  const moduleIndex = modules.findIndex((m) => m.id === moduleId);
  const moduleNumber = String(moduleIndex + 1).padStart(2, '0');
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;
  const diff = difficultyColors[module.difficulty] || difficultyColors.Beginner;

  return (
    <div className="relative">
      {/* Sidebar */}
      <ModuleSidebar activeModuleId={moduleId} currentPath="/learn/:moduleId" />

      {/* Mobile modules trigger bar */}
      <div className="sticky top-16 z-40 border-b px-4 py-2 lg:hidden" style={{ backgroundColor: 'var(--cream-dark)', borderColor: 'var(--border-color)' }}>
        <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>
          Module {moduleNumber}: {module.title}
        </span>
      </div>

      {/* Main layout: content + right sidebar */}
      <div className="lg:ml-[280px]">
        <div className="mx-auto max-w-[1120px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-8 xl:flex-row">
            {/* Main content area */}
            <div className="min-w-0 flex-1">
              {/* Breadcrumb */}
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="mb-6 flex items-center gap-2 text-[13px] font-medium"
              >
                <a
                  href="#/"
                  className="transition-colors duration-200 hover:text-[var(--accent-amber)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Home
                </a>
                <span style={{ color: 'var(--text-tertiary)' }}>/</span>
                <a
                  href="#/learn"
                  className="transition-colors duration-200 hover:text-[var(--accent-amber)]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Learn
                </a>
                <span style={{ color: 'var(--text-tertiary)' }}>/</span>
                <span style={{ color: 'var(--text-primary)' }}>{module.title}</span>
              </motion.nav>

              {/* Module header */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                {/* Number badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                    delay: 0.1,
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: 'var(--cream-dark)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span
                    className="text-[24px] font-bold"
                    style={{ color: 'var(--text-primary)', lineHeight: 1.3, letterSpacing: '-0.005em' }}
                  >
                    {moduleNumber}
                  </span>
                </motion.div>

                {/* Title block */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    delay: 0.15,
                  }}
                  className="min-w-0 flex-1"
                >
                  <h1
                    className="font-playfair text-[32px] font-bold"
                    style={{
                      color: 'var(--text-primary)',
                      lineHeight: 1.15,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {module.title}
                  </h1>
                  <p
                    className="mt-1 text-[15px]"
                    style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}
                  >
                    {module.description}
                  </p>
                </motion.div>

                {/* Meta tags */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="flex shrink-0 items-center gap-3"
                >
                  <span
                    className="rounded-full px-3 py-1 text-[12px] font-medium uppercase"
                    style={{ backgroundColor: diff.bg, color: diff.text }}
                  >
                    {module.difficulty}
                  </span>
                  <span
                    className="flex items-center gap-1 text-[13px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {module.duration}
                  </span>
                </motion.div>
              </div>

              {/* Module content */}
              <div className="mb-12">
                <ModuleContentRenderer content={module.content} />
              </div>

              {/* Bottom navigation */}
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="mt-12 flex items-center justify-between border-t pt-6"
                style={{ borderColor: 'var(--border-color)' }}
              >
                {prevModule ? (
                  <a
                    href={`#/learn/${prevModule.id}`}
                    className="flex items-center gap-2 text-[15px] font-medium transition-colors duration-200 hover:text-[var(--accent-amber)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <ArrowRightIcon className="rotate-180" />
                    {prevModule.title}
                  </a>
                ) : (
                  <div />
                )}
                {nextModule ? (
                  <a
                    href={`#/learn/${nextModule.id}`}
                    className="flex items-center gap-2 text-[15px] font-medium transition-colors duration-200 hover:text-[var(--accent-amber)]"
                    style={{ color: 'var(--accent-amber)' }}
                  >
                    {nextModule.title}
                    <ArrowRightIcon />
                  </a>
                ) : (
                  <div />
                )}
              </motion.nav>
            </div>

            {/* Right sidebar (terminals + quiz) */}
            <aside className="w-full shrink-0 xl:w-[380px]">
              <div className="xl:sticky xl:top-[80px]">
                {/* Guided Tutorial Terminal */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    delay: 0.2,
                  }}
                >
                  <h3
                    className="mb-3 text-[18px] font-semibold"
                    style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}
                  >
                    Guided Tutorial
                  </h3>
                  <TerminalSimulator
                    mode="guided"
                    steps={module.terminalSteps}
                    title="Claude Code \u2014 Guided Tutorial"
                    height="320px"
                  />
                </motion.div>

                {/* Free Type Terminal */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                    delay: 0.3,
                  }}
                  className="mt-6"
                >
                  <h3
                    className="mb-3 text-[18px] font-semibold"
                    style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}
                  >
                    Free Type Practice
                  </h3>
                  <TerminalSimulator
                    mode="free"
                    title="Claude Code \u2014 Free Type"
                    height="260px"
                  />
                </motion.div>

                {/* Quiz */}
                <Quiz questions={module.quiz} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
