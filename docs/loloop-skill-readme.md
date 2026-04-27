# loloop

`loloop` is a project-local skill that wraps the official `/loop` workflow with a stronger iterative discipline.

It is designed for work that should not stop after a single implementation pass.

## Design background

The skill comes from the repo's existing `loop in loop` method:

- lock onto one current plan
- execute a bounded slice
- review what changed and what failed
- write the result back into an evolution note
- prepare the next `/loop` handoff

Instead of treating loop as only "keep running", `loloop` treats each loop as:

- one planned iteration
- one review checkpoint cycle
- one handoff into the next iteration

## Final structure

```text
.claude/
  skills/
    loloop/
  plans/
    loloop/
      active-*.md
      evolution-*.md
      draft-*.md
      archive-*.md
  logs/
    loloop/
      *.log
```

## Example usage

```text
请使用 loloop，基于 .claude/plans/loloop/active-loloop-validation-plan-v1.md 启动一次迭代。
先读取最近的 evolution 记录；
完成一轮最小可验证推进；
最后写 evolution note，并给出下一轮 /loop handoff。
```

## Validation result

This repo ran a self-hosted forward-test where `loloop` was used to improve and validate itself.

Observed strengths:

- good at locking work to one active plan
- forces a review step instead of drifting forever
- naturally produces the next `/loop` handoff
- works well for project-local engineering iteration

Current limitations:

- still needs more than one real-world run to prove stability
- publication/export flow should be refined if the skill will live in its own repository

Current verdict:

- **successful as a project-local skill**
- **worthy of further iteration and standalone publication packaging**

