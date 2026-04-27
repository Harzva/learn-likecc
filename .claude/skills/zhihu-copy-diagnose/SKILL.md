---
name: zhihu-copy-diagnose
description: Diagnose a Zhihu Markdown draft before publishing. Use when a Zhihu article needs a final copy audit for AI-flavored phrasing, professionalism, readability, and evidence strength, especially before calling zhihu-publish.
user-invocable: true
---

# Zhihu Copy Diagnose

Use this skill right before publishing a Zhihu draft, or when a user asks to check whether a draft still feels too AI-generated.

## What this skill checks

Run the local diagnosis script against a target Zhihu Markdown draft:

- AI-flavored template phrasing
- professionalism of tone
- readability / over-explanation drag
- evidence density

The script can return either:

- `PASS`
- `WARN`
- `BLOCK`

If the result is `BLOCK`, the default action is:

- **先别发**
- fix the flagged wording first

## Default workflow

1. Confirm the target draft path under `wemedia/zhihu/articles/`.
2. Run:

```bash
python3 .claude/skills/zhihu-copy-diagnose/scripts/audit_zhihu_copy.py /abs/path/to/article.md
```

3. Read the diagnosis summary.
4. Review the auto-generated `rewrite-suggestions.md` file written next to the target article path.
5. If needed, open the companion `rewrite-patch.md` file for paragraph-level replacement drafts.
6. If the result is `BLOCK`, revise the draft before using `zhihu-publish`.
7. If the result is `WARN`, keep publishing only if the remaining issues are acceptable and evidence is still strong.

## Decision rule

- `PASS`: can proceed to `zhihu-publish`
- `WARN`: fix if easy, otherwise publish only if the article is otherwise ready
- `BLOCK`: do not publish yet

## When to treat a result as serious

Treat the diagnosis as effectively blocking when:

- repeated `不是……而是……` style contrast chains are still present
- hype words or slogan-like claims dominate the article
- evidence is thin relative to the strength of the claims
- the prose feels like template-generated commentary rather than a technical article
- the article reads mostly like recommendation copy or praise copy while lacking concrete technical substance
- the article keeps citing code paths as core evidence but never shows the relevant code excerpt

## Script path

- `/home/clashuser/hzh/item_bo/learn-likecc/.claude/skills/zhihu-copy-diagnose/scripts/audit_zhihu_copy.py`

## Notes

- This skill is a final prepublish gate, not a replacement for `gen-zhihu-article`.
- Use it together with `zhihu-publish` when a draft is otherwise ready.
- By default the script writes both `rewrite-suggestions.md` and `rewrite-patch.md` next to the target article path.
