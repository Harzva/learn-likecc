import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { sections, workflows, sectionAnchors } from '../data/cheatSheetData';
import CopyIcon from '../components/icons/CopyIcon';
import PrintIcon from '../components/icons/PrintIcon';
import SearchIcon from '../components/icons/SearchIcon';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ─── Print Styles ─── */
function PrintStyles() {
  return (
    <style>{`
      @media print {
        nav, footer, .cs-toc-sidebar, .cs-no-print {
          display: none !important;
        }
        .cs-page-content {
          margin-left: 0 !important;
          max-width: 100% !important;
          padding: 0 !important;
        }
        .cs-section-card {
          break-inside: avoid;
          page-break-inside: avoid;
          break-after: auto;
          page-break-after: auto;
          margin-bottom: 16px !important;
          border: 1px solid #ccc !important;
          box-shadow: none !important;
          background: #ffffff !important;
        }
        .cs-workflow-card {
          break-inside: avoid;
          page-break-inside: avoid;
          margin-bottom: 12px !important;
          border: 1px solid #ccc !important;
        }
        body {
          background: #ffffff !important;
          color: #000000 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .cs-command-name {
          color: #000000 !important;
        }
        .cs-page-header::before {
          content: "Claude Code Cheat Sheet \u2014 claude.nagdy.me";
          display: block;
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 8px;
        }
        .cs-print-header {
          display: block !important;
        }
        .cs-example-box {
          border: 1px dashed #999 !important;
          background: #f9f9f9 !important;
        }
        .cs-key-badge {
          border: 1px solid #999 !important;
          background: #f0f0f0 !important;
          color: #000 !important;
          box-shadow: none !important;
        }
        a {
          color: #000 !important;
          text-decoration: underline !important;
        }
        @page {
          margin: 1.5cm;
        }
      }
    `}</style>
  );
}

/* ─── Fade-in Animation Wrapper ─── */
function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'none';
  className?: string;
}) {
  const initialY = direction === 'up' ? 25 : 0;
  const initialX = direction === 'left' ? -15 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: initialY, x: initialX }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.6, ease: easeOutExpo, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Staggered Section Wrapper ─── */
function StaggerSection({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: easeOutExpo, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Copy Button ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: silently ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="cs-copy-btn ml-2 flex h-7 w-7 items-center justify-center rounded-md transition-all duration-200 hover:bg-[var(--cream-dark)] print:hidden"
      style={{ opacity: copied ? 1 : undefined }}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <CopyIcon />
      )}
    </button>
  );
}

/* ─── Command Row ─── */
function CommandRow({
  name,
  description,
  example,
}: {
  name: string;
  description: string;
  example?: string;
}) {
  return (
    <div className="group relative border-b border-[var(--border-color)] py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <code
          className="cs-command-name min-w-[180px] shrink-0 pt-0.5 font-mono text-[14px] font-medium"
          style={{ color: 'var(--accent-amber)' }}
        >
          {name}
        </code>
        <span
          className="flex-1 text-[15px] leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {description}
        </span>
        <div className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 print:hidden">
          <CopyButton text={name} />
        </div>
      </div>
      {example && (
        <div
          className="cs-example-box ml-[192px] mt-2 rounded-md border border-dashed px-3 py-2 print:ml-0"
          style={{ borderColor: 'var(--border-dark)', backgroundColor: 'var(--cream)' }}
        >
          <span className="text-[12px] font-medium uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Example:
          </span>
          <code
            className="ml-2 font-mono text-[13px]"
            style={{ color: 'var(--text-primary)' }}
          >
            {example}
          </code>
        </div>
      )}
    </div>
  );
}

/* ─── Section Card ─── */
function SectionCard({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="cs-section-card scroll-mt-[100px]">
      <div
        className="rounded-xl border bg-white p-6"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h2
          className="mb-4 text-[24px] font-semibold"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            color: 'var(--text-primary)',
            lineHeight: 1.3,
            letterSpacing: '-0.005em',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/* ─── Workflow Card ─── */
function WorkflowCard({ workflow }: { workflow: typeof workflows[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="cs-workflow-card rounded-xl border bg-white"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors duration-200 hover:bg-[var(--cream-dark)] rounded-xl"
      >
        <span
          className="text-[18px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {workflow.title}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: 'var(--text-secondary)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="overflow-hidden"
      >
        <div className="space-y-3 px-6 pb-5">
          {workflow.steps.map((step) => (
            <div key={step.step} className="flex items-start gap-4">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold"
                style={{
                  backgroundColor: 'var(--cream-dark)',
                  color: 'var(--text-primary)',
                }}
              >
                {step.step}
              </div>
              <div className="flex-1">
                <code
                  className="font-mono text-[13px] font-medium"
                  style={{ color: 'var(--accent-amber)' }}
                >
                  {step.command}
                </code>
                <span
                  className="ml-2 text-[14px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Table of Contents ─── */
function TableOfContents({ activeSection }: { activeSection: string }) {
  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <aside className="cs-toc-sidebar hidden w-[240px] shrink-0 lg:block">
      <div
        className="sticky top-[100px] rounded-[10px] border p-4"
        style={{
          backgroundColor: 'var(--cream-dark)',
          borderColor: 'var(--border-color)',
        }}
      >
        <h3
          className="mb-3 text-[18px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          On this page
        </h3>
        <nav className="flex flex-col">
          {sectionAnchors.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleClick(section.id)}
                className="text-left text-[13px] font-medium transition-all duration-200"
                style={{
                  padding: '6px 0',
                  paddingLeft: isActive ? '8px' : '0',
                  borderLeft: isActive
                    ? '2px solid var(--accent-amber)'
                    : '2px solid transparent',
                  color: isActive
                    ? 'var(--accent-amber)'
                    : 'var(--text-secondary)',
                }}
              >
                {section.title}
              </button>
            );
          })}
          <button
            onClick={() => handleClick('workflows')}
            className="text-left text-[13px] font-medium transition-all duration-200"
            style={{
              padding: '6px 0',
              paddingLeft: activeSection === 'workflows' ? '8px' : '0',
              borderLeft:
                activeSection === 'workflows'
                  ? '2px solid var(--accent-amber)'
                  : '2px solid transparent',
              color:
                activeSection === 'workflows'
                  ? 'var(--accent-amber)'
                  : 'var(--text-secondary)',
            }}
          >
            Common Workflows
          </button>
        </nav>
      </div>
    </aside>
  );
}

/* ─── Main Page Component ─── */
export default function CheatSheet() {
  const [activeSection, setActiveSection] = useState(sectionAnchors[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  /* IntersectionObserver to track active section */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );

    // Observe all section elements
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    const workflowEl = document.getElementById('workflows');
    if (workflowEl) observer.observe(workflowEl);

    return () => observer.disconnect();
  }, []);

  /* Handle print */
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  /* Filter sections by search */
  const filteredSections = searchQuery.trim()
    ? sections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.items.length > 0)
    : sections;

  const hasWorkflowMatch =
    !searchQuery.trim() ||
    workflows.some((w) =>
      w.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 print:max-w-full print:px-0 print:py-0">
      <PrintStyles />

      {/* ── Print Header ── */}
      <div className="cs-print-header mb-4 hidden border-b pb-4 text-center text-[12px] print:block" style={{ borderColor: '#ccc', color: '#666' }}>
        Claude Code Cheat Sheet — claude.nagdy.me
      </div>

      {/* ── Page Header ── */}
      <header className="cs-page-header mb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <FadeIn delay={0.1}>
              <h1
                className="font-playfair text-[42px] font-bold md:text-[32px] lg:text-[42px]"
                style={{
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.015em',
                }}
              >
                Cheat Sheet
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p
                className="mt-2 max-w-[560px] text-[15px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Keep the Claude Code commands, shortcuts, files, and workflow
                reminders you use most in one printable place.
              </p>
            </FadeIn>
            <FadeIn delay={0.25}>
              <a
                href="#/learn"
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium transition-colors duration-200 hover:opacity-70"
                style={{ color: 'var(--accent-amber)' }}
              >
                Need the full searchable list instead?
                <span className="ml-1 inline-flex items-center gap-1">
                  Open the feature index
                  <ArrowRightIcon />
                </span>
              </a>
            </FadeIn>
          </div>
          <FadeIn delay={0.3} direction="none">
            <button
              onClick={handlePrint}
              className="cs-no-print inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--cream-dark)]"
              style={{
                borderColor: 'var(--border-dark)',
                color: 'var(--text-primary)',
              }}
            >
              <PrintIcon />
              Print this page
            </button>
          </FadeIn>
        </div>

        {/* Search */}
        <FadeIn delay={0.35}>
          <div className="mt-6">
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
              style={{
                borderColor: 'var(--border-dark)',
                backgroundColor: '#ffffff',
              }}
            >
              <SearchIcon />
              <input
                type="text"
                placeholder="Search commands, shortcuts, flags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-[14px] outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </FadeIn>
      </header>

      {/* ── Two-Column Layout ── */}
      <div className="flex gap-8">
        {/* TOC Sidebar */}
        <FadeIn delay={0.2} direction="left">
          <TableOfContents activeSection={activeSection} />
        </FadeIn>

        {/* Main Content */}
        <div className="cs-page-content min-w-0 flex-1">
          <div className="space-y-8">
            {/* Sections */}
            {filteredSections.map((section, index) => (
              <StaggerSection key={section.id} delay={index * 0.08}>
                <SectionCard id={section.id} title={section.title}>
                  {section.items.map((item) => (
                    <CommandRow
                      key={item.name}
                      name={item.name}
                      description={item.description}
                      example={item.example}
                    />
                  ))}
                </SectionCard>
              </StaggerSection>
            ))}

            {/* Workflows */}
            {hasWorkflowMatch && !searchQuery.trim() && (
              <StaggerSection delay={sections.length * 0.08}>
                <div id="workflows" className="scroll-mt-[100px]">
                  <div
                    className="cs-section-card rounded-xl border bg-white p-6"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <h2
                      className="mb-5 text-[24px] font-semibold"
                      style={{
                        fontFamily: "'Inter', system-ui, sans-serif",
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                        letterSpacing: '-0.005em',
                      }}
                    >
                      Common Workflows
                    </h2>
                    <div className="space-y-4">
                      {workflows.map((workflow) => (
                        <WorkflowCard
                          key={workflow.id}
                          workflow={workflow}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </StaggerSection>
            )}

            {/* Empty state for search */}
            {filteredSections.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <p
                  className="text-[16px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  No results found for &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-[14px] font-medium"
                  style={{ color: 'var(--accent-amber)' }}
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
