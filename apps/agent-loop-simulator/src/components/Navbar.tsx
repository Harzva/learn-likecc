import { motion } from 'framer-motion';

const navLinks = [
  { label: '首页', href: 'https://harzva.github.io/learn-likecc/' },
  { label: '教程', href: 'https://harzva.github.io/learn-likecc/tutorial.html' },
  { label: 'Source Map', href: 'https://harzva.github.io/learn-likecc/topic-sourcemap.html' },
  { label: 'Agent Loop', href: '#simulator', active: true },
  { label: '工具系统', href: '#工具系统' },
];

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(255, 251, 245, 0.92)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 3px rgba(30, 41, 59, 0.05)',
      }}
    >
      <div className="flex items-center gap-6">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-1)' }}>
          LC
        </div>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] cursor-pointer transition-colors duration-150 hover:bg-[var(--bg-hover)] px-2 py-1 rounded-md"
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
        href="https://github.com/Harzva/learn-likecc"
        className="text-white rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-150 hover:opacity-90 hover:scale-105"
        style={{ background: 'var(--gradient-1)', boxShadow: 'var(--shadow)' }}
      >
        GitHub
      </a>
    </motion.nav>
  );
}
