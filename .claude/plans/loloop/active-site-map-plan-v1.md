# Site Map / Topic Updates Plan v1

Status: active
Current focus: keep the site-wide mind map and per-topic update metadata synchronized as the topic tree changes.

## Scope

- [ ] Maintain a dedicated site map / mind map page that introduces the whole website.
- [ ] Keep a generated topic index with per-page last-updated dates.
- [ ] Ensure every `site/topic-*.html` page has a stable `page:updated` date.
- [ ] Ensure every matching `site/md/topic-*.md` mirror records its own `更新时间`.
- [ ] Keep homepage / hub entry points aligned with the current topic tree when the site map changes materially.

## Working rules

- Read `site/topic-site-map.html` and `site/md/topic-site-map.md` first when this task becomes active.
- Refresh metadata with `python3 tools/refresh_site_topic_metadata.py` after topic-level edits.
- Prefer bounded passes:
  - add or revise one map branch
  - sync one new topic family into the map
  - refresh timestamps and verify
- When a new major hub or subtopic is added, update:
  - the mind map page
  - the generated topic index
  - any homepage / hub entry that should expose it

## Validation

- [x] `python3 tools/refresh_site_topic_metadata.py`
- [x] `python3 tools/check_site_md_parity.py`
- [x] Manually verify `site/topic-site-map.html`
- [x] Spot-check at least one changed topic page for footer update display

## Notes

- 2026-04-12: first bounded Task 11 pass should make the `CLI Agent -> everything-agent-cli` branch explicit in the site map so the umbrella repo line is no longer only discoverable from the topic page and generated index
- 2026-04-12: first bounded Task 11 pass landed in `site/js/app.js`, `site/topic-site-map.html`, and `site/md/topic-site-map.md`; `python3 tools/refresh_site_topic_metadata.py` refreshed the metadata chain without additional structural drift
- 2026-04-12: second bounded Task 11 pass should make the new hot-topic intake chain visible from the site map itself so `topic-hot-watch` is taught as an upstream router into `topic-agent-hot` and `topic-rag-hot`, not just another standalone hub
- 2026-04-12: third bounded Task 11 pass should make the newly landed local app surface visible from the site map itself so `app-likecode-workspace.html` is taught as part of the `Loop Lab / 本地工作台` line rather than staying hidden behind article pages
- 2026-04-12: fourth bounded Task 11 pass should make the new `Connector Runtime / Daemon Design` page visible from the same `Loop Lab / 本地工作台` branch so the connector-shell line is discoverable from the main map instead of only from the topic index and workspace app
