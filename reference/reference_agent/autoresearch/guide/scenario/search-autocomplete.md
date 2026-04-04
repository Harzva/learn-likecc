# Scenario: Search Autocomplete

> Explore failure modes in search autocomplete and suggestions: ranking algorithms, typo tolerance, personalization, abuse prevention, and performance under load.

---

## The Command

```
/autoresearch:scenario --domain software --depth standard --focus edge-cases
Scenario: User types a search query and receives real-time autocomplete suggestions — with typo correction, personalization, trending results, and abuse-resistant ranking
Iterations: 25
```

---

## What This Explores

Search autocomplete is deceptively simple — show suggestions as the user types. But under the surface: ranking must balance relevance, popularity, and personalization; typo tolerance must handle multiple languages; suggestions must update in <100ms; and the system must resist manipulation by adversarial actors trying to inject suggestions.

**Key dimensions weighted:**
- **Edge case** — empty query, single character, emoji-only, extremely long query, special characters
- **Scale** — 10,000 queries/second, suggestion index update latency, cold cache performance
- **Data variation** — multilingual queries, mixed-script input, RTL languages, CJK characters
- **Abuse** — suggestion bombing, SEO manipulation, offensive suggestion injection
- **Temporal** — trending queries spike, seasonal suggestions, stale popular suggestions

---

## Example Situations Generated

### Situation #1 — Typo in the first character defeats prefix matching
**Dimension:** Edge case | **Severity:** High

**Preconditions:**
- User wants to search for "restaurant"
- Autocomplete uses prefix-based trie matching

**Situation:**
User types "restaruant" (typo: 'r' and 'u' swapped). Prefix matching fails because "restar..." doesn't match any suggestion prefix. User sees zero suggestions despite "restaurant" being the #1 query.

**Expected Outcome:**
Fuzzy matching kicks in after 3+ characters with no exact prefix match. Suggestions show: "restaurant" (did you mean?), "restaurant near me", "restaurant reservations". Edit distance ≤ 2 considered.

**Failure Signal:**
Empty suggestion dropdown for a common query. User manually corrects the typo or abandons the search. Autocomplete provides zero value for typo-prone queries.

**Mitigations:**
- Hybrid matching: prefix match first, fallback to edit-distance matching (Levenshtein ≤ 2)
- Phonetic matching (Soundex/Metaphone) for queries that sound right but are spelled wrong
- n-gram index alongside prefix trie for substring matching

---

### Situation #2 — Offensive suggestion from trending query injection
**Dimension:** Abuse | **Severity:** Critical

**Preconditions:**
- Autocomplete suggestions are partially derived from trending search volume
- A coordinated group submits 50,000 searches for an offensive phrase within 1 hour

**Situation:**
The offensive phrase enters the "trending" suggestion pool. Users typing the first 3 characters of a common word see the offensive phrase as the top autocomplete suggestion. Screenshots go viral on social media.

**Expected Outcome:**
Trending suggestions pass through a blocklist filter before entering the suggestion index. Sudden volume spikes trigger anomaly detection: "Query 'xyz' volume spiked 10,000% in 1 hour — held for review."

**Failure Signal:**
Offensive suggestion displayed to millions of users before manual review catches it. PR crisis. App store review complaints.

**Mitigations:**
- Blocklist filter on all suggestions before display (profanity, hate speech, slurs)
- Anomaly detection on suggestion volume: sudden spikes require human approval before surfacing
- New/unseen suggestions have a quarantine period (12h) before they can appear in autocomplete
- Separate "editorial" vs "organic" suggestion tracks with different trust levels

---

### Situation #3 — CJK (Chinese/Japanese/Korean) input with IME composition
**Dimension:** Data variation | **Severity:** Medium

**Preconditions:**
- User is typing in Japanese using an IME (Input Method Editor)
- IME has a composition state where characters are underlined/highlighted before being committed

**Situation:**
Autocomplete fires on every keystroke. During IME composition, the input field contains incomplete kana that will become kanji on commit. Autocomplete searches for the incomplete kana, returning irrelevant suggestions. When the user commits the kanji, autocomplete fires again with the correct query.

**Expected Outcome:**
Autocomplete detects IME composition state and suppresses suggestions until composition is committed. Suggestions only fire on `compositionend` event, not on intermediate `input` events.

**Failure Signal:**
Suggestion dropdown flickers rapidly during IME composition, showing irrelevant results. Dropdown may cover the IME candidate list, making character selection difficult.

**Mitigations:**
- Listen for `compositionstart`/`compositionend` events — suppress autocomplete during composition
- Debounce autocomplete with longer delay (300ms) for CJK locales
- If composition is detected, show a subtle "typing..." indicator instead of suggestions

---

### Situation #4 — Personalized suggestions leak private search history
**Dimension:** Permission | **Severity:** Critical

**Preconditions:**
- Autocomplete personalizes suggestions based on user's search history
- User searches on a shared/public computer (library, kiosk)

**Situation:**
Next user starts typing "h" and sees personalized suggestions from the previous user: "how to file for divorce", "hepatitis symptoms", "help for depression". Private search history is exposed.

**Expected Outcome:**
Personalized suggestions are tied to authenticated sessions only. Shared/public computers are detected (no persistent auth, incognito mode) and receive only generic popular suggestions. Session cleanup clears personalization data.

**Failure Signal:**
Sensitive search history visible to the next user. Privacy violation. Potential legal liability.

**Mitigations:**
- Personalization requires authenticated session — anonymous sessions get only generic suggestions
- "Clear recent searches" prominently accessible in the autocomplete dropdown
- Session timeout (15 min inactivity) clears personalization cache
- Incognito/private browsing mode: zero personalization, zero history

---

### Situation #5 — Suggestion index stale after catalog update
**Dimension:** Temporal | **Severity:** Medium

**Preconditions:**
- E-commerce site with 500,000 products
- 5,000 new products added overnight (catalog import)
- Autocomplete suggestion index is rebuilt nightly

**Situation:**
Marketing sends a newsletter at 9:00 AM promoting the new product line. Customers click through and search for the new products. Autocomplete returns zero suggestions because the index hasn't rebuilt yet (scheduled for 2:00 AM next day).

**Expected Outcome:**
Suggestion index supports incremental updates. New products are indexed within 15 minutes of catalog import. Or: real-time fallback query against the product database when suggestion index has no match.

**Failure Signal:**
Customers searching for promoted products see no suggestions. Conversion rate drops. Support tickets: "I can't find the product from the email."

**Mitigations:**
- Incremental suggestion index updates (triggered by catalog changes, not just nightly rebuild)
- Real-time fallback: if trie returns zero results, query product database directly with LIKE/trigram matching
- Pre-warm suggestion index before marketing campaigns launch

---

### Situation #6 — Query "a]" crashes regex-based suggestion filter
**Dimension:** Edge case | **Severity:** Medium

**Preconditions:**
- Suggestion matching uses a regex constructed from user input
- Input sanitization is incomplete

**Situation:**
User types `a]` (or `a[`, `a(`, `a*`). The regex engine throws an "unterminated character class" exception. Autocomplete endpoint returns 500. Client silently fails — no suggestions for any subsequent keystrokes until page reload.

**Expected Outcome:**
User input is escaped before regex construction. `a]` matches literally. No server error. Suggestions for queries starting with "a" are returned normally.

**Failure Signal:**
500 error logged. Autocomplete silently breaks for the user's entire session. If error rate is high enough, monitoring alerts fire.

**Mitigations:**
- Escape all regex special characters in user input before constructing patterns
- Use literal string matching (trie/prefix) instead of regex for autocomplete
- Client-side: if autocomplete endpoint returns 5xx, retry once, then degrade gracefully (hide dropdown, don't block search)

---

## Chain It

### scenario → debug
```bash
/autoresearch:debug
Scope: src/search/**, src/autocomplete/**, src/suggestions/**
Symptom: Edge cases — regex crash, CJK IME handling, stale index, typo tolerance gaps
Iterations: 15
```

### scenario → security
```bash
# Audit for injection, suggestion manipulation, and privacy leaks
/autoresearch:security
Scope: src/search/**, src/autocomplete/**
Focus: Regex injection, suggestion bombing, personalization privacy, XSS in suggestion display
Iterations: 10
```

### predict → scenario
```bash
/autoresearch:predict --chain scenario,debug,fix
Scope: src/search/**
Goal: Harden autocomplete against edge cases and adversarial manipulation
```

---

## Tips

**Performance IS the feature.** Autocomplete must respond in <100ms. Any scenario that adds latency (fuzzy matching, personalization lookup, real-time fallback) must be evaluated against the latency budget. Run a performance-focused loop after scenarios: `/autoresearch` with metric: "p95 autocomplete latency."

**Test with real typo patterns, not random mutations.** Common typos follow keyboard adjacency patterns (e.g., 'e' and 'r' are adjacent). Use real typo datasets or keyboard-distance models for realistic fuzzy matching evaluation.

**Multilingual autocomplete is a separate problem.** CJK, Arabic (RTL), and Latin scripts have fundamentally different input methods. Run a dedicated scenario: `/autoresearch:scenario --depth standard --focus data-variation` with `Scenario: Multilingual search autocomplete supporting English, Japanese, Arabic, and Korean input`.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
