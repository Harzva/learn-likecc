# Reflective Loop Simulator

An interactive topic page for explaining loop mechanisms with stronger hands-on behavior than a static article.

It is inspired by the local `learn-likecc/site` pages and the simulator-style reference:

- `topic-loop-mechanisms.html`
- `topic-cc-loop-lab.html`
- `https://www.xuanyuancode.com/learn-claude-code/simulator`

## Open

This project loads `data/scenarios.json`, so open it through a local static server:

```bash
cd /home/clashuser/hzh/item_bo/Oh-Reflective-loop-skills
python3 -m http.server 8765
```

Then visit:

`http://127.0.0.1:8765/2practice-projects/reflective-loop-simulator/index.html`

## Interactions

- Switch between four scenarios: Claude Code, Codex Daemon, LikeCode /loop, and Reflective MOA.
- Step through a twelve-event agent loop.
- Click a sequence message block to inspect its prompt, tool call, or JSON payload.
- Click terminal history entries to replay the selected event.
- Inspect the source module locator under each payload, such as `src/runtime/toolUse/toolResult.ts`.
- Filter swimlanes: Claude LLM, Claude Code, and Tools.
- Replay the whole run as an animated terminal-style walkthrough.
- Use auto-explain mode to advance step-by-step while synchronizing the sequence diagram, terminal history, payload, source module, and teaching note.
- Use keyboard shortcuts: arrow keys for steps, space for auto-explain mode, number keys 1-4 for scenario switching.

## Data Model

Scenario content lives in `data/scenarios.json`. To generate a new simulator topic, add a new top-level scenario key with:

- `title`
- `intro`
- `steps[]`

Each step supports:

- `lane`, `from`, `to`
- `kind`
- `title`, `label`, `status`, `body`
- `source`
- `payload`
- `teaching`

## Current Scenario

The simulator now ships four scenes:

- Claude Code tool-use loop: user prompt, state lookup, tool result refeed, bounded patch, visual check, failure signal, and next epoch.
- Codex external daemon loop: while/sleep scheduling, `codex exec resume`, state files, heartbeat, and check-directed continuation.
- LikeCode `/loop`: application-level cron task creation, scheduler tick, prompt queue, and rescheduling.
- Reflective MOA: DAG planning, parallel workers, shared blackboard, merge check, and graph-level failure memory.
