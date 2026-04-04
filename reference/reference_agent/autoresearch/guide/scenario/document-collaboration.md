# Scenario: Document Collaboration

> Explore failure modes in real-time collaborative editing: conflict resolution, operational transforms, permission changes, version history, and offline sync.

---

## The Command

```
/autoresearch:scenario --domain software --depth deep --focus concurrent
Scenario: Multiple users simultaneously edit a shared document with real-time sync, commenting, suggesting mode, and version history
Iterations: 35
```

---

## What This Explores

Real-time collaboration is a distributed systems problem disguised as a productivity feature. Multiple users editing the same paragraph, cursor positions that must track across remote changes, permission changes that take effect mid-edit, and offline edits that must merge without data loss — all while maintaining the illusion of a single coherent document.

**Key dimensions weighted:**
- **Concurrent** — two users editing same paragraph, cursor tracking, selection conflicts
- **State transition** — suggesting mode → editing mode, permission change during active edit, document lock
- **Permission** — viewer gaining edit access mid-session, comment-only user, link sharing scope
- **Recovery** — offline edits merging on reconnect, version restore while others are editing
- **Data variation** — RTL text mixed with LTR, large table insertion, embedded media, code blocks

---

## Example Situations Generated

### Situation #1 — Two users edit the same sentence simultaneously
**Dimension:** Concurrent | **Severity:** High

**Preconditions:**
- User A and User B both have edit access to the document
- Both place their cursor in the same sentence: "The quick brown fox"

**Situation:**
User A changes "brown" to "red" while User B simultaneously changes "brown" to "blue". Both changes arrive at the server within 100ms.

**Expected Outcome:**
Operational Transform (OT) or CRDT resolves deterministically. One user's change wins based on a consistent tiebreaker (e.g., user ID ordering). The other user sees their change replaced with a brief highlight showing the conflict was resolved. Result: "The quick red fox" (or blue, consistently).

**Failure Signal:**
Document shows "The quick redblue fox" (concatenated changes). Or users see different final states. Or the sentence disappears entirely.

**Mitigations:**
- CRDT (Conflict-free Replicated Data Type) for character-level merge
- Last-writer-wins with consistent ordering (timestamp + user ID tiebreaker)
- Visual indicator when a remote edit overwrites local uncommitted change

---

### Situation #2 — Permission revoked during active editing session
**Dimension:** Permission | **Severity:** High

**Preconditions:**
- User B has edit access and is actively typing in the document
- Document owner revokes User B's edit access, changing them to viewer

**Situation:**
User B has typed 3 paragraphs of unsaved content in their local buffer. Permission change propagates to the server. User B's next sync attempt is rejected.

**Expected Outcome:**
User B receives a clear notification: "Your access has been changed to view-only. Your recent edits have been saved to your clipboard." Unsaved content is preserved locally, not silently discarded.

**Failure Signal:**
User B's 3 paragraphs of work are silently lost. Or the UI freezes in an inconsistent state — edit toolbar visible but all actions fail with 403.

**Mitigations:**
- Grace period: pending local operations are flushed to server before permission change takes effect
- If flush fails: save unsaved content to user's local clipboard/drafts
- Immediate UI update: switch to viewer mode with toast notification explaining what happened

---

### Situation #3 — Offline edits from two users merge on reconnect
**Dimension:** Recovery | **Severity:** High

**Preconditions:**
- User A goes offline and edits paragraphs 3-5
- User B (online) edits paragraphs 4-6 during the same period

**Situation:**
User A reconnects after 30 minutes. Their offline edits (paragraphs 3-5) must merge with User B's online edits (paragraphs 4-6). Paragraphs 4-5 were edited by both users.

**Expected Outcome:**
CRDT/OT merge produces a coherent document. Conflicting sections in paragraphs 4-5 are merged at character level. User A sees a "merged offline changes" notification with the option to review what changed.

**Failure Signal:**
User A's offline edits overwrite User B's changes entirely. Or vice versa. Or paragraphs are duplicated. Or the document enters a corrupt state requiring version restore.

**Mitigations:**
- CRDT with vector clocks: offline operations are timestamped and merged causally
- Conflict markers for irreconcilable changes (similar to git merge conflicts)
- Automatic snapshot before merging offline changes — easy rollback if merge produces garbage

---

### Situation #4 — Version restore while 3 users are editing
**Dimension:** State transition | **Severity:** High

**Preconditions:**
- Document has 50 versions in history
- 3 users are actively editing the current version
- Document owner clicks "Restore version 42"

**Situation:**
Document content is replaced with version 42's content. The 3 active editors have local buffers with changes based on the current (version 50) content. Their pending operations reference positions that no longer exist.

**Expected Outcome:**
Version restore creates a new version (51) with version 42's content. Active editors receive: "Document was restored to an earlier version. Your recent changes are available in version history." Their local buffers are discarded, but their contributions exist in versions 48-50.

**Failure Signal:**
Active editors' pending operations apply to version 42 content at wrong positions, corrupting the document. Or editors' local state diverges from server state permanently.

**Mitigations:**
- Version restore = new version (not overwrite), preserving full history
- Broadcast "document reset" event to all connected clients, forcing full re-sync
- Active editors' unsaved work is auto-saved as a named version before restore

---

### Situation #5 — Large table paste crashes collaborative sync
**Dimension:** Data variation | **Severity:** Medium

**Preconditions:**
- User pastes a 500-row × 20-column table from Excel
- 2 other users are actively viewing the document

**Situation:**
The paste generates 10,000+ OT operations (one per cell). Broadcasting these operations to connected clients causes a sync backlog. Other users see the document freeze for 15 seconds as operations replay.

**Expected Outcome:**
Large paste is batched as a single compound operation. Connected clients receive one "insert table" event, not 10,000 cell events. Render is progressive — table frame appears immediately, cells populate asynchronously.

**Failure Signal:**
Document freezes for all users during paste. WebSocket connection drops due to message backlog. Some users see a partially rendered table with missing cells.

**Mitigations:**
- Batch compound operations: group paste into a single operation at the wire protocol level
- Progressive rendering: skeleton table with cells populating in viewport-priority order
- Operation compression: consecutive cell inserts in the same table merged server-side before broadcast

---

### Situation #6 — Comment thread on deleted text
**Dimension:** State transition | **Severity:** Low

**Preconditions:**
- User A comments on the sentence "Revenue grew 15% in Q3"
- Comment thread has 4 replies discussing the figure

**Situation:**
User B deletes the entire paragraph containing the commented sentence. The text anchor for the comment thread no longer exists.

**Expected Outcome:**
Comment thread is orphaned but preserved — shown in a "resolved/orphaned comments" sidebar with the original text context. Not silently deleted.

**Failure Signal:**
Comment thread and its 4 replies are permanently deleted when anchor text is removed. Participants lose their discussion with no notification.

**Mitigations:**
- Comments store a snapshot of their anchor text at creation time
- Orphaned comments move to a "detached comments" panel with original context
- Notification to comment participants: "The text this comment references was removed by User B"

---

## Chain It

### scenario → debug → fix
```bash
/autoresearch:debug
Scope: src/collaboration/**, src/crdt/**, src/sync/**
Symptom: Concurrent editing bugs — merge conflicts, cursor drift, operation ordering
Iterations: 20

/autoresearch:fix --from-debug
Guard: npm test
Iterations: 25
```

### scenario → security
```bash
# Audit permission model and data isolation
/autoresearch:security
Scope: src/collaboration/**, src/permissions/**, src/sharing/**
Focus: Permission bypass, link sharing scope, edit injection via WebSocket
Iterations: 15
```

### predict → scenario
```bash
/autoresearch:predict --chain scenario,debug,fix
Scope: src/collaboration/**
Goal: Ensure collaborative editing handles all concurrency edge cases
```

---

## Tips

**CRDTs and OT have different failure profiles.** If your system uses OT, focus on `--focus concurrent` (operation ordering is the weak point). If CRDT, focus on `--focus recovery` (offline merge is the weak point). Run the appropriate focused scenario.

**Test with 3+ concurrent editors, not just 2.** Two-user conflicts have well-known solutions. Three-user conflicts reveal ordering assumptions that break when the conflict graph has cycles. Set up test scenarios with 3-5 simultaneous editors.

**Permission changes during active sessions are underexplored.** Most collaboration systems test permissions at session start. Run a dedicated scenario: `/autoresearch:scenario --depth shallow --focus permission` with `Scenario: Document permission changes while multiple users have active editing sessions`.

---

<div align="center">

**[Scenario Guides](README.md)** | **[Scenario Command Reference](../autoresearch-scenario.md)** | **[Chains & Combinations](../chains-and-combinations.md)**

</div>
