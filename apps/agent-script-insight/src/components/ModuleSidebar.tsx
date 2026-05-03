import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { modules } from '@/data/modules';
import MenuIcon from './icons/MenuIcon';

interface ModuleSidebarProps {
  activeModuleId?: string;
  currentPath?: string; // '/learn' or '/learn/:moduleId'
}

export default function ModuleSidebar({ activeModuleId }: ModuleSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const activeId = activeModuleId;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Section header with collapse toggle */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h3
          className="text-[18px] font-semibold"
          style={{ color: 'var(--text-primary)', lineHeight: 1.35 }}
        >
          Modules
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1 transition-colors duration-200 hover:bg-[var(--cream)]"
          aria-label={expanded ? 'Collapse modules' : 'Expand modules'}
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(90deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Module nav items */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-1"
        >
          {modules.map((mod, idx) => {
            const isActive = mod.id === activeId;
            const num = String(idx + 1).padStart(2, '0');

            return (
              <a
                key={mod.id}
                href={`#/learn/${mod.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200"
                style={{
                  color: isActive ? 'var(--accent-amber)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'var(--accent-amber-light)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-amber)' : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--cream)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* Number circle */}
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold"
                  style={{
                    backgroundColor: 'var(--cream)',
                    borderColor: 'var(--border-color)',
                    color: isActive ? 'var(--accent-amber)' : 'var(--text-primary)',
                  }}
                >
                  {num}
                </span>
                {/* Module title */}
                <span className="truncate">{mod.title}</span>
              </a>
            );
          })}
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile: hamburger trigger below main nav */}
      <div className="sticky top-16 z-40 border-b px-4 py-2 lg:hidden" style={{ backgroundColor: 'var(--cream-dark)', borderColor: 'var(--border-color)' }}>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-200"
              style={{ color: 'var(--text-primary)', backgroundColor: 'var(--cream)' }}
            >
              <MenuIcon />
              <span>Modules</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] p-4"
            style={{ backgroundColor: 'var(--cream-dark)', borderRight: '1px solid var(--border-color)' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-[18px] font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Modules
              </h3>
            </div>
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: fixed sidebar */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        className="fixed bottom-0 left-0 top-16 hidden w-[280px] overflow-y-auto border-r lg:block"
        style={{
          backgroundColor: 'var(--cream-dark)',
          borderColor: 'var(--border-color)',
          padding: '24px 16px',
        }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
