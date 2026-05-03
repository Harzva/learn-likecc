import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { toolCategories } from '../../data/simulatorData';

const experimentalTools = new Set([
  'WebBrowser', 'ListPeers', 'VerifyPlanExecution',
  'RemoteTrigger', 'CronCreate', 'CronDelete', 'CronList', 'Snip', 'Workflow', 'TerminalCapture',
  'Sleep', 'SendUserMessage', 'StructuredOutput', 'LSP', 'SendUserFile', 'PushNotification', 'Monitor', 'SubscribePR',
]);

export default function ToolSystemSection() {
  return (
    <section id="工具系统" className="py-16 px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-[1200px] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <span className="text-[14px] font-medium" style={{ color: 'var(--primary)' }}>03</span>
          <h2 className="text-[36px] font-bold mt-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            工具系统
            <span className="text-[24px] font-normal ml-3" style={{ color: 'var(--text-muted)' }}>(Tool System)</span>
          </h2>
          <p className="text-[16px] mt-2" style={{ color: 'var(--text-secondary)' }}>
            Agent Runtime 可调用的内置工具，按职能分类。
          </p>
          <p className="text-[13px] mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            <Lock size={12} /> 表示实验性/特性门控工具
          </p>
        </motion.div>

        {/* Tool categories grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolCategories.map((cat, catIdx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.3, delay: catIdx * 0.06 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {cat.name}
                </span>
                <span
                  className="text-[11px] px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                >
                  {cat.tools.length}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {cat.tools.map((tool, toolIdx) => {
                  const isExp = experimentalTools.has(tool);
                  return (
                    <motion.div
                      key={tool}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: catIdx * 0.06 + toolIdx * 0.02 }}
                      className="rounded-lg px-3 py-2 text-[14px] font-mono transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md cursor-default"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        boxShadow: '0 1px 2px rgba(234, 88, 12, 0.06)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary-light)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <span className="flex items-center gap-1.5">
                        {tool}
                        {isExp && <Lock size={10} style={{ color: 'var(--text-muted)' }} />}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
