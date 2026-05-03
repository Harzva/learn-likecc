import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { thinkingWords } from '../data/simulatorData';

interface TerminalEmulatorProps {
  currentStep: number;
}

// Thinking word by step
function getThinkingWord(step: number): string {
  return thinkingWords[(step - 2) % thinkingWords.length] || 'Thinking...';
}

export default function TerminalEmulator({ currentStep }: TerminalEmulatorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep]);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col shadow-xl"
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(15, 23, 42, 0.92)',
        boxShadow: '0 20px 25px -5px rgba(234, 88, 12, 0.1), 0 10px 15px -3px rgba(15, 23, 42, 0.18)',
        minHeight: 640,
      }}
    >
      {/* Title bar */}
      <div
        className="h-9 flex items-center justify-between px-4"
        style={{ backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#febc2e' }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28c840' }} />
        </div>
        <span className="text-[12px] font-mono" style={{ color: '#94a3b8' }}>
          likecode — agent-loop-simulator
        </span>
        <span className="text-[12px] font-mono" style={{ color: '#94a3b8' }}>
          {currentStep}/12
        </span>
      </div>

      {/* Terminal content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed"
        style={{ color: '#e6e6e6', maxHeight: 584 }}
      >
        {/* Welcome screen */}
        <div
          className="rounded-lg p-4 mb-4"
          style={{ border: '1.5px dotted #334155' }}
        >
          <p className="text-center mb-1" style={{ color: '#e6e6e6' }}>── LikeCode Agent Loop ──</p>
          <p className="text-center mb-4" style={{ color: '#e6e6e6' }}>Interactive replay mode</p>
          <pre className="text-center text-[11px] leading-4 mb-4" style={{ color: '#94a3b8' }}>
            {`    /\\  /\\
   ( o)( o )
   |  __  |
    \\____/
   /      \\
  |  ____  |`}
          </pre>
          <p className="text-center text-[12px] mb-1" style={{ color: '#94a3b8' }}>
            model-router · tool loop demo
          </p>
          <p className="text-center text-[12px] mb-4" style={{ color: '#94a3b8' }}>
            /workspace/learn-likecc
          </p>
          <div className="flex justify-between text-[11px]" style={{ color: '#94a3b8' }}>
            <div>
              <p className="mb-1" style={{ color: '#e6e6e6', fontWeight: 600 }}>RECENT ACTIVITY</p>
              <p>2m ago Updated avatar...</p>
              <p>1h ago Analyzed tools...</p>
              <p>3d ago Added MCP notes...</p>
              <p>1w ago Refined loop...</p>
              <p>... /resume for more</p>
            </div>
            <div>
              <p className="mb-1" style={{ color: '#e6e6e6', fontWeight: 600 }}>WHAT'S NEW</p>
              <p>/skills for workflows</p>
              <p>/agents for sub tasks</p>
              <p>ctrl+b background run</p>
              <p>... /help for more</p>
            </div>
          </div>
        </div>

        {/* Step 1: User Input */}
        <AnimatePresence>
          {currentStep >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="mb-3"
            >
              <p>
                <span style={{ color: '#22c55e' }}>{'>'}</span>{' '}
                <span>请调整个人中心用户头像为圆形</span>
              </p>
              <p className="text-[12px]" style={{ color: '#94a3b8' }}>esc to interrupt</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Thinking spinner */}
        <AnimatePresence>
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="mb-3 flex items-center gap-2"
            >
              <ThinkingSpinner />
              <span style={{ color: '#94a3b8' }}>
                {getThinkingWord(2)} (5s · thinking)
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2+: Streaming block */}
        <AnimatePresence>
          {currentStep >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: '#fb923c' }}>◆</span>
                <span className="font-semibold">AGENT RUNTIME</span>
                {currentStep >= 2 && currentStep < 12 && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-sm"
                    style={{ backgroundColor: '#334155', color: '#f59e0b' }}
                  >
                    STREAMING
                  </span>
                )}
              </div>
              {currentStep >= 2 && currentStep < 3 && (
                <p>先定位头像组件文件，再读取确认样式实现。</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Glob + Grep tool calls (RUNNING) */}
        <AnimatePresence>
          {currentStep >= 3 && (
            <>
              <ToolCallBlock
                name="Glob"
                params='pattern: "**/{avatar,Avatar,profile,Profile}*.tsx"'
                status={currentStep >= 4 ? 'COMPLETED' : 'RUNNING'}
                delay={0}
              />
              <ToolCallBlock
                name="Grep"
                params='pattern: "avatar|头像", glob: "**/*.tsx", output_mode: "files_with_matches"'
                status={currentStep >= 4 ? 'COMPLETED' : 'RUNNING'}
                delay={0.08}
              />
            </>
          )}
        </AnimatePresence>

        {/* Step 4: Tool results */}
        <AnimatePresence>
          {currentStep >= 4 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-3"
              >
                <p style={{ color: '#22c55e' }}>▸ Glob result</p>
                <p style={{ color: '#22c55e' }}>app/components/profile/UserAvatar.tsx</p>
                <p style={{ color: '#22c55e' }}>app/components/profile/ProfileCard.tsx</p>
                <p style={{ color: '#22c55e' }}>app/components/profile/ProfileHeader.tsx</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                className="mb-3"
              >
                <p style={{ color: '#22c55e' }}>▸ Grep result</p>
                <p style={{ color: '#22c55e' }}>app/components/profile/UserAvatar.tsx</p>
                <p style={{ color: '#22c55e' }}>app/components/profile/ProfileCard.tsx</p>
                <p style={{ color: '#22c55e' }}>app/profile/page.tsx</p>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Step 5: Thinking */}
        <AnimatePresence>
          {currentStep >= 5 && currentStep < 6 && (
            <ThinkingBlock word={getThinkingWord(5)} />
          )}
        </AnimatePresence>

        {/* Step 6: Read tool */}
        <AnimatePresence>
          {currentStep >= 6 && (
            <ToolCallBlock
              name="Read"
              params='file_path: "app/components/profile/UserAvatar.tsx"'
              status={currentStep >= 7 ? 'COMPLETED' : 'RUNNING'}
              delay={0}
            />
          )}
        </AnimatePresence>

        {/* Step 7: Read result */}
        <AnimatePresence>
          {currentStep >= 7 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3"
            >
              <p style={{ color: '#22c55e' }}>▸ Read result</p>
              <div className="mt-1 pl-2" style={{ borderLeft: '2px solid #334155' }}>
                <p>
                  <span style={{ color: '#94a3b8' }}>1 </span>
                  <span style={{ color: '#60a5fa' }}>import</span>{' '}
                  <span>Image </span>
                  <span style={{ color: '#60a5fa' }}>from</span>{' '}
                  <span style={{ color: '#a5d6ff' }}>&quot;next/image&quot;</span>;
                </p>
                <p style={{ color: '#94a3b8' }}>...</p>
                <p>
                  <span style={{ color: '#94a3b8' }}>16 </span>
                  <span>className=</span>
                  <span style={{ color: '#a5d6ff' }}>&quot;relative overflow-hidden bg-gray-200&quot;</span>
                </p>
                <p style={{ color: '#94a3b8' }}>...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 8: Thinking */}
        <AnimatePresence>
          {currentStep >= 8 && currentStep < 9 && (
            <ThinkingBlock word={getThinkingWord(8)} />
          )}
        </AnimatePresence>

        {/* Step 9: Edit tool */}
        <AnimatePresence>
          {currentStep >= 9 && (
            <ToolCallBlock
              name="Edit"
              params={`old_string: "relative overflow-hidden bg-gray-200"\n    new_string: "relative overflow-hidden rounded-full bg-gray-200"`}
              status={currentStep >= 10 ? 'COMPLETED' : 'RUNNING'}
              delay={0}
            />
          )}
        </AnimatePresence>

        {/* Step 10: Edit result / diff */}
        <AnimatePresence>
          {currentStep >= 10 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3"
            >
              <p>
                <span style={{ color: '#fb923c' }}>●</span>{' '}
                <span style={{ color: '#fb923c' }}>Edit</span>
                <span style={{ color: '#94a3b8' }}> ( app/components/profile/UserAvatar.tsx )</span>
              </p>
              <p className="pl-4 text-[12px]" style={{ color: '#94a3b8' }}>
                └ Added 1 line, removed 1 line
              </p>
              <div className="mt-1 pl-4">
                <p>
                  <span style={{ color: '#94a3b8' }}>14 </span>
                  <span>return (</span>
                </p>
                <p>
                  <span style={{ color: '#94a3b8' }}>15 </span>
                  <span>{'  <div'}</span>
                </p>
                <p style={{ backgroundColor: '#3d0f15' }}>
                  <span style={{ color: '#94a3b8' }}>16 </span>
                  <span style={{ color: '#ef4444' }}>-   className=&quot;relative overflow-hidden bg-gray-200&quot;</span>
                </p>
                <p style={{ backgroundColor: '#0f3d1a' }}>
                  <span style={{ color: '#94a3b8' }}>16 </span>
                  <span style={{ color: '#22c55e' }}>+   className=&quot;relative overflow-hidden rounded-full bg-gray-200&quot;</span>
                </p>
                <p>
                  <span style={{ color: '#94a3b8' }}>17 </span>
                  <span>{'    style={{ width: size, height: size }}>'}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 11: Thinking */}
        <AnimatePresence>
          {currentStep >= 11 && currentStep < 12 && (
            <ThinkingBlock word={getThinkingWord(11)} />
          )}
        </AnimatePresence>

        {/* Step 12: Final response */}
        <AnimatePresence>
          {currentStep >= 12 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mb-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <span style={{ color: '#fb923c' }}>◆</span>
                <span className="font-semibold">AGENT RUNTIME</span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: '#334155', color: '#f59e0b' }}
                >
                  STREAMING
                </span>
              </div>
              <p className="mb-3">
                已完成修改。在 app/components/profile/UserAvatar.tsx 第 16 行的 className 中追加了 rounded-full，用户头像现在会显示为圆形。
              </p>
              <p className="mb-2 text-[12px]" style={{ color: '#94a3b8' }}>
                ⏎ (cost: $0.0038 · 4 turns · 11.6k tokens)
              </p>
              <p style={{ color: '#22c55e' }}>{'>'} end_turn — session complete</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToolCallBlock({ name, params, status, delay }: { name: string; params: string; status: 'RUNNING' | 'COMPLETED'; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay }}
      className="mb-2"
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span>
          <span style={{ color: '#fb923c' }}>●</span>{' '}
          <span style={{ color: '#fb923c', fontWeight: 700 }}>{name}</span>
          <span style={{ color: '#94a3b8' }}> ( {params} )</span>
        </span>
        <span
          className="text-[11px] px-2 py-0.5 rounded-sm font-medium transition-colors duration-300"
          style={{
            backgroundColor: status === 'RUNNING' ? '#3a3520' : '#1f3d25',
            color: status === 'RUNNING' ? '#f59e0b' : '#3fb950',
          }}
        >
          {status}
        </span>
      </div>
    </motion.div>
  );
}

function ThinkingBlock({ word }: { word: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-3 flex items-center gap-2"
    >
      <ThinkingSpinner />
      <span style={{ color: '#94a3b8' }}>{word} (5s · thinking)</span>
    </motion.div>
  );
}

function ThinkingSpinner() {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ backgroundColor: '#94a3b8' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
