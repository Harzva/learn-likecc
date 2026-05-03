import LogoIcon from './icons/LogoIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';

const navLinks = [
  { label: 'Learn', href: '#/learn' },
  { label: 'Playground', href: '#/playground' },
  { label: 'Config Builder', href: '#/build' },
  { label: 'Cheat Sheet', href: '#/reference' },
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: 'var(--border-color)',
        padding: '48px 0 32px',
      }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 md:grid-cols-3">
        {/* Left: Logo + tagline */}
        <div>
          <a href="#/" className="flex items-center gap-2">
            <LogoIcon />
            <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Learn LikeCode · Script Insight
            </span>
          </a>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Interactive command scripts, config builders, and terminal drills.
          </p>
        </div>

        {/* Center: Nav links */}
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium transition-colors duration-200 hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Inspired by */}
        <div>
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Inspired by{' '}
          </span>
          <a
            href="https://github.com/luongnv89/claude-howto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] font-medium transition-colors duration-200 hover:opacity-70"
            style={{ color: 'var(--accent-amber)' }}
          >
            Learn LikeCode
            <ExternalLinkIcon />
          </a>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-8 text-center text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
        &copy; 2026 Learn LikeCode &middot; Agent Script Insight
      </div>
    </footer>
  );
}
