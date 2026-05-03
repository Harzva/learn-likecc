import { motion } from 'framer-motion';

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
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-1"
      style={{ width: 'auto' }}
    >
      {navItems.map((item) => {
        const sectionId = item === '模拟器' ? 'simulator' : item;
        const isActive = activeSection === sectionId;
        return (
          <button
            key={item}
            onClick={() => handleClick(item)}
            className="px-4 py-2 rounded-md text-[14px] transition-all duration-150 text-left whitespace-nowrap"
            style={{
              backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: isActive ? 500 : 400,
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
