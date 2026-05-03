import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CopyIcon from '@/components/icons/CopyIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import DownloadIcon from '@/components/icons/DownloadIcon';
import { configTemplates } from '@/data/configTemplates';

type TabId = 'claude-md' | 'skill' | 'agent' | 'hook' | 'mcp' | 'plugin';

interface Tab {
  id: TabId;
  label: string;
  description: string;
}

const tabs: Tab[] = [
  { id: 'claude-md', label: 'CLAUDE.md', description: 'Project context and conventions file' },
  { id: 'skill', label: 'Skill', description: 'Reusable skill definitions' },
  { id: 'agent', label: 'Agent', description: 'Subagent configuration' },
  { id: 'hook', label: 'Hook', description: 'Pre/post command hooks' },
  { id: 'mcp', label: 'MCP', description: 'Model Context Protocol server setup' },
  { id: 'plugin', label: 'Plugin', description: 'Plugin configuration' },
];

// ---- Form field types ----

interface ClaudeMdForm {
  projectName: string;
  techStack: string;
  testCommand: string;
  buildCommand: string;
  lintCommand: string;
  codeConventions: string;
  customInstructions: string;
}

interface SkillForm {
  name: string;
  description: string;
  scope: string;
  guidelines: string;
}

interface AgentForm {
  name: string;
  description: string;
  systemPrompt: string;
  tools: string;
}

interface HookForm {
  name: string;
  event: string;
  command: string;
}

interface McpForm {
  name: string;
  transport: string;
  command: string;
  args: string;
}

interface PluginForm {
  name: string;
  description: string;
  entryPoint: string;
  config: string;
}

type FormData = ClaudeMdForm | SkillForm | AgentForm | HookForm | McpForm | PluginForm;

const defaultForms: Record<TabId, FormData> = {
  'claude-md': {
    projectName: '',
    techStack: '',
    testCommand: '',
    buildCommand: '',
    lintCommand: '',
    codeConventions: '',
    customInstructions: '',
  },
  skill: {
    name: '',
    description: '',
    scope: '',
    guidelines: '',
  },
  agent: {
    name: '',
    description: '',
    systemPrompt: '',
    tools: '',
  },
  hook: {
    name: '',
    event: '',
    command: '',
  },
  mcp: {
    name: '',
    transport: 'stdio',
    command: '',
    args: '',
  },
  plugin: {
    name: '',
    description: '',
    entryPoint: '',
    config: '',
  },
};

const fileNames: Record<TabId, string> = {
  'claude-md': 'CLAUDE.md',
  skill: 'skill.md',
  agent: 'agent.json',
  hook: 'hook.sh',
  mcp: 'mcp.json',
  plugin: 'plugin.ts',
};

// ---- Preview generators ----

function generateClaudeMdPreview(form: ClaudeMdForm): string {
  const { projectName, techStack, testCommand, buildCommand, lintCommand, codeConventions, customInstructions } = form;
  if (!projectName && !techStack && !codeConventions && !customInstructions && !testCommand && !buildCommand && !lintCommand) {
    return configTemplates.find((t) => t.id === 'claude-md')?.defaultContent || '';
  }
  let output = '';
  if (projectName) {
    output += `# Project: ${projectName}\n\n`;
  } else {
    output += `# CLAUDE.md\n\n`;
  }
  if (techStack) {
    output += `## Tech Stack\n${techStack.split(',').map((t) => `- ${t.trim()}`).join('\n')}\n\n`;
  }
  const commands: string[] = [];
  if (testCommand) commands.push(`- Test: ${testCommand}`);
  if (buildCommand) commands.push(`- Build: ${buildCommand}`);
  if (lintCommand) commands.push(`- Lint: ${lintCommand}`);
  if (commands.length > 0) {
    output += `## Commands\n${commands.join('\n')}\n\n`;
  }
  if (codeConventions) {
    output += `## Code Conventions\n${codeConventions}\n\n`;
  }
  if (customInstructions) {
    output += `## Custom Instructions\n${customInstructions}\n\n`;
  }
  return output;
}

function generateSkillPreview(form: SkillForm): string {
  const { name, description, scope, guidelines } = form;
  if (!name && !description && !scope && !guidelines) {
    return configTemplates.find((t) => t.id === 'skill')?.defaultContent || '';
  }
  let output = '';
  if (name) {
    output += `# Skill: ${name}\n\n`;
  } else {
    output += `# Skill\n\n`;
  }
  if (description) {
    output += `## Description\n${description}\n\n`;
  }
  if (scope) {
    output += `## Scope\n${scope}\n\n`;
  }
  if (guidelines) {
    output += `## Guidelines\n${guidelines}\n\n`;
  }
  return output;
}

function generateAgentPreview(form: AgentForm): string {
  const { name, description, systemPrompt, tools } = form;
  if (!name && !description && !systemPrompt && !tools) {
    return configTemplates.find((t) => t.id === 'agent')?.defaultContent || '';
  }
  const obj: Record<string, unknown> = {};
  if (name) obj.name = name;
  if (description) obj.description = description;
  if (systemPrompt) obj.systemPrompt = systemPrompt;
  if (tools) obj.tools = tools.split(',').map((t) => t.trim()).filter(Boolean);
  obj.model = 'claude-sonnet-4-20250514';
  return JSON.stringify(obj, null, 2);
}

function generateHookPreview(form: HookForm): string {
  const { name, event, command } = form;
  if (!name && !event && !command) {
    return configTemplates.find((t) => t.id === 'hook')?.defaultContent || '';
  }
  let output = '#!/bin/bash\n';
  if (name) output += `# Claude Code Hook: ${name}\n`;
  if (event) output += `# Event: ${event}\n`;
  output += '\nset -e\n\n';
  if (command) output += `${command}\n`;
  else output += '# Your hook logic here\n';
  return output;
}

function generateMcpPreview(form: McpForm): string {
  const { name, transport, command, args } = form;
  if (!name && !command) {
    return configTemplates.find((t) => t.id === 'mcp')?.defaultContent || '';
  }
  const serverName = name || 'my-server';
  const obj: Record<string, unknown> = {
    mcpServers: {
      [serverName]: {
        transport: transport || 'stdio',
      },
    },
  };
  if (command) {
    (obj.mcpServers as Record<string, Record<string, unknown>>)[serverName].command = command;
  }
  if (args) {
    (obj.mcpServers as Record<string, Record<string, unknown>>)[serverName].args = args.split(',').map((a) => a.trim()).filter(Boolean);
  }
  return JSON.stringify(obj, null, 2);
}

function generatePluginPreview(form: PluginForm): string {
  const { name, description, entryPoint, config } = form;
  if (!name && !description && !entryPoint && !config) {
    return configTemplates.find((t) => t.id === 'plugin')?.defaultContent || '';
  }
  return `import type { ClaudePlugin, PluginContext } from '@anthropic-ai/claude-code';

const ${name ? toCamelCase(name) : 'myPlugin'}: ClaudePlugin = {
  name: '${name || 'my-plugin'}',
  version: '1.0.0',${description ? `\n  description: '${description}',` : ''}${entryPoint ? `\n  entryPoint: '${entryPoint}',` : ''}${config ? `\n  config: ${config},` : ''}
  // Add your plugin logic here
};

export default ${name ? toCamelCase(name) : 'myPlugin'};
`;
}

function toCamelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^(.)/, (_, c) => c.toLowerCase());
}

function generatePreview(tabId: TabId, form: FormData): string {
  switch (tabId) {
    case 'claude-md': return generateClaudeMdPreview(form as ClaudeMdForm);
    case 'skill': return generateSkillPreview(form as SkillForm);
    case 'agent': return generateAgentPreview(form as AgentForm);
    case 'hook': return generateHookPreview(form as HookForm);
    case 'mcp': return generateMcpPreview(form as McpForm);
    case 'plugin': return generatePluginPreview(form as PluginForm);
    default: return '';
  }
}

function getValidationErrors(tabId: TabId, form: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  switch (tabId) {
    case 'claude-md': {
      const f = form as ClaudeMdForm;
      if (!f.projectName.trim()) errors.projectName = 'Project name is required';
      break;
    }
    case 'skill': {
      const f = form as SkillForm;
      if (!f.name.trim()) errors.name = 'Skill name is required';
      if (!f.description.trim()) errors.description = 'Description is required';
      break;
    }
    case 'agent': {
      const f = form as AgentForm;
      if (!f.name.trim()) errors.name = 'Agent name is required';
      break;
    }
    case 'hook': {
      const f = form as HookForm;
      if (!f.name.trim()) errors.name = 'Hook name is required';
      if (!f.command.trim()) errors.command = 'Command is required';
      break;
    }
    case 'mcp': {
      const f = form as McpForm;
      if (!f.name.trim()) errors.name = 'Server name is required';
      if (!f.command.trim()) errors.command = 'Command is required';
      break;
    }
    case 'plugin': {
      const f = form as PluginForm;
      if (!f.name.trim()) errors.name = 'Plugin name is required';
      break;
    }
  }
  return errors;
}

// ---- Form field component ----

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--accent-amber)' }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[12px]" style={{ color: '#dc2626' }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ---- Syntax highlighter (approximate) ----

function SyntaxHighlighted({ code, language }: { code: string; language: string }) {
  const highlighted = useMemo(() => {
    if (language === 'json') {
      return code
        .replace(/(&)/g, '&amp;')
        .replace(/(<)/g, '&lt;')
        .replace(/(>)/g, '&gt;')
        .replace(/(".*?")/g, '<span style="color:#98c379">$1</span>')
        .replace(/(\b(?:true|false|null)\b)/g, '<span style="color:#56b6c2">$1</span>')
        .replace(/(\b\d+\b)/g, '<span style="color:#d19a66">$1</span>')
        .replace(/([{}[\],])/g, '<span style="color:#abb2bf">$1</span>');
    }
    if (language === 'markdown') {
      return code
        .replace(/(&)/g, '&amp;')
        .replace(/(<)/g, '&lt;')
        .replace(/(>)/g, '&gt;')
        .replace(/^(#+\s+.*)$/gm, '<span style="color:#e06c75">$1</span>')
        .replace(/(-\s.*$)/gm, '<span style="color:#98c379">$1</span>')
        .replace(/(`.*?`)/g, '<span style="color:#d19a66">$1</span>');
    }
    return code
      .replace(/(&)/g, '&amp;')
      .replace(/(<)/g, '&lt;')
      .replace(/(>)/g, '&gt;')
      .replace(/(\/\/.*$)/gm, '<span style="color:#7f848e">$1</span>')
      .replace(/(#.*$)/gm, '<span style="color:#7f848e">$1</span>');
  }, [code, language]);

  return (
    <pre
      className="overflow-auto text-[14px] leading-[1.7]"
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        color: '#abb2bf',
        whiteSpace: 'pre',
      }}
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
}

export default function ConfigBuilder() {
  const [activeTab, setActiveTab] = useState<TabId>('claude-md');
  const [forms, setForms] = useState<Record<TabId, FormData>>({ ...defaultForms });
  const [copied, setCopied] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const currentForm = forms[activeTab];
  const currentTemplate = configTemplates.find((t) => t.id === activeTab);
  const preview = generatePreview(activeTab, currentForm);
  const errors = showValidation ? getValidationErrors(activeTab, currentForm) : {};

  const updateForm = useCallback((tabId: TabId, field: string, value: string) => {
    setForms((prev) => ({
      ...prev,
      [tabId]: { ...prev[tabId], [field]: value },
    }));
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(preview).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [preview]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([preview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileNames[activeTab];
    a.click();
    URL.revokeObjectURL(url);
  }, [preview, activeTab]);

  const handleReset = useCallback(() => {
    setForms((prev) => ({ ...prev, [activeTab]: { ...defaultForms[activeTab] } }));
    setShowValidation(false);
  }, [activeTab]);

  const language = currentTemplate?.language || 'markdown';

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:py-8">
      {/* Section 1: Page Header */}
      <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {/* Breadcrumb */}
        <motion.nav
          className="mb-3 text-[13px]"
          style={{ color: 'var(--text-secondary)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <a
            href="#/"
            className="transition-colors duration-200 hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}
          >
            Home
          </a>
          <span className="mx-2">/</span>
          <span style={{ color: 'var(--text-primary)' }}>Config Builder</span>
        </motion.nav>

        <motion.h1
          className="font-playfair text-[42px] font-bold"
          style={{ color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.015em' }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.1 }}
        >
          Config Builder
        </motion.h1>
        <motion.p
          className="mt-1 text-[18px] font-semibold"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.35 }}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.15 }}
        >
          Build Tools
        </motion.p>
      </motion.div>

      {/* Section 2: Tab Navigation */}
      <motion.div
        className="mb-6 flex gap-1 overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setShowValidation(false);
              }}
              className="whitespace-nowrap rounded-t-lg px-5 py-2.5 text-[13px] font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? 'var(--cream-dark)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--accent-amber)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--cream-dark)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
              title={tab.description}
            >
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Section 3: Form + Preview */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="flex flex-col gap-4 lg:w-[55%]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
          >
            {activeTab === 'claude-md' && (
              <>
                <FormField label="Project Name" required error={errors.projectName}>
                  <input
                    type="text"
                    value={(currentForm as ClaudeMdForm).projectName}
                    onChange={(e) => updateForm('claude-md', 'projectName', e.target.value)}
                    placeholder="MyApp"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{
                      borderColor: errors.projectName ? '#dc2626' : 'var(--border-dark)',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                    onFocus={(e) => { if (!errors.projectName) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.projectName ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Tech Stack">
                  <input
                    type="text"
                    value={(currentForm as ClaudeMdForm).techStack}
                    onChange={(e) => updateForm('claude-md', 'techStack', e.target.value)}
                    placeholder="React, TypeScript, Node.js"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField label="Test Command">
                    <input
                      type="text"
                      value={(currentForm as ClaudeMdForm).testCommand}
                      onChange={(e) => updateForm('claude-md', 'testCommand', e.target.value)}
                      placeholder="npm test"
                      className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                      style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </FormField>
                  <FormField label="Build Command">
                    <input
                      type="text"
                      value={(currentForm as ClaudeMdForm).buildCommand}
                      onChange={(e) => updateForm('claude-md', 'buildCommand', e.target.value)}
                      placeholder="npm run build"
                      className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                      style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </FormField>
                  <FormField label="Lint Command">
                    <input
                      type="text"
                      value={(currentForm as ClaudeMdForm).lintCommand}
                      onChange={(e) => updateForm('claude-md', 'lintCommand', e.target.value)}
                      placeholder="npm run lint"
                      className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                      style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </FormField>
                </div>
                <FormField label="Code Conventions">
                  <textarea
                    value={(currentForm as ClaudeMdForm).codeConventions}
                    onChange={(e) => updateForm('claude-md', 'codeConventions', e.target.value)}
                    placeholder="Use functional components with hooks.&#10;Prefer TypeScript interfaces over types."
                    rows={4}
                    className="w-full min-h-[100px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Custom Instructions">
                  <textarea
                    value={(currentForm as ClaudeMdForm).customInstructions}
                    onChange={(e) => updateForm('claude-md', 'customInstructions', e.target.value)}
                    placeholder="Always write tests for new features."
                    rows={4}
                    className="w-full min-h-[100px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
              </>
            )}

            {activeTab === 'skill' && (
              <>
                <FormField label="Skill Name" required error={errors.name}>
                  <input
                    type="text"
                    value={(currentForm as SkillForm).name}
                    onChange={(e) => updateForm('skill', 'name', e.target.value)}
                    placeholder="Generate React Component"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.name ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Description" required error={errors.description}>
                  <textarea
                    value={(currentForm as SkillForm).description}
                    onChange={(e) => updateForm('skill', 'description', e.target.value)}
                    placeholder="When to use this skill..."
                    rows={3}
                    className="w-full min-h-[80px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.description ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.description) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.description ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Scope">
                  <input
                    type="text"
                    value={(currentForm as SkillForm).scope}
                    onChange={(e) => updateForm('skill', 'scope', e.target.value)}
                    placeholder="When the user asks to create a new React component"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Guidelines">
                  <textarea
                    value={(currentForm as SkillForm).guidelines}
                    onChange={(e) => updateForm('skill', 'guidelines', e.target.value)}
                    placeholder="1. Create a .tsx file with proper TypeScript types&#10;2. Use functional component with hooks"
                    rows={4}
                    className="w-full min-h-[100px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
              </>
            )}

            {activeTab === 'agent' && (
              <>
                <FormField label="Agent Name" required error={errors.name}>
                  <input
                    type="text"
                    value={(currentForm as AgentForm).name}
                    onChange={(e) => updateForm('agent', 'name', e.target.value)}
                    placeholder="code-reviewer"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.name ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Description">
                  <input
                    type="text"
                    value={(currentForm as AgentForm).description}
                    onChange={(e) => updateForm('agent', 'description', e.target.value)}
                    placeholder="Specialized agent for code review tasks"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="System Prompt">
                  <textarea
                    value={(currentForm as AgentForm).systemPrompt}
                    onChange={(e) => updateForm('agent', 'systemPrompt', e.target.value)}
                    placeholder="You are an expert code reviewer..."
                    rows={5}
                    className="w-full min-h-[120px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Tools">
                  <input
                    type="text"
                    value={(currentForm as AgentForm).tools}
                    onChange={(e) => updateForm('agent', 'tools', e.target.value)}
                    placeholder="read_file, git_diff, run_tests"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
              </>
            )}

            {activeTab === 'hook' && (
              <>
                <FormField label="Hook Name" required error={errors.name}>
                  <input
                    type="text"
                    value={(currentForm as HookForm).name}
                    onChange={(e) => updateForm('hook', 'name', e.target.value)}
                    placeholder="pre-file-edit"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.name ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Event">
                  <select
                    value={(currentForm as HookForm).event}
                    onChange={(e) => updateForm('hook', 'event', e.target.value)}
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="">Select event...</option>
                    <option value="pre-command">pre-command</option>
                    <option value="post-command">post-command</option>
                    <option value="pre-file-edit">pre-file-edit</option>
                    <option value="post-file-edit">post-file-edit</option>
                  </select>
                </FormField>
                <FormField label="Command" required error={errors.command}>
                  <textarea
                    value={(currentForm as HookForm).command}
                    onChange={(e) => updateForm('hook', 'command', e.target.value)}
                    placeholder={`#!/bin/bash\necho "Running hook..."`}
                    rows={5}
                    className="w-full min-h-[120px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.command ? '#dc2626' : 'var(--border-dark)', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px' }}
                    onFocus={(e) => { if (!errors.command) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.command ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
              </>
            )}

            {activeTab === 'mcp' && (
              <>
                <FormField label="Server Name" required error={errors.name}>
                  <input
                    type="text"
                    value={(currentForm as McpForm).name}
                    onChange={(e) => updateForm('mcp', 'name', e.target.value)}
                    placeholder="filesystem"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.name ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Transport" required>
                  <select
                    value={(currentForm as McpForm).transport}
                    onChange={(e) => updateForm('mcp', 'transport', e.target.value)}
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <option value="stdio">stdio</option>
                    <option value="sse">sse</option>
                  </select>
                </FormField>
                <FormField label="Command" required error={errors.command}>
                  <input
                    type="text"
                    value={(currentForm as McpForm).command}
                    onChange={(e) => updateForm('mcp', 'command', e.target.value)}
                    placeholder="npx"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.command ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.command) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.command ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Args">
                  <input
                    type="text"
                    value={(currentForm as McpForm).args}
                    onChange={(e) => updateForm('mcp', 'args', e.target.value)}
                    placeholder="-y, @modelcontextprotocol/server-filesystem, /home/user/project"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
              </>
            )}

            {activeTab === 'plugin' && (
              <>
                <FormField label="Plugin Name" required error={errors.name}>
                  <input
                    type="text"
                    value={(currentForm as PluginForm).name}
                    onChange={(e) => updateForm('plugin', 'name', e.target.value)}
                    placeholder="eslint-enforcer"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: errors.name ? '#dc2626' : 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = errors.name ? '#dc2626' : 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Description">
                  <input
                    type="text"
                    value={(currentForm as PluginForm).description}
                    onChange={(e) => updateForm('plugin', 'description', e.target.value)}
                    placeholder="Automatically runs ESLint on file changes"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Entry Point">
                  <input
                    type="text"
                    value={(currentForm as PluginForm).entryPoint}
                    onChange={(e) => updateForm('plugin', 'entryPoint', e.target.value)}
                    placeholder="src/index.ts"
                    className="w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: 'Inter, system-ui, sans-serif' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
                <FormField label="Config">
                  <textarea
                    value={(currentForm as PluginForm).config}
                    onChange={(e) => updateForm('plugin', 'config', e.target.value)}
                    placeholder={`{\n  "autoFix": true,\n  "extensions": [".ts", ".tsx"]\n}`}
                    rows={4}
                    className="w-full min-h-[100px] resize-y rounded-lg border bg-white px-3.5 py-2.5 text-[15px] outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--border-dark)', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(180,83,9,0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </FormField>
              </>
            )}

            {/* Action Buttons */}
            <motion.div
              className="mt-6 flex flex-wrap gap-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-dark)] bg-transparent px-5 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--cream-dark)]"
                style={{ color: 'var(--text-primary)' }}
              >
                {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-dark)] bg-transparent px-5 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--cream-dark)]"
                style={{ color: 'var(--text-primary)' }}
              >
                <DownloadIcon />
                Download
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[15px] font-medium transition-all duration-200 hover:scale-[1.02]"
                style={{ color: 'var(--text-secondary)' }}
              >
                Reset
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Right: Live Preview */}
        <motion.div
          className="lg:sticky lg:top-[100px] lg:w-[45%] lg:self-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
        >
          <div
            className="overflow-hidden rounded-xl"
            style={{
              backgroundColor: '#282c34',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            }}
          >
            {/* Preview Header */}
            <div
              className="flex h-10 items-center justify-between px-4"
              style={{ backgroundColor: '#1e1e1e' }}
            >
              <span
                className="text-[12px]"
                style={{
                  color: '#9ca3af',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {fileNames[activeTab]}
              </span>
              <span
                className="rounded px-2 py-0.5 text-[11px] uppercase"
                style={{
                  color: '#9ca3af',
                  backgroundColor: '#2d2d2d',
                  fontFamily: '"JetBrains Mono", monospace',
                }}
              >
                {language}
              </span>
            </div>

            {/* Preview Body */}
            <div className="max-h-[calc(100vh-180px)] overflow-auto p-5">
              <SyntaxHighlighted code={preview} language={language} />
            </div>
          </div>

          {/* Copy toast */}
          {copied && (
            <motion.div
              className="fixed bottom-6 right-6 rounded-lg px-4 py-2 text-[13px] font-medium text-white shadow-lg"
              style={{ backgroundColor: 'var(--accent-amber)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              Copied to clipboard!
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
