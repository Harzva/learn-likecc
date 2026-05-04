import { motion } from 'framer-motion';

const navLinks = [
  { label: '仿真大专题', href: '../topic-cc-loop-lab.html' },
  { label: 'Trace 仿真器', href: '../agent-trace-simulator/' },
  { label: '脚本启示', href: '../agent-script-insight/' },
  { label: 'Agent Loop', href: '#simulator', active: true },
  { label: '工具系统', href: '#工具系统' },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 flex min-h-16 items-center justify-between gap-3 px-4 py-3 backdrop-blur-md sm:px-6 lg:left-[176px]"
      style={{
        backgroundColor: 'rgba(255, 251, 245, 0.92)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(30, 41, 59, 0.05)',
      }}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: 'var(--gradient-1)' }}>
          LC
        </div>
        <div className="hidden min-w-0 items-center gap-2 xl:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="cursor-pointer rounded-md px-2 py-1 text-[14px] transition-colors duration-150 hover:bg-[var(--bg-hover)]"
              style={{
                color: link.active ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: link.active ? 700 : 400,
              }}
            >
              {link.label}
              {link.active && (
                <span className="block h-0.5 w-4 mx-auto mt-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
              )}
            </a>
          ))}
        </div>
      </div>
      <a
        href="../topic-cc-loop-lab.html"
        className="shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all duration-150 hover:scale-105 hover:opacity-90"
        style={{ background: 'var(--gradient-1)', boxShadow: 'var(--shadow)' }}
      >
        Loop Lab
      </a>
    </motion.nav>
  );
}
