---
name: loloop
description: Use when a task should advance through repeated plan-driven loop cycles for an engineering project, paper, or long-running repo change. loloop wraps the official /loop idea with the repo's loop-in-loop method: read the current plan, inspect prior evolution notes, execute the current iteration, write a new evolution record, draft the next plan when a version is complete, and prepare the next /loop handoff.
---

# loloop

`loloop` is a local skill for long-horizon work that should keep evolving instead of stopping after one implementation pass.

It does not replace the official `/loop`.
It packages your repo's `loop in loop` method around it.

## When to use

Use this skill when the user wants any of these:

- continue a project by iterating against a plan file
- keep evolving a repo or paper over multiple versions
- read prior "evolution" notes before deciding the next iteration
- finish one plan, then immediately draft the next version
- prepare or trigger another `/loop` run with a better prompt

Good fits:

- roadmap-driven engineering in `learn-likecc`
- paper / article iteration with explicit milestones
- versioned work under `.claude/plans/*.md`
- structured loop work under `.claude/plans/loloop/*.md`

## Core idea

`loloop` follows the repo's loop-in-loop pattern:

1. Lock onto one current plan file.
2. Execute a bounded iteration against that plan.
3. Record what changed, what failed, and what remains.
4. If the plan is complete, write the next versioned plan.
5. End with an explicit next `/loop` handoff so the process can recurse.

Read [references/loop-in-loop-method.md](./references/loop-in-loop-method.md) if you need the original repo phrasing.

## Files and conventions

Default locations:

- General plans: `.claude/plans/*.md`
- loloop-specific plan docs: `.claude/plans/loloop/*.md`
- Raw run logs: `.claude/logs/loloop/*.log`

When this skill creates a new evolution note, use:

- `.claude/plans/loloop/evolution-YYYY-MM-DD-short-slug.md`

Use [templates/evolution-entry.md](./templates/evolution-entry.md) as the default structure.

## Workflow

### 1. Anchor on the active plan

Start by identifying one active plan file.
Prefer, in order:

- a plan file explicitly named by the user
- the newest relevant `active-*.md` in `.claude/plans/loloop/`
- the newest relevant file in `.claude/plans/`
- a paper/report plan already referenced in the task

Extract:

- the current version / milestone
- completed items
- unfinished checklist items
- the expected deliverable for this iteration

### 2. Read evolution history

Read the most recent relevant `evolution-*.md` notes from `.claude/plans/loloop/`.

Focus on:

- repeated failures
- postponed items
- decisions that constrain the next pass
- ideas for the next version

If there is no history yet, create it after the first iteration.

### 3. Define the current loop target

Before doing work, reduce the current iteration to:

- one plan file
- one bounded timebox or milestone slice
- one concrete success condition

Examples:

- "Finish the unchecked items in phase B"
- "Produce the first working baseline and record metrics"
- "Close the remaining paper figure gaps for section 3"

### 4. Execute the iteration

Carry out the work normally:

- edit files
- run checks
- update docs
- validate results

Stay locked to the active plan instead of branching into unrelated cleanup.

### 5. Write an evolution note

At the end of the iteration, write an evolution note that records:

- plan used
- what was completed
- what failed or was deferred
- key decisions
- recommended next loop target

Do not skip this step. `loloop` depends on accumulated evolution notes.

### Review checkpoints

`loloop` should not just keep acting until the timebox ends.
Each iteration should include explicit review checkpoints.

Use these checkpoints:

- before the iteration: extract the target, constraints, and success condition from the active plan
- during the iteration: if a chosen direction fails or drifts, stop and write a short correction note before continuing
- after the iteration: explicitly review what worked, what did not, and what the next loop should change

The important part is:

- act against a concrete plan
- allow small corrections during execution
- force a post-iteration review
- write the review back into evolution notes and the next handoff

### 6. Decide whether to recurse

If the current plan is not complete:

- keep the same plan
- propose the next `/loop` prompt against the unfinished items

If the current plan is complete:

- draft the next versioned plan
- open with a short "承上启下" summary
- carry forward only the real next-step work
- if useful, tighten the next loop by improving the review checkpoints instead of only adding more tasks
- end with an explicit next `/loop` handoff

### 7. Prepare the next /loop handoff

When the environment supports the official `/loop`, prepare the next command in a copy-ready form.

Use this shape:

```text
/loop <timebox> 完成 <plan-path> 中当前未完成的条目；先阅读 <latest-evolution-note>，按记录避免重复试错，完成后更新该计划与 evolution 记录，并在收尾时给出下一轮 loop 建议。
```

If the user explicitly asks to start the next loop now, use that prepared handoff as the basis for the next official `/loop` run.

## Long-run usage

For stress tests that target 100 or more fast iterations, prefer the official `/loop` as the outer driver and `loloop` as the inner method.

Recommended current shape:

```text
/loop 30min 请使用 loloop，基于 <plan-path> 启动一次迭代；先读取最近的 evolution 记录；完成一轮最小可验证推进；最后写 evolution note，并给出下一轮 /loop handoff。
```

Why this is the best current method:

- `/loop` provides the repeat trigger and timebox
- `loloop` provides plan anchoring, review, and recursion discipline
- each iteration can stay intentionally small without losing the thread

Use plain skill invocation only for manual one-off passes:

```text
请使用 loloop，基于 <plan-path> 启动一次迭代。
```

Treat native `/loloop ...` as a future command shape, not a current requirement.

## Guardrails

- Do not claim background execution if you did not actually start `/loop`.
- Do not create a new plan version unless the current one is genuinely closed or needs a deliberate branch.
- Do not lose unfinished work: keep it in the active plan or move it explicitly into the next one.
- Do not let evolution notes become diary spam; each note must change the next iteration.
- Prefer versioned plan files for repo-scale work.

## Deliverables

When `loloop` finishes one iteration, the minimum expected outputs are:

- updated project or paper files
- updated active plan or a newly drafted next-version plan
- one new evolution note in `.claude/plans/loloop/`
- optional raw execution notes in `.claude/logs/loloop/`
- one explicit next `/loop` handoff
