# Topic Quality Audit Plan v1

> Status: active
> Scope: record topic creation time and improve weak or immature topics

## Goals
- Ensure every topic page clearly exposes its creation/update timing.
- Improve readability, structure, and visual quality for weak topics.
- Keep topic quality consistent with site standards.

## Current Focus
- [ ] Identify topic pages missing explicit creation/update cues.
- [ ] Build a lightweight audit list of the weakest topics first.

## Checklist
- [ ] Scan `site/topic-*.html` for missing creation/update markers.
- [ ] Define the creation-time recording method (meta tag, visible timestamp block, or both).
- [ ] Choose the lowest-quality topics and define a bounded polish pass for each.
- [ ] Apply one bounded readability/visual improvement pass per iteration.
- [ ] Update evolution notes with before/after and next target.

## Quality Standards to Follow
- Clear sectioning with a single leading purpose statement.
- Visual rhythm: mix text, table, and diagram where appropriate.
- Avoid overlong paragraphs; prefer tight, explicit headings.
- Maintain consistent tone with the rest of the site.

## Evidence Anchors
- `site/topic-*.html`
- `site/md/*.md`
- `site/data/site-topic-index.json`

## Next Handoff
- Select the first two weakest topics and define a micro-pass for each.
