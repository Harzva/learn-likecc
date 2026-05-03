Project: Agent Loop 动态模拟器

Purpose:
  A static React/Vite interactive simulator for the Learn LikeCode site. It demonstrates how an agent runtime turns one user request into model calls, tool calls, tool results, and a final answer.

Runtime:
  Node.js 20+
  Vite
  React
  TypeScript
  Tailwind CSS

Important paths:
  src/App.tsx                         Root page composition
  src/data/simulatorData.ts           Step labels, sequence messages, mock payloads, tool and command data
  src/components/SequenceDiagram.tsx  Left-side message sequence visualization
  src/components/TerminalEmulator.tsx Right-side terminal replay
  src/components/ControlBar.tsx       Step navigation and replay controls

GitHub Pages:
  vite.config.ts uses base: './', so the built dist can be served from a subdirectory such as /learn-likecc/simulator/.
