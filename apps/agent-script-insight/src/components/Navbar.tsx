import { useState } from 'react';
import { useDarkMode } from './DarkModeContext';
import LogoIcon from './icons/LogoIcon';
import MoonIcon from './icons/MoonIcon';
import SunIcon from './icons/SunIcon';
import MenuIcon from './icons/MenuIcon';
import CloseIcon from './icons/CloseIcon';

const navLinks = [
  { label: 'Learn', href: '#/learn' },
  { label: 'Playground', href: '#/playground' },
  { label: 'Config Builder', href: '#/build' },
  { label: 'Cheat Sheet', href: '#/reference' },
];

function isActive(href: string) {
  const clean = href.replace('/#', '');
  return window.location.hash === clean;
}

export default function Navbar() {
  const { isDark, toggle } = useDarkMode();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav
        className="sticky top-0 z-50 h-16 border-b border-[var(--border-color)]"
        style={{ backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(12px)' }}
      >
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
          {/* Logo */}
          <a href="#/" className="flex items-center gap-2">
            <LogoIcon />
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Learn LikeCode · Script Insight
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-[13px] font-medium transition-all duration-200"
                  style={{
                    color: active ? 'var(--accent-amber)' : 'var(--text-primary)',
                    backgroundColor: active ? 'var(--accent-amber-light)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Right side: Language + Dark mode */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              className="text-[13px] font-medium transition-colors duration-200"
              style={{ color: 'var(--text-secondary)' }}
            >
              CC
            </button>
            <button
              onClick={toggle}
              className="rounded-md p-1.5 transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
              aria-label="Toggle dark mode"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex items-center md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            style={{ color: 'var(--text-primary)' }}
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            className="absolute right-0 top-0 flex h-full w-[280px] flex-col gap-2 p-4"
            style={{
              backgroundColor: 'var(--cream)',
              borderLeft: '1px solid var(--border-color)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{ color: 'var(--text-primary)' }}
              >
                <CloseIcon />
              </button>
            </div>
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-4 py-2.5 text-[14px] font-medium transition-all duration-200"
                  style={{
                    color: active ? 'var(--accent-amber)' : 'var(--text-primary)',
                    backgroundColor: active ? 'var(--accent-amber-light)' : 'transparent',
                  }}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="mt-4 flex items-center gap-3 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
              <button
                className="text-[13px] font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                EN
              </button>
              <button
                onClick={() => {
                  toggle();
                  setMobileOpen(false);
                }}
                className="rounded-md p-1.5"
                style={{ color: 'var(--text-primary)' }}
                aria-label="Toggle dark mode"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
