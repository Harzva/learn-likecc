# GitHub Achievements Topic Plan v1

Status: active  
Scope: build a small but reusable topic line around GitHub achievements / badges, including what they are, why developers care, how to recognize them, and how they fit the site's broader toolchain and developer-identity threads.

## Current focus

- [x] Open a first topic page for GitHub achievements / badges
- [x] Connect it into the toolchain topic and left sidebar
- [ ] Add a first structured badge gallery with clearer category grouping
- [ ] Add one bounded pass that explains which parts are official GitHub achievements versus community icon/documentation layers
- [ ] Add one bounded pass that turns the topic into a small how-to reference for profile presentation and developer identity

## Main product areas

- [ ] topic page
- [ ] toolchain integration
- [ ] sidebar discoverability
- [ ] badge gallery and interpretation
- [ ] official vs community source boundary

## Expected outputs

- [x] one topic page:
  - `site/topic-github-achievements.html`
- [x] one markdown mirror:
  - `site/md/topic-github-achievements.md`
- [x] one integration pass into:
  - `site/topic-toolchain.html`
  - `site/js/app.js`
- [ ] one follow-up pass for a better categorized badge wall
- [ ] one follow-up pass for a stronger source / legitimacy explanation

## Validation

- [ ] `node --check site/js/app.js`
- [ ] `python3 tools/refresh_site_topic_metadata.py`
- [ ] `python3 tools/build_loop_task_board.py`
- [ ] `python3 tools/check_site_md_parity.py`

## Notes

- This line should stay modest and useful; it is a subtopic under the broader developer toolchain / profile culture line, not a giant standalone hub.
- Be explicit about the boundary between official GitHub achievements and community-maintained icon documentation pages.
