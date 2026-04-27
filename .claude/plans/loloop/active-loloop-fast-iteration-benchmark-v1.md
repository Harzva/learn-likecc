# active-loloop-fast-iteration-benchmark-v1.md

## Goal

Judge whether `loloop` can support 100 or more quick iterations without losing plan continuity.

## Success condition

- one benchmark-friendly invocation pattern is selected
- one micro-iteration instance is defined so each pass can finish quickly
- risks that would block 100+ iterations are identified
- the preferred usage pattern is documented in both local and GitHub-facing docs

## Benchmark instance

Use a deliberately tiny iteration unit:

- active plan stays fixed for many rounds
- each round completes exactly one checklist item or one tiny verification step
- each round writes one short evolution note and one next `/loop` handoff

Suggested micro-task shape:

- tighten one sentence in a doc
- close one unchecked item in a checklist
- validate one tiny repo invariant
- rewrite one prompt/example and record the result

## Candidate usage methods

- method A: direct skill call
  - `请使用 loloop ...`
- method B: official `/loop` outside, `loloop` inside
  - `/loop 30min 请使用 loloop ...`
- method C: future native command wrapper
  - `/loloop 30min ...`

## Evaluation criteria

- recursion continuity
- operator overhead per round
- likelihood of drifting away from the active plan
- suitability for 100+ rounds

## Expected conclusion

Method B should win for the current product shape because it combines runtime recursion with method discipline.
