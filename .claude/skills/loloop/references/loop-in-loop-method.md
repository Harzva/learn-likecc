# Loop In Loop Method

This skill follows the repo's existing `loop in loop` idea from `site/js/app.js`.

Condensed method:

## Outer loop

- lock onto one current `plan vN`
- work inside a bounded `/loop` timebox
- keep implementing against unchecked items
- compile / verify / record while progressing
- stop only when the plan slice or plan version is done

## Transition

- review results, experiments, and leftovers
- summarize what should carry forward

## Inner loop

- write `plan vN+1`
- let the new file inherit context from `vN`
- end with an explicit instruction to run the same loop process again

This is why the skill is named `loloop`:

- one loop executes the current plan
- the second loop keeps generating the next plan and re-entering the process

Use this method when the work is larger than one coding pass and should evolve through versioned plans plus accumulated retrospectives.
