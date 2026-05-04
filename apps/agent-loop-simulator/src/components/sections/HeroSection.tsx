import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="pt-28 pb-10 px-6">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.1 }}
          className="mb-6"
        >
          <button
            onClick={() => { window.location.href = '../topic-cc-loop-lab.html'; }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{
              backgroundColor: 'rgba(234, 88, 12, 0.1)',
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
            }}
          >
            <ArrowLeft size={14} />
            返回 Learn LikeCode
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.15,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
          }}
          className="text-[clamp(2.25rem,5vw,3.7rem)] font-extrabold leading-tight mb-4"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
        >
          Agent Loop 动态模拟器
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-[17px] leading-relaxed max-w-[760px]"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
        >
          用一条可交互的 12 步回放，拆开 Agent 从用户输入、模型请求、工具调用到最终回答的完整循环。左侧追踪消息流转，右侧同步回放终端状态；点击任意消息块可查看对应的 prompt / JSON payload。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.42 }}
          className="mt-5 grid max-w-[920px] gap-3 md:grid-cols-3"
        >
          {[
            ['动态回放', '用剧情化步骤理解 loop 的形态'],
            ['Trace 反哺', '下一步接入真实 trace 生成步骤'],
            ['工具链视角', '把 tool_use / tool_result 显式串起来'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.62)' }}>
              <div className="text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>{title}</div>
              <div className="mt-1 text-[12px]" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
