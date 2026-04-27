# Design/UI Plugin Ladder

Date: 2026-04-13  
Task: Task 16  
Status: bounded pass complete

## What changed

- Added the first explicit plugin-line decision rule to the `Design/UI` topic.
- Turned `Mermaid / html-card-to-png / webpage-screenshot-md / LivePPT / Slidev / Remotion` into one expression ladder instead of treating them as unrelated tools.
- Updated the tutorial and unpacked pages so the topic now distinguishes:
  - structure explanation
  - evidence-preserving screenshots
  - deck/slides/video upgrades

## Rule summary

- `Mermaid`:
  - first choice when the goal is to explain structure, flow, or system relationships
- `html-card-to-png`:
  - first upgrade when Mermaid is semantically right but visually too weak or too constrained
- `webpage-screenshot-md`:
  - first choice when the topic must preserve real UI evidence or real page state
- `LivePPT / Slidev / Remotion`:
  - media-shape upgrades after the topic is already mature enough to become a shareable deck, developer lecture, or motion clip

## Why this matters

- The topic now covers both illustration choices and presentation choices.
- This makes `Design/UI` a reusable expression policy instead of a loose tool list.

## Next handoff

- The next bounded pass should choose one mature topic and explicitly decide:
  - what gets a Mermaid
  - what gets a screenshot
  - what gets a deck/slides/video variant
- The goal is to produce the first end-to-end expression recipe rather than stopping at the policy level.
