import { useState } from 'react';
import { motion } from 'framer-motion';
import { agentLoopSteps } from '../../data/simulatorData';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export default function AgentLoopSection() {
  const [activeStep, setActiveStep] = useState(0);
  const step = agentLoopSteps[activeStep];

  return (
    <section id="Agent循环" className="py-16 px-6" style={{ backgroundColor: 'var(--bg-dark)' }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <span className="text-[14px] font-medium" style={{ color: 'var(--primary)' }}>01</span>
          <h2 className="text-[36px] font-bold mt-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Agent 循环
            <span className="text-[24px] font-normal ml-3" style={{ color: 'var(--text-muted)' }}>(The Agent Loop)</span>
          </h2>
          <p className="text-[16px] mt-2" style={{ color: 'var(--text-secondary)' }}>
            从键盘按下到渲染响应，逐步穿越源码。
          </p>
        </motion.div>

        {/* Step flow diagram */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {agentLoopSteps.map((s, i) => {
              const isActive = i === activeStep;
              const isCompleted = i < activeStep;

              return (
                <div key={i} className="flex items-center flex-shrink-0">
                  {/* Circle */}
                  <button
                    onClick={() => setActiveStep(i)}
                    className="flex flex-col items-center transition-transform duration-150 hover:scale-110"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold transition-colors duration-200"
                      style={{
                        backgroundColor: isActive ? 'var(--primary)' : isCompleted ? 'rgba(234, 88, 12, 0.45)' : 'var(--bg-card)',
                        color: isActive || isCompleted ? '#ffffff' : 'var(--text-secondary)',
                        border: isActive || isCompleted ? 'none' : '2px solid var(--border)',
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      className="text-[13px] mt-2 whitespace-nowrap"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {s.label}
                    </span>
                  </button>

                  {/* Connecting line */}
                  {i < agentLoopSteps.length - 1 && (
                    <div
                      className="w-8 h-0.5 mx-2 mt-[-18px]"
                      style={{
                        backgroundColor: isCompleted ? 'var(--primary)' : 'var(--border)',
                        borderTop: isCompleted ? 'none' : '1px dashed var(--border)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Loop arrow visual */}
          <div className="flex justify-center mt-2">
            <svg width="200" height="30" className="opacity-40">
              <path
                d="M 10 5 Q 100 30 190 5"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                markerEnd="url(#loop-arrow)"
              />
              <defs>
                <marker id="loop-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <polygon points="0 0, 6 3, 0 6" fill="var(--primary)" />
                </marker>
              </defs>
            </svg>
          </div>
        </motion.div>

        {/* Content area */}
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[14px] font-semibold"
              style={{ background: 'var(--gradient-1)' }}
            >
              {activeStep + 1}
            </div>
            <h3 className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              {step.title}
            </h3>
            <a
              href="#"
              className="flex items-center gap-1 text-[12px] font-mono transition-colors hover:opacity-80"
              style={{ color: 'var(--primary)' }}
              onClick={(e) => e.preventDefault()}
            >
              <ExternalLink size={12} />
              {step.file}
            </a>
          </div>
          <p className="text-[16px] mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {step.desc}
          </p>
          <pre
            className="rounded-lg p-4 overflow-x-auto text-[13px] font-mono"
            style={{ backgroundColor: '#0f172a', color: '#e6e6e6', border: '1px solid #1e293b' }}
          >
            {step.code}
          </pre>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="p-2 rounded-md transition-all hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
              {activeStep + 1} / {agentLoopSteps.length}
            </span>
            <button
              onClick={() => setActiveStep((prev) => Math.min(agentLoopSteps.length - 1, prev + 1))}
              disabled={activeStep === agentLoopSteps.length - 1}
              className="p-2 rounded-md transition-all hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: 'var(--text-primary)' }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
