import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { hiddenFeatures } from '../../data/simulatorData';

export default function HiddenFeaturesSection() {
  return (
    <section id="扩展能力" className="py-16 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-[14px] font-medium" style={{ color: 'var(--primary)' }}>05</span>
          <h2 className="text-[36px] font-bold mt-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            扩展能力
            <span className="text-[24px] font-normal ml-3" style={{ color: 'var(--text-muted)' }}>(Extension Ideas)</span>
          </h2>
          <p className="text-[16px] mt-2" style={{ color: 'var(--text-secondary)' }}>
            从 Agent Loop 继续延伸的产品化方向：后台运行、远程控制、多 Agent 协同和会话记忆。
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {hiddenFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{
                y: -4,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              }}
              className="rounded-2xl p-6 relative cursor-default transition-shadow duration-250"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
              }}
            >
              <Sparkles
                size={16}
                className="absolute top-4 right-4"
                style={{ color: 'var(--primary)' }}
              />
              <h3 className="text-[18px] font-semibold mb-2 pr-6" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
