import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { commandCategories } from '../../data/simulatorData';

const experimentalCommands = new Set([
  '/output-style',
  '/autofix-pr', '/install-github-app', '/install-slack-app',
  '/backfill-sessions', '/break-cache', '/bridge-kick', '/mock-limits', '/reset-limits', '/bughunter', '/passes',
  '/ultraplan', '/remote-control', '/voice', '/desktop', '/chrome', '/mobile', '/stickers', '/good-agent',
]);

export default function CommandSection() {
  return (
    <section id="命令目录" className="py-16 px-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-[14px] font-medium" style={{ color: 'var(--primary)' }}>04</span>
          <h2 className="text-[36px] font-bold mt-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            命令目录
            <span className="text-[24px] font-normal ml-3" style={{ color: 'var(--text-muted)' }}>(Command Catalog)</span>
          </h2>
          <p className="text-[16px] mt-2" style={{ color: 'var(--text-secondary)' }}>
            Agent CLI 中常见的 slash 命令，按职能分类。
          </p>
        </motion.div>

        {/* Command categories */}
        <div className="space-y-8">
          {commandCategories.map((cat, catIdx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.3, delay: catIdx * 0.08 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-[3px] h-4 rounded-full"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {cat.name}
                </span>
                <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  ({cat.commands.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.commands.map((cmd, cmdIdx) => {
                  const isExp = experimentalCommands.has(cmd);
                  return (
                    <motion.span
                      key={cmd}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: cmdIdx * 0.02 }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[14px] font-mono cursor-default transition-all duration-150 hover:bg-[var(--bg-hover)] hover:border-[var(--primary-light)]"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 1px 2px rgba(234, 88, 12, 0.06)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {cmd}
                      {isExp && <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
