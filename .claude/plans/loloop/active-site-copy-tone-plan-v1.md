# 文案体检 Plan v1

Status: active
Current focus: run a site-wide wording audit, then tighten copy in batches so the whole site reads like a cleaner developer portal.

## Scope

- [x] Tighten homepage hero wording so it is shorter, sharper, and less repetitive.
- [ ] Run a site-wide wording scan and build a prioritized audit list.
- [ ] Reduce over-explaining phrases such as `不只讲` / `不只列` / `不是...而是...` when they make the copy feel heavy.
- [ ] Keep the site voice developer-facing, confident, and information-dense without sounding salesy.
- [ ] Normalize high-traffic hub pages so intros, section captions, and navigation-adjacent helper text stay concise.
- [ ] Build a reusable wording standard for future site copy edits.
- [ ] Finish the scan in batches instead of only fixing pages ad hoc.

## Long-form prompt for this task

When this task is active, use this prompt contract:

> Please tighten the wording and tone of the target site page so it reads like a clear developer portal rather than an over-explained promo page.  
> Prefer concise, high-signal sentences.  
> Reduce repetitive rhetorical structures such as `不只讲`, `不只列`, `不是……而是……`, and similar self-contrast phrasing when they make the page feel verbose.  
> Keep the meaning, but rewrite toward:
> - shorter sentences
> - fewer self-justifying transitions
> - stronger information density
> - cleaner developer-facing voice
> - less explanation about “what this page is not”
> - more direct explanation of “what this page gives you”
>
> For each bounded pass:
> 1. first consult the latest site-wide audit list;
> 2. pick one page family or one concentrated copy surface;
> 2. tighten wording without changing the information architecture;
> 3. preserve brand direction and technical meaning;
> 4. avoid turning the page into marketing fluff;
> 5. if multiple similar phrases repeat across the page, normalize them into one cleaner style;
> 6. update the mirror Markdown if needed;
> 7. record one short evolution note summarizing what changed in tone or wording.

## Writing standard

- Prefer direct statements over defensive contrast.
- Prefer `这里收拢了...` over `不只讲...`.
- Prefer `这块把...收成...` over `这块不只列...`.
- Prefer one clean judgment per sentence.
- Keep intros short; do not make the page explain itself for too long before giving value.
- Preserve technical specificity.
- Avoid generic product-ad slogans.
- If a page is a hub, make it sound like an entry map.
- If a page is a deep-dive, make it sound like a reading guide.
- If a page is a workspace/control surface, make it sound operational rather than promotional.

## Watch list

- `不只讲`
- `不只列`
- `不是……而是……`
- repeated `这页最值得...`
- repeated `如果你最近也在看...`
- intros that spend too long explaining the page before naming the actual value

## Audit mode

Treat this as a site-wide sweep task, not only a local wording cleanup task.

Run in this order:

1. scan the whole site for repeated rhetorical patterns;
2. group hits into batches:
   - homepage / global entry copy
   - hub topics
   - unpacked pages
   - workspace / dashboard pages
   - paper / research pages
3. fix one batch per bounded pass;
4. keep a short running inventory of what has been cleaned and what still repeats.

Do not rewrite the whole site in one pass.  
Do not treat every `不是` as a bug; only tighten it when it creates drag, repetition, or over-explanation.

## Current audit snapshot

- `不只讲`: 2 direct hits in current scan
- `不只列`: 0 direct hits in current scan
- `不是`: many broad hits across the site; these need selective review, not blind replacement
- homepage copy has already received the first cleanup pass

The next sweep should prioritize:

1. high-traffic hubs
2. first-screen hero / intro copy
3. navigation-adjacent helper text
4. repeated unpacked-page openings

## Priority targets

- [x] Homepage hero subtitle
- [x] Homepage portal-map helper copy
- [ ] `site/topic-site-map.html` intro and map captions
- [ ] `site/topic-loop-task-board.html` dashboard helper copy
- [ ] `site/topic-design-ui*.html` intro paragraphs
- [ ] `site/topic-ai-scientist.html` and nearby hub summaries
- [ ] Build a first full-batch audit table for the remaining high-traffic pages

## Validation

- [ ] `python3 tools/check_site_md_parity.py`
- [ ] Spot-check edited pages for shorter, cleaner first-screen copy
- [ ] Confirm the page still sounds like the same site, just tighter

## Notes

- 2026-04-13: this task exists because homepage copy drifted toward explanatory contrast phrasing that felt verbose in Chinese (`不只讲 / 不只列 / 不是...而是...`).
- 2026-04-13: first bounded pass already tightened the homepage hero and portal-map helper copy without changing page structure.
- 2026-04-13: a first site-wide string scan confirms this task should be treated as a full-site wording audit, not just a homepage polish task; exact `不只讲` usage is already rare, while `不是` appears broadly and needs selective review rather than global replacement.
