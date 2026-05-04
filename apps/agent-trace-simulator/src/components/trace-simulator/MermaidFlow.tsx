import { useEffect, useId, useState } from 'react';
import { ChevronRight, GitBranch } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MermaidFlow({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, '');
  const [expanded, setExpanded] = useState(false);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    if (!expanded) return undefined;

    let cancelled = false;
    import('mermaid')
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            primaryColor: '#fff7ed',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#fb923c',
            lineColor: '#fb923c',
            secondaryColor: '#eff6ff',
            tertiaryColor: '#f5f3ff',
            fontFamily: 'Geist, Microsoft YaHei, sans-serif',
          },
        });
        return mermaid.render(`prompt-flow-${id}`, chart);
      })
      .then((result) => {
        if (!cancelled) {
          setSvg(result.svg);
          setError('');
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSvg('');
          setError(err instanceof Error ? err.message : 'Failed to render Mermaid chart.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [chart, expanded, id]);

  return (
    <section className="mb-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: '#fffaf3' }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="flex min-w-0 items-center gap-2 text-left text-[13px] font-semibold" onClick={() => setExpanded((value) => !value)} style={{ color: 'var(--text-primary)' }}>
          <span className="shrink-0 transition-transform" style={{ color: 'var(--primary)', transform: expanded ? 'rotate(90deg)' : undefined }}>
            <ChevronRight size={15} />
          </span>
          <GitBranch size={15} style={{ color: 'var(--primary)' }} />
          <span>Mermaid flowchart</span>
        </button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => setExpanded((value) => !value)}>
            {expanded ? 'Collapse graph' : 'Load graph'}
          </Button>
          {expanded ? (
            <Button variant="secondary" className="h-8 px-3 text-[12px]" onClick={() => setShowSource((value) => !value)}>
              {showSource ? 'Hide source' : 'Show source'}
            </Button>
          ) : null}
        </div>
      </div>

      {!expanded ? (
        <div className="mt-3 rounded-lg border border-dashed bg-white p-4 text-[12px] leading-relaxed" style={{ borderColor: 'rgba(234,88,12,0.28)', color: 'var(--text-muted)' }}>
          流程图作为补充阅读默认不加载。展开后才会下载 Mermaid，并把 request 组装关系渲染成图，避免它抢占首屏资源。
        </div>
      ) : (
        <>
          <div className="agent-loop-terminal-scroll mt-3 overflow-auto rounded-lg border bg-white p-3" style={{ borderColor: 'rgba(234,88,12,0.28)' }}>
            {error ? (
              <pre className="whitespace-pre-wrap text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {error}
              </pre>
            ) : svg ? (
              <div className="min-w-[760px]" dangerouslySetInnerHTML={{ __html: svg }} />
            ) : (
              <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Loading Mermaid renderer...
              </div>
            )}
          </div>
          {showSource ? (
            <pre
              className="agent-loop-terminal-scroll mt-3 max-h-[280px] overflow-auto whitespace-pre-wrap rounded-lg border p-3 text-[12px]"
              style={{ backgroundColor: '#0f172a', color: '#e6e6e6', borderColor: 'rgba(51,65,85,0.9)' }}
            >
              {chart}
            </pre>
          ) : null}
        </>
      )}
    </section>
  );
}
