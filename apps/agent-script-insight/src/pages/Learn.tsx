import { motion } from 'framer-motion';
import { modules } from '@/data/modules';
import ModuleSidebar from '@/components/ModuleSidebar';
import ArrowRightIcon from '@/components/icons/ArrowRightIcon';

const difficultyColors: Record<
  string,
  { bg: string; text: string }
> = {
  Beginner: { bg: '#dcfce7', text: '#166534' },
  Intermediate: { bg: '#fef9c3', text: '#a16207' },
  Advanced: { bg: '#fee2e2', text: '#dc2626' },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

export default function Learn() {
  return (
    <div className="relative">
      {/* Sidebar */}
      <ModuleSidebar currentPath="/learn" />

      {/* Main content */}
      <div className="lg:ml-[280px]">
        <div className="px-4 py-12 sm:px-6 lg:px-8 lg:py-12" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <div className="mx-auto max-w-[920px]">
            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                delay: 0.1,
              }}
              className="mb-8"
            >
              <h1
                className="font-playfair text-[42px] font-bold"
                style={{
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.015em',
                }}
              >
                Learning Modules
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  delay: 0.2,
                }}
                className="mt-3 max-w-[640px] text-[17px] leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Master Claude Code through 12 interactive modules. Each module includes a guided tutorial, hands-on practice, and a quiz to test your knowledge.
              </motion.p>
            </motion.div>

            {/* Module cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {modules.map((mod, idx) => {
                const num = String(idx + 1).padStart(2, '0');
                const diff = difficultyColors[mod.difficulty] || difficultyColors.Beginner;

                return (
                  <motion.a
                    key={mod.id}
                    href={`#/learn/${mod.id}`}
                    variants={cardVariants}
                    whileHover={{
                      x: 4,
                      transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
                    }}
                    className="group flex cursor-pointer items-center gap-4 rounded-[10px] border bg-white p-5 transition-all duration-250 sm:gap-5 sm:px-6"
                    style={{
                      borderColor: 'var(--border-color)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-amber)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(180,83,9,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Number circle */}
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border sm:h-[36px] sm:w-[36px]"
                      style={{
                        backgroundColor: 'var(--cream-dark)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {num}
                      </span>
                    </div>

                    {/* Center content */}
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-[18px] font-semibold"
                        style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}
                      >
                        {mod.title}
                      </h3>
                      <p
                        className="mt-0.5 line-clamp-1 text-[13px]"
                        style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
                      >
                        {mod.description}
                      </p>
                    </div>

                    {/* Right side: difficulty + duration + arrow */}
                    <div className="hidden shrink-0 items-center gap-3 sm:flex">
                      <span
                        className="rounded-full px-3 py-1 text-[12px] font-medium uppercase"
                        style={{ backgroundColor: diff.bg, color: diff.text }}
                      >
                        {mod.difficulty}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {mod.duration}
                      </span>
                      <div
                        className="transition-transform duration-200 group-hover:translate-x-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        <ArrowRightIcon />
                      </div>
                    </div>

                    {/* Mobile: just the arrow */}
                    <div
                      className="shrink-0 transition-transform duration-200 group-hover:translate-x-1 sm:hidden"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <ArrowRightIcon />
                    </div>
                  </motion.a>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
