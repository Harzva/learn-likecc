# Claude Changelog Watch Plan v1

Status: locally deferred  
Scope: monitor Claude / Claude Code changelogs, extract worthwhile keywords or shifts, and turn them into site-ready topic drafts or focused updates.

## Current focus

- [x] Keep tracking recent Claude changelog deltas and choose the next keyword worth turning into a site draft
- [x] Prefer updates that have clear teaching value for our site, not just release-note novelty
- [ ] Keep the best-fit site destination explicit before drafting
- [x] Continue Task 4 with the next bounded keyword after the tracing opt-in slice
- [x] Continue Task 4 with one more bounded keyword after the managed-hooks slice
- [x] Mark the current `2.1.101` release-watch micro-wave locally deferred until a fresh official delta or clearly higher-value gap appears

## Primary sources

- [x] `https://code.claude.com/docs/en/changelog`
- [x] `https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md`
- [ ] When a changelog item needs deeper support, add official docs or upstream references before writing

## Keyword workflow

- [x] Treat changelog entries as a keyword / theme source, not as article text to paraphrase directly
- [x] For each worthwhile keyword:
  - identify the feature, shift, or theme
  - decide whether it belongs in an existing topic page or needs a fresh draft
  - do live research with primary-source preference
  - produce or update a publish-ready `site/md/*.md` draft
- [ ] Keep references and original-source links at the end of the resulting draft

## Progress notes

- [x] Destination kept explicit for the tracing opt-in slice:
  - `site/topic-cc-release-watch.html`
  - `site/md/topic-cc-release-watch.md`
- [x] Added one `2.1.101` tracing-opt-in note explaining why sensitive OTEL trace fields moved behind explicit env flags
- [x] Destination kept explicit for the managed-hooks slice:
  - `site/topic-cc-release-watch.html`
  - `site/md/topic-cc-release-watch.md`
- [x] Added one `2.1.101` managed-hooks note explaining settings fault-tolerance and `allowManagedHooksOnly` policy precedence

## Good candidate types

- [x] major workflow changes
- [x] security / governance changes with teaching value
- [x] new agent control surfaces or context-management shifts
- [x] changes that clarify how Claude Code differs from Like Code / codex-loop / other stacks

## Destination rules

- [ ] Prefer updating an existing site topic when the new keyword clearly fits
- [ ] Only create a new draft when the changelog theme is substantial enough to stand on its own
- [ ] Keep the destination page explicit in the plan notes before doing the writing pass

## Visuals

- [ ] Add `[插图提示词]` blocks when visual explanation would help
- [ ] Note when Mermaid is a better fit than bitmap illustration
- [ ] Avoid forcing visuals into every changelog-derived draft

## Validation

- [x] Keep `python3 tools/check_site_md_parity.py` passing after each pass
- [x] Prefer official docs, original repos, official changelogs, and primary sources over secondary commentary
- [ ] Avoid publishing or landing a draft when the keyword is too weak or too thinly supported

## Notes

- This plan is the canonical checklist for changelog-driven site updates
- Each completed keyword pass should leave behind:
  - a checked item here
  - a matching evolution note
  - and a clear site destination path
