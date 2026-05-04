import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Activity, Braces, Home, Layers3 } from 'lucide-react';

const navItems = ['模拟器', 'Agent循环', '工具系统', '命令目录', '扩展能力'];

interface SidebarNavProps {
  activeSection: string;
}

export default function SidebarNav({ activeSection }: SidebarNavProps) {
  const handleClick = (item: string) => {
    const sectionId = item === '模拟器' ? 'simulator' : item;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="fixed bottom-0 left-0 top-0 z-40 hidden w-[176px] flex-col border-r px-3 pb-4 pt-20 lg:flex"
      style={{ backgroundColor: 'rgba(255,251,245,0.94)', borderColor: 'var(--border)' }}
    >
      <div className="mb-4 rounded-lg border p-3" style={{ borderColor: 'var(--border)', backgroundColor: '#ffffff' }}>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md" style={{ backgroundColor: 'rgba(234,88,12,0.12)', color: 'var(--primary)' }}>
            <Activity size={16} />
          </span>
          <div>
            <div className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Loop</div>
            <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>动态回放</div>
          </div>
        </div>
      </div>

      <nav className="mb-4 grid gap-1 text-[13px]" aria-label="仿真专题">
        <SideLink href="../topic-cc-loop-lab.html" label="专题总入口" icon={<Home size={14} />} />
        <SideLink href="../agent-trace-simulator/" label="Trace 仿真器" icon={<Layers3 size={14} />} />
        <SideLink href="../agent-script-insight/" label="脚本启示" icon={<Braces size={14} />} />
      </nav>

      <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-muted)' }}>
        页面章节
      </div>
      {navItems.map((item) => {
        const sectionId = item === '模拟器' ? 'simulator' : item;
        const isActive = activeSection === sectionId;
        return (
          <button
            key={item}
            onClick={() => handleClick(item)}
            className="rounded-md px-3 py-2 text-left text-[13px] transition-all duration-150"
            style={{
              backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: isActive ? 700 : 500,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item}
          </button>
        );
      })}
    </motion.div>
  );
}

function SideLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 font-medium transition-colors hover:bg-[var(--bg-hover)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      <span className="shrink-0" style={{ color: 'var(--primary)' }}>{icon}</span>
      <span className="min-w-0 truncate">{label}</span>
    </a>
  );
}
